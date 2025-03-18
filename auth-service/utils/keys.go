package utils

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	"path/filepath"
)

const (
	KeyDir = "keys"
	PrivateKeyFile = "private.pem"
	PublicKeyFile = "public.pem"
)

func GenerateRSAKeys() error {
	if err := os.MkdirAll(KeyDir, 0755); err != nil {
		return fmt.Errorf("không thể tạo thư mục keys: %v", err)
	}

	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return fmt.Errorf("không thể tạo private key: %v", err)
	}

	privateKeyBytes := x509.MarshalPKCS1PrivateKey(privateKey)
	privateKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privateKeyBytes,
	})

	privateKeyPath := filepath.Join(KeyDir, PrivateKeyFile)
	if err := os.WriteFile(privateKeyPath, privateKeyPEM, 0600); err != nil {
		return fmt.Errorf("không thể lưu private key: %v", err)
	}

	publicKey := &privateKey.PublicKey
	publicKeyBytes, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		return fmt.Errorf("không thể tạo public key: %v", err)
	}

	publicKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PUBLIC KEY",
		Bytes: publicKeyBytes,
	})

	publicKeyPath := filepath.Join(KeyDir, PublicKeyFile)
	if err := os.WriteFile(publicKeyPath, publicKeyPEM, 0644); err != nil {
		return fmt.Errorf("không thể lưu public key: %v", err)
	}

	return nil
}

func LoadPrivateKey() (*rsa.PrivateKey, error) {
	privateKeyPath := filepath.Join(KeyDir, PrivateKeyFile)
	privateKeyPEM, err := os.ReadFile(privateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("không thể đọc private key: %v", err)
	}

	block, _ := pem.Decode(privateKeyPEM)
	if block == nil {
		return nil, fmt.Errorf("không thể giải mã private key PEM")
	}

	privateKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("không thể phân tích private key: %v", err)
	}

	return privateKey, nil
}

func LoadPublicKey() (*rsa.PublicKey, error) {
	publicKeyPath := filepath.Join(KeyDir, PublicKeyFile)
	publicKeyPEM, err := os.ReadFile(publicKeyPath)
	if err != nil {
		return nil, fmt.Errorf("không thể đọc public key: %v", err)
	}

	block, _ := pem.Decode(publicKeyPEM)
	if block == nil {
		return nil, fmt.Errorf("không thể giải mã public key PEM")
	}

	publicKeyInterface, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("không thể phân tích public key: %v", err)
	}

	publicKey, ok := publicKeyInterface.(*rsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("không phải là RSA public key")
	}

	return publicKey, nil
}

func GetPublicKeyPEM() ([]byte, error) {
	publicKeyPath := filepath.Join(KeyDir, PublicKeyFile)
	return os.ReadFile(publicKeyPath)
}

func CheckKeysExist() bool {
	privateKeyPath := filepath.Join(KeyDir, PrivateKeyFile)
	publicKeyPath := filepath.Join(KeyDir, PublicKeyFile)

	_, errPrivate := os.Stat(privateKeyPath)
	_, errPublic := os.Stat(publicKeyPath)

	return errPrivate == nil && errPublic == nil
}
