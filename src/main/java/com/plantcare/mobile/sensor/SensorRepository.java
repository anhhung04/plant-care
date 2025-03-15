package com.plantcare.mobile.sensor;


import java.util.ArrayList;
import java.util.List;

import com.plantcare.mobile.sensor.entities.Sensor;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Repository;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

@Repository
public class SensorRepository {

    private final MongoCollection<Document> sensorCollection;

    public SensorRepository(MongoDatabase mongoDatabase) {
        this.sensorCollection = mongoDatabase.getCollection("Sensor");
    }

    public List<Sensor> getAll() {
        List<Sensor> sensors = new ArrayList<>();
        for (Document doc : sensorCollection.find()) {
            sensors.add(mapToSensor(doc));
        }
        return sensors;
    }

    public Sensor get(String id) {
        Document doc =
                sensorCollection.find(new Document("_id", new ObjectId(id))).first();
        return doc != null ? mapToSensor(doc) : null;
    }

    public Sensor update(String id, Document updateFields) {

        if (!updateFields.isEmpty()) {
            Document updateDoc = new Document("$set", updateFields);
            sensorCollection.updateOne(new Document("_id", new ObjectId(id)), updateDoc);
        }

        return get(id);
    }

    public boolean enable(String id) {
        return updateStatus(id, true);
    }

    public boolean disable(String id) {
        return updateStatus(id, false);
    }

    private boolean updateStatus(String id, boolean status) {
        Document updateDoc = new Document("$set", new Document("isEnabled", status));
        return sensorCollection
                .updateOne(new Document("_id", new ObjectId(id)), updateDoc)
                .getModifiedCount()
                > 0;
    }

    public Sensor mapToSensor(Document doc) {
        return new Sensor(
                doc.getObjectId("_id").toHexString(),
                doc.getString("name"),
                doc.getString("value"),
                doc.getBoolean("enabled", false));
    }
}