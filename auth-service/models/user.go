package models

import (
	"context"
	"errors"
	"time"

	"github.com/plant-care/auth-service/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Username     string             `bson:"username" json:"username"`
	PasswordHash string             `bson:"passwordHash" json:"-"`
	Role         string             `bson:"role" json:"role"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type GreenhouseAccess struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID       primitive.ObjectID `bson:"userId" json:"userId"`
	GreenhouseID string             `bson:"greenhouseId" json:"greenhouseId"`
	AccessLevel  string             `bson:"accessLevel" json:"accessLevel"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type UserStore struct {
	collection *mongo.Collection
}

func NewUserStore() *UserStore {
	return &UserStore{
		collection: config.GetCollection(config.UserCollection),
	}
}

func (s *UserStore) CreateUser(username, password, role string) (*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count, err := s.collection.CountDocuments(ctx, bson.M{"username": username})
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, errors.New("username đã tồn tại")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	user := &User{
		Username:     username,
		PasswordHash: string(hashedPassword),
		Role:         role,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	result, err := s.collection.InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}

	user.ID = result.InsertedID.(primitive.ObjectID)
	return user, nil
}

func (s *UserStore) GetUser(username string) (*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user User
	err := s.collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("không tìm thấy người dùng")
		}
		return nil, err
	}

	return &user, nil
}

func (s *UserStore) Authenticate(username, password string) (*User, error) {
	user, err := s.GetUser(username)
	if err != nil {
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return nil, errors.New("mật khẩu không đúng")
	}

	return user, nil
}

func (s *UserStore) GetUserGreenhouses(userID primitive.ObjectID) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.GetCollection("greenhouse_access").Find(ctx, bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var greenhouseIDs []string
	for cursor.Next(ctx) {
		var access GreenhouseAccess
		if err := cursor.Decode(&access); err != nil {
			return nil, err
		}
		greenhouseIDs = append(greenhouseIDs, access.GreenhouseID)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return greenhouseIDs, nil
}

func (s *UserStore) InitDefaultUsers() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count, err := s.collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return err
	}

	if count > 0 {
		return nil
	}

	_, err = s.CreateUser("admin", "admin123", "admin")
	if err != nil {
		return err
	}

	_, err = s.CreateUser("user", "user123", "user")
	if err != nil {
		return err
	}

	return nil
}
