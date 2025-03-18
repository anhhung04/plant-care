package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	DefaultMongoURI = "mongodb://localhost:27017"
	DatabaseName    = "plant_care"
	UserCollection  = "users"
	KeyCollection   = "keys"
)

var Database *mongo.Database

func ConnectDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = DefaultMongoURI
	}

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Không thể kết nối đến MongoDB: %v", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Không thể ping đến MongoDB: %v", err)
	}

	Database = client.Database(DatabaseName)
	log.Println("Đã kết nối thành công đến MongoDB")
}

func GetCollection(collectionName string) *mongo.Collection {
	return Database.Collection(collectionName)
}
