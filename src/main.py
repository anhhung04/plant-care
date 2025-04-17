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
BACKEND_API = "http://backend:8080/mobileBE"
BACKEND_AUTH_KEY = os.getenv("BE_PRESHARED_KEY", "your_auth_key")
DATA_PROCESSOR_API = "http://data-proccesor:8000/api/v1/greenhouses/{greenhouse_id}/fields/{field_idx}/control"
INTERVAL = 1

PREDICT_FUNCS = {
    "fan": predict_fan,
    "pump": predict_with_partial_input,
    "led": predict_led_on
}

def get_input(temperature, humidity, moisture, light, typ="fan"):
    """Get input for prediction"""
    if typ == "fan":
        if not temperature or not humidity:
            raise ValueError("Temperature and humidity are required for fan control")
        return {
            "tempreature": int(temperature),
            "humidity": int(humidity)
        }
    elif typ == "pump":
        if not temperature or not moisture or not humidity:
            raise ValueError("Temperature and moisture are required for pump control")
        return {
            "Soil Moisture": int(moisture),
            "Temperature": int(temperature),
            "Air humidity (%)": int(humidity)
        }
    elif typ == "led":
        if not light or not temperature or not humidity:
            raise ValueError("Light intensity is required for LED control")
        return {
            "Light_Intensity": int(light),
            "Temperature": int(temperature),
            "Humidity": int(humidity),
            "Minute_Of_Day": datetime.now().minute + datetime.now().hour * 60
        }

def notify_backend(title: str, content: str) -> None:
    """Send device control notification to backend"""
    try:
        payload = {"title": title, "content": content}
        response = requests.post(BACKEND_API + "/notifications", json=payload, headers={"X-Auth-Key":BACKEND_AUTH_KEY})
        response.raise_for_status()
        logger.info(f"Notified backend:\n{title}: {content}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to notify backend: {e}")
        
def send_control(greenhouse_id: str, field_idx: int, device: str, value: int, notify_payload=None) -> None:
    """Send control command to data processor"""
    try:
        payload = {"device": device, "value": value}
        response = requests.post(DATA_PROCESSOR_API.format(greenhouse_id=greenhouse_id, field_idx=field_idx), params=payload)
        response.raise_for_status()
        logger.info(f"Control sent: {device} -> {value}")
        if notify_payload:
            notify_backend(notify_payload.get("title"), notify_payload.get("content"))
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send control: {e}")

def get_timestamp(d: datetime) -> str:
    """Convert datetime to timestamp"""
    return f"{d.year}-{d.month:02d}-{d.day:02d} {d.hour:02d}:{d.minute:02d}"
def check_and_control_devices(collection, scheduler: BackgroundScheduler):
    """Main job function to check sensor data and control devices"""
    try:
        needed_check_greenhouses = collection.find({
            "updated_at": {"$gt": datetime.now() - timedelta(minutes=INTERVAL)}
        }, {
            "fields.temperature_sensor": { "$slice": 1 },
            "fields.humidity_sensor": { "$slice": 1 },
            "fields.soil_moisture_sensor": { "$slice": 1 },
            "fields.light_sensor": { "$slice": 1 },
            "fields.led_status": { "$slice": 1 },
            "fields.fan_status": { "$slice": 1 },
            "fields.pump_status": { "$slice": 1 },
        })
        # in all modes, these fields are required:
        #     id, name, mode, status, intensity
        #
        # in manual mode, there is an additional field: 
        #     turn_off_after (required) is null or x minutes
        #
        # in scheduled mode, there are additional fields:
        #     turn_on_at (required) is the time to turn on the device, format: "HH:MM"
        #     turn_off_after (required) x minutes (null is not allowed)
        #     repeat (required) is "today", "everyday" or "custom"
        #     dates (required if repeat is "custom") is an array of dates, format: "YYYY-MM-DD"
        #
        # in automatic mode, there are no additional fields
        for greenhouse in needed_check_greenhouses:
            logger.info(f"Processing greenhouse: {greenhouse['greenhouse_id']}")
            for field_idx, field in enumerate(greenhouse.get("fields", [])):
                temperature_data = field.get("temperature_sensor", [{}])[0].get("value", None)
                humidity_data = field.get("humidity_sensor", [{}])[0].get("value", None)
                soil_moisture_data = field.get("soil_moisture_sensor", [{}])[0].get("value", None)
                light_data = field.get("light_sensor", [{}])[0].get("value", None)
                try:
                    for device in ["fan", "pump", "led"]:
                        device_config = field.metadata.get(f"config_{device}", None)
                        if not device_config: continue
                        if device_config["mode"] == "manual" and device_config["turn_off_after"]:
                            lastest_change = field.get(f"{device}_status", [{}])[0].get("timestamp", None)
                            if not lastest_change: continue
                            lastest_change = datetime.fromisoformat(lastest_change)
                            turn_off_time = lastest_change + timedelta(minutes=device_config["turn_off_after"])
                            job_name = f"{greenhouse['greenhouse_id']}_{field_idx}_{device}_{get_timestamp(turn_off_time)}_off"
                            if turn_off_time < datetime.now() and not scheduler.get_job(job_name):
                                logger.info(f"Scheduling turn off for {device} in greenhouse {greenhouse['greenhouse_id']} at {turn_off_time}")
                                scheduler.add_job(
                                    send_control,
                                    'date',
                                    args=[greenhouse["greenhouse_id"], field_idx, device, 0, {"title": "Device Control", "content": f"Turned off {device} in greenhouse {greenhouse['greenhouse_id']}"}],
                                    run_date=lastest_change + timedelta(minutes=device_config["turn_off_after"]),
                                    id=job_name,
                                    replace_existing=True
                                )
                        elif device_config["mode"] == "scheduled":
                            if not device_config["turn_on_at"] or not device_config["turn_off_after"]: continue
                            repeat = device_config.get("repeat", "today")
                            if repeat == "today":
                                turn_on_time = datetime.combine(datetime.now(), datetime.strptime(device_config["turn_on_at"], "%H:%M").time())
                                job_name = f"{greenhouse['greenhouse_id']}_{field_idx}_{device}_{get_timestamp(turn_on_time)}_on"
                                if not scheduler.get_job(job_name):
                                    logger.info(f"Scheduling turn on for {device} in greenhouse {greenhouse['greenhouse_id']} at {turn_on_time}")
                                    scheduler.add_job(
                                        send_control,
                                        'date',
                                        args=[greenhouse["greenhouse_id"], field_idx, device, 100, {"title": "Device Control", "content": f"Turned on {device} in greenhouse {greenhouse['greenhouse_id']}"}],
                                        run_date=turn_on_time,
                                        id=job_name,
                                        replace_existing=True
                                    )
                                turn_off_time = turn_on_time + timedelta(minutes=device_config["turn_off_after"])
                                job_name = f"{greenhouse['greenhouse_id']}_{field_idx}_{device}_{get_timestamp(turn_off_time)}_off"
                                if not scheduler.get_job(job_name):
                                    logger.info(f"Scheduling turn off for {device} in greenhouse {greenhouse['greenhouse_id']} at {turn_off_time}")
                                    scheduler.add_job(
                                        send_control,
                                        'date',
                                        args=[greenhouse["greenhouse_id"], field_idx, device, 0, {"title": "Device Control", "content": f"Turned off {device} in greenhouse {greenhouse['greenhouse_id']}"}],
                                        run_date=turn_off_time,
                                        id=job_name,
                                        replace_existing=True
                                    )
                            elif repeat == "everyday":
                                turn_on_time = datetime.combine(datetime.now(), datetime.strptime(device_config["turn_on_at"], "%H:%M").time())
                                job_name = f"{greenhouse['greenhouse_id']}_{field_idx}_{device}_{get_timestamp(turn_on_time)}_on"
                                if not scheduler.get_job(job_name):
                                    logger.info(f"Scheduling turn on for {device} in greenhouse {greenhouse['greenhouse_id']} at {turn_on_time}")
                                    scheduler.add_job(
                                        send_control,
                                        'date',
                                        args=[greenhouse["greenhouse_id"], field_idx, device, 100, {"title": "Device Control", "content": f"Turned on {device} in greenhouse {greenhouse['greenhouse_id']}"}],
                                        run_date=turn_on_time,
                                        id=job_name,
                                        replace_existing=True
                                    )
                                turn_off_time = turn_on_time + timedelta(minutes=device_config["turn_off_after"])
                                job_name = f"{greenhouse['greenhouse_id']}_{field_idx}_{device}_{get_timestamp(turn_off_time)}_off"
                                if not scheduler.get_job(job_name):
                                    logger.info(f"Scheduling turn off for {device} in greenhouse {greenhouse['greenhouse_id']} at {turn_off_time}")
                                    scheduler.add_job(
                                        send_control,
                                        'date',
                                        args=[greenhouse["greenhouse_id"], field_idx, device, 0, {"title": "Device Control", "content": f"Turned off {device} in greenhouse {greenhouse['greenhouse_id']}"}],
                                        run_date=turn_off_time,
                                        id=job_name,
                                        replace_existing=True
                                    )
                            elif repeat == "custom":
                                for date in device_config.get("dates", []):
                                    turn_on_time = datetime.combine(datetime.strptime(date, "%Y-%m-%d"), datetime.strptime(device_config["turn_on_at"], "%H:%M").time())
                                    turn_off_time = turn_on_time + timedelta(minutes=device_config["turn_off_after"])
                                    job_name = f"{greenhouse['greenhouse_id']}_{field_idx}_{device}_{get_timestamp(turn_off_time)}_off"
                                    if not scheduler.get_job(job_name):
                                        logger.info(f"Scheduling turn off for {device} in greenhouse {greenhouse['greenhouse_id']} at {turn_off_time}")
                                        scheduler.add_job(
                                            send_control,
                                            'date',
                                            args=[greenhouse["greenhouse_id"], field_idx, device, 0, {"title": "Device Control", "content": f"Turned off {device} in greenhouse {greenhouse['greenhouse_id']}"}],
                                            run_date=turn_off_time,
                                            id=job_name,
                                            replace_existing=True
                                        )
                        else:
                            input_data = get_input(
                                temperature_data,
                                humidity_data,
                                soil_moisture_data,
                                light_data,
                                device
                            )
                            prediction = PREDICT_FUNCS[device](input_data)
                            logger.info(f"Predicted {device} control: {prediction}")
                            current_status = field.get(f"{device}_status", [{}])[0].get("value", None)
                            current_status = "off" if current_status == 0 else "on"
                            if current_status != prediction:
                                send_control(greenhouse["greenhouse_id"], field_idx, device, 100 if prediction == "on" else 0, {"title": "Device Control", "content": f"Turned {prediction} {device} in greenhouse {greenhouse['greenhouse_id']}"})
                except Exception:
                    pass

                
    except Exception as e:
        logger.error(f"Error in control loop: {e}")

def main():
    try:
        client = pymongo.MongoClient(MONGO_URI)
        db = client.plant_care
        collection = db.greenhouses
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        check_and_control_devices,
        'interval',
        args=[collection, scheduler],
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