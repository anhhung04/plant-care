from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import pymongo
import requests
import logging
import os
import time

from fan_control.infer_fan_control import predict_fan
from pump_control.infer_pump_control import predict_with_partial_input
from led_control.infer_led_control import predict_led_on

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_CONNECTION_STRING", "mongodb://iot-db:27017")
client = pymongo.MongoClient(MONGO_URI)
db = client.plant_care
collection = db.greenhouses
BACKEND_API = "http://backend:8080/mobileBE/notifications"
DATA_PROCESSOR_API = "http://data-proccesor:8000/api/v1/greenhouses/{greenhouse_id}/fields/{field_idx}/control"
INTERVAL = 1

def notify_backend(title: str, content: str) -> None:
    """Send device control notification to backend"""
    try:
        payload = {"title": title, "content": content}
        response = requests.post(BACKEND_API, json=payload)
        response.raise_for_status()
        logger.info(f"Notified backend:\n{title}: {content}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to notify backend: {e}")
        
def send_control(greenhouse_id: str, field_idx: int, device: str, value: int) -> None:
    """Send control command to data processor"""
    try:
        payload = {"device": device, "value": value}
        response = requests.post(DATA_PROCESSOR_API.format(greenhouse_id=greenhouse_id, field_idx=field_idx), params=payload)
        response.raise_for_status()
        logger.info(f"Control sent: {device} -> {value}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send control: {e}")

def check_and_control_devices():
    """Main job function to check sensor data and control devices"""
    try:
        needed_check_greenhouses = collection.find({
            "updated_at": {"$gt": datetime.now() - timedelta(minutes=INTERVAL)}
        }, {
            "fields.temperature_sensor": { "$slice": 1 },
            "fields.humidity_sensor": { "$slice": 1 },
            "fields.soil_moisture_sensor": { "$slice": 1 },
            "fields.light_sensor": { "$slice": 1 }
        })
        
        for greenhouse in needed_check_greenhouses:
            for field_idx, field in enumerate(greenhouse.get("fields", [])):
                temperature_data = field.get("temperature_sensor", {}).get("value", None)
                humidity_data = field.get("humidity_sensor", None)
                soil_moisture_data = field.get("soil_moisture_sensor", None)
                light_data = field.get("light_sensor", None)

                if soil_moisture_data and temperature_data and humidity_data:
                    res = predict_with_partial_input({
                        "Soil Moisture": int(soil_moisture_data),
                        "Temperature": int(temperature_data),
                        "Air humidity (%)": int(humidity_data)
                    })
                    if res == "on":
                        send_control(greenhouse["greenhouse"], field_idx, "pump", 100)
                    else:
                        send_control(greenhouse["greenhouse"], field_idx, "pump", 0)
                    notify_backend("Change status of pump", f"Greenhouse {greenhouse['greenhouse']} - Field {field_idx}: {res}")
                
                if temperature_data and humidity_data:
                    res = predict_fan({
                        "tempreature": int(temperature_data),
                        "humidity": int(humidity_data)
                    })
                    if res == "on":
                        send_control(greenhouse["greenhouse"], field_idx, "fan", 100)
                    else:
                        send_control(greenhouse["greenhouse"], field_idx, "fan", 0)
                    notify_backend("Change status of fan", f"Greenhouse {greenhouse['greenhouse']} - Field {field_idx}: {res}")
                
                if light_data and temperature_data and humidity_data:
                    res = predict_led_on({
                        "Light_Intensity": int(light_data),
                        "Temperature": int(temperature_data),
                        "Humidity": int(humidity_data),
                        "Minute_Of_Day": datetime.now().minute + datetime.now().hour * 60
                    })
                    if res == "on":
                        send_control(greenhouse["greenhouse"], field_idx, "led", 100)
                    else:
                        send_control(greenhouse["greenhouse"], field_idx, "led", 0)
                    notify_backend("Change status of led", f"Greenhouse {greenhouse['greenhouse']} - Field {field_idx}: {res}")
    except Exception as e:
        logger.error(f"Error in control loop: {e}")

def main():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        check_and_control_devices,
        'interval',
        minutes=INTERVAL,
        id='greenhouse_control'
    )
    scheduler.start()
    try:
        while True:
            time.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()

if __name__ == "__main__":
    main()