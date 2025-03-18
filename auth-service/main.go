package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/plant-care/auth-service/config"
	"github.com/plant-care/auth-service/controllers"
	"github.com/plant-care/auth-service/models"
	"github.com/plant-care/auth-service/utils"
)

const (
	DefaultSecretKey = "plant-care-auth-service-secret-key"
)

func main() {
	router := gin.Default()

	config.ConnectDB()

	secretKey := os.Getenv("SECRET_KEY")
	if secretKey == "" {
		secretKey = DefaultSecretKey
	}
	utils.InitKeyStore(secretKey)
	keyStore := utils.GetKeyStore()

	exists, err := keyStore.KeyExists(models.DefaultKeyID)
	if err != nil {
		log.Printf("Lỗi khi kiểm tra keys: %v", err)
	}

	if !exists {
		log.Println("Tạo cặp khóa RSA mới...")
		if err := keyStore.GenerateAndStoreRSAKeys(models.DefaultKeyID); err != nil {
			log.Fatalf("Không thể tạo cặp khóa RSA: %v", err)
		}
		log.Println("Đã tạo cặp khóa RSA thành công")
	} else {
		log.Println("Đã tìm thấy cặp khóa RSA")
	}

	userStore := models.NewUserStore()
	if err := userStore.InitDefaultUsers(); err != nil {
		log.Printf("Lỗi khi tạo users mặc định: %v", err)
	}

	authController := controllers.NewAuthController(userStore)

	router.POST("/login", authController.Login)
	router.GET("/public-key", authController.GetPublicKey)

	log.Println("Server đang chạy tại http://localhost:8080")
	if err := router.Run("0.0.0.0:8080"); err != nil {
		log.Fatalf("Không thể khởi động server: %v", err)
	}
}
