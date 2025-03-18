package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/plant-care/auth-service/models"
)

type JWTClaims struct {
	Username    string   `json:"username"`
	UserID      string   `json:"user_id"`
	Role        string   `json:"role"`
	Greenhouses []string `json:"greenhouses"`
	jwt.RegisteredClaims
}

var keyStore *models.KeyStore

func InitKeyStore(secretKey string) {
	keyStore = models.NewKeyStore(secretKey)
}

func GetKeyStore() *models.KeyStore {
	return keyStore
}

func GenerateJWT(userID, username, role string, greenhouses []string, expirationTime time.Duration) (string, error) {
	if keyStore == nil {
		return "", fmt.Errorf("keyStore chưa được khởi tạo")
	}

	privateKey, err := keyStore.LoadPrivateKey(models.DefaultKeyID)
	if err != nil {
		return "", fmt.Errorf("không thể tải private key: %v", err)
	}

	expiresAt := time.Now().Add(expirationTime)

	claims := JWTClaims{
		UserID:      userID,
		Username:    username,
		Role:        role,
		Greenhouses: greenhouses,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "plant-care-auth-service",
			Subject:   username,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	tokenString, err := token.SignedString(privateKey)
	if err != nil {
		return "", fmt.Errorf("không thể ký JWT: %v", err)
	}

	return tokenString, nil
}

func VerifyJWT(tokenString string) (*JWTClaims, error) {
	if keyStore == nil {
		return nil, fmt.Errorf("keyStore chưa được khởi tạo")
	}

	publicKey, err := keyStore.LoadPublicKey(models.DefaultKeyID)
	if err != nil {
		return nil, fmt.Errorf("không thể tải public key: %v", err)
	}

	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("thuật toán ký không hợp lệ: %v", token.Header["alg"])
		}
		return publicKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("không thể parse JWT: %v", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("token không hợp lệ")
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return nil, fmt.Errorf("không thể lấy claims từ token")
	}

	return claims, nil
}

func GetPublicKeyPEMFromStore() ([]byte, error) {
	if keyStore == nil {
		return nil, fmt.Errorf("keyStore chưa được khởi tạo")
	}

	return keyStore.GetPublicKeyPEM(models.DefaultKeyID)
}
