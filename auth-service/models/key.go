package models

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"io"
	"time"

	"github.com/plant-care/auth-service/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	KeyCollection = "keys"
	DefaultKeyID  = "default"
)

type Key struct {
	ID           string    `bson:"_id" json:"id"`
	PrivateKey   string    `bson:"privateKey" json:"-"`
	PublicKey    string    `bson:"publicKey" json:"publicKey"`
	CreatedAt    time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time `bson:"updatedAt" json:"updatedAt"`
	EncryptionIV string    `bson:"encryptionIV" json:"-"`
}

type KeyStore struct {
	collection *mongo.Collection
	secretKey  []byte
}

func NewKeyStore(secretKey string) *KeyStore {
	key := make([]byte, 32)
	copy(key, []byte(secretKey))

	return &KeyStore{
		collection: config.GetCollection(KeyCollection),
		secretKey:  key,
	}
}

func (s *KeyStore) encryptPrivateKey(privateKeyPEM []byte) (string, string, error) {
	block, err := aes.NewCipher(s.secretKey)
	if err != nil {
		return "", "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", "", err
	}

	ciphertext := gcm.Seal(nil, nonce, privateKeyPEM, nil)

	encryptedKey := base64.StdEncoding.EncodeToString(ciphertext)
	nonceStr := base64.StdEncoding.EncodeToString(nonce)

	return encryptedKey, nonceStr, nil
}

func (s *KeyStore) decryptPrivateKey(encryptedKey, nonceStr string) ([]byte, error) {
	ciphertext, err := base64.StdEncoding.DecodeString(encryptedKey)
	if err != nil {
		return nil, err
	}

	nonce, err := base64.StdEncoding.DecodeString(nonceStr)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(s.secretKey)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

func (s *KeyStore) StoreKeys(privateKey *rsa.PrivateKey, id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	privateKeyBytes := x509.MarshalPKCS1PrivateKey(privateKey)
	privateKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privateKeyBytes,
	})

	encryptedKey, iv, err := s.encryptPrivateKey(privateKeyPEM)
	if err != nil {
		return err
	}

	publicKey := &privateKey.PublicKey
	publicKeyBytes, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		return err
	}

	publicKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PUBLIC KEY",
		Bytes: publicKeyBytes,
	})

	now := time.Now()

	key := Key{
		ID:           id,
		PrivateKey:   encryptedKey,
		PublicKey:    string(publicKeyPEM),
		CreatedAt:    now,
		UpdatedAt:    now,
		EncryptionIV: iv,
	}

	opts := options.Update().SetUpsert(true)
	filter := bson.M{"_id": id}
	update := bson.M{"$set": key}

	_, err = s.collection.UpdateOne(ctx, filter, update, opts)
	return err
}

func (s *KeyStore) LoadPrivateKey(id string) (*rsa.PrivateKey, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var key Key
	err := s.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&key)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("không tìm thấy key")
		}
		return nil, err
	}

	privateKeyPEM, err := s.decryptPrivateKey(key.PrivateKey, key.EncryptionIV)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(privateKeyPEM)
	if block == nil {
		return nil, errors.New("không thể giải mã private key PEM")
	}

	privateKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	return privateKey, nil
}

func (s *KeyStore) LoadPublicKey(id string) (*rsa.PublicKey, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var key Key
	err := s.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&key)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("không tìm thấy key")
		}
		return nil, err
	}

	block, _ := pem.Decode([]byte(key.PublicKey))
	if block == nil {
		return nil, errors.New("không thể giải mã public key PEM")
	}

	publicKeyInterface, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	publicKey, ok := publicKeyInterface.(*rsa.PublicKey)
	if !ok {
		return nil, errors.New("không phải là RSA public key")
	}

	return publicKey, nil
}

func (s *KeyStore) GetPublicKeyPEM(id string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var key Key
	err := s.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&key)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("không tìm thấy key")
		}
		return nil, err
	}

	return []byte(key.PublicKey), nil
}

func (s *KeyStore) KeyExists(id string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count, err := s.collection.CountDocuments(ctx, bson.M{"_id": id})
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (s *KeyStore) GenerateAndStoreRSAKeys(id string) error {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return err
	}

	return s.StoreKeys(privateKey, id)
}
