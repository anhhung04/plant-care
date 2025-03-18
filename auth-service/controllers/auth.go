package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/plant-care/auth-service/models"
	"github.com/plant-care/auth-service/utils"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}
type LoginResponse struct {
	Token   string `json:"token"`
	Message string `json:"message"`
}
type AuthController struct {
	userStore *models.UserStore
}

func NewAuthController(userStore *models.UserStore) *AuthController {
	return &AuthController{
		userStore: userStore,
	}
}
func (c *AuthController) Login(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "dữ liệu không hợp lệ"})
		return
	}
	user, err := c.userStore.Authenticate(req.Username, req.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	greenhouses, err := c.userStore.GetUserGreenhouses(user.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "không thể lấy thông tin greenhouse"})
		return
	}

	token, err := utils.GenerateJWT(user.ID.Hex(), user.Username, user.Role, greenhouses, 24*time.Hour)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "không thể tạo token"})
		return
	}
	ctx.JSON(http.StatusOK, LoginResponse{
		Token:   token,
		Message: "đăng nhập thành công",
	})
}
func (c *AuthController) GetPublicKey(ctx *gin.Context) {
	publicKeyPEM, err := utils.GetPublicKeyPEMFromStore()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("không thể lấy public key: %v", err)})
		return
	}
	ctx.Data(http.StatusOK, "application/x-pem-file", publicKeyPEM)
}
