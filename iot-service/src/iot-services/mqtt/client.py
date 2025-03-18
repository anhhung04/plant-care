"""MQTT client implementation for the IoT service."""

import json
import logging
import time
from typing import Any, Callable, Dict, List, Optional, Union

import paho.mqtt.client as mqtt

from .handlers import BaseHandler

logger = logging.getLogger(__name__)


class MQTTClient:
    def __init__(
        self,
        client_id: str = "iot-service",
        host: str = "localhost",
        port: int = 1883,
        keepalive: int = 60,
        username: Optional[str] = None,
        password: Optional[str] = None,
        use_tls: bool = False,
        tls_ca_certs: Optional[str] = None,
        tls_certfile: Optional[str] = None,
        tls_keyfile: Optional[str] = None,
        reconnect_delay: int = 5,
    ):
        self.client_id = client_id
        self.host = host
        self.port = port
        self.keepalive = keepalive
        self.username = username
        self.password = password
        self.use_tls = use_tls
        self.tls_ca_certs = tls_ca_certs
        self.tls_certfile = tls_certfile
        self.tls_keyfile = tls_keyfile
        self.reconnect_delay = reconnect_delay

        self.client = mqtt.Client(client_id=client_id)

        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message

        if username and password:
            self.client.username_pw_set(username, password)

        if use_tls:
            self.client.tls_set(
                ca_certs=tls_ca_certs, certfile=tls_certfile, keyfile=tls_keyfile
            )

        self.topic_handlers: Dict[str, BaseHandler] = {}

        self.connected = False

    def _on_connect(self, client, userdata, flags, rc):
        """Callback for when the client connects to the broker.

        Args:
            client: MQTT client instance
            userdata: User data
            flags: Connection flags
            rc: Connection result code
        """
        if rc == 0:
            self.connected = True
            logger.info(f"Connected to MQTT broker at {self.host}:{self.port}")

            # Subscribe to all registered topics
            for topic in self.topic_handlers.keys():
                self.subscribe(topic)
        else:
            logger.error(f"Failed to connect to MQTT broker. Return code: {rc}")
            self.connected = False

    def _on_disconnect(self, client, userdata, rc):
        self.connected = False
        logger.warning(f"Disconnected from MQTT broker with code {rc}")

        if rc != 0:
            logger.info(f"Attempting to reconnect in {self.reconnect_delay} seconds...")
            time.sleep(self.reconnect_delay)
            self.connect()

    def _on_message(self, client, userdata, msg):
        topic = msg.topic
        payload = msg.payload

        logger.debug(f"Received message on topic {topic}")

        for pattern, handler in self.topic_handlers.items():
            if mqtt.topic_matches_sub(pattern, topic):
                try:
                    handler.handle_message(topic, payload)
                except Exception as e:
                    logger.error(f"Error handling message on topic {topic}: {e}")

    def connect(self) -> bool:
        try:
            self.client.connect(self.host, self.port, self.keepalive)
            self.client.loop_start()
            return True
        except Exception as e:
            logger.error(f"Error connecting to MQTT broker: {e}")
            return False

    def disconnect(self):
        self.client.loop_stop()
        self.client.disconnect()
        self.connected = False
        logger.info("Disconnected from MQTT broker")

    def register_handler(self, topic: str, handler: BaseHandler):
        self.topic_handlers[topic] = handler

        if self.connected:
            self.subscribe(topic)

    def subscribe(self, topic: str, qos: int = 0) -> bool:
        if not self.connected:
            logger.warning("Cannot subscribe: not connected to MQTT broker")
            return False

        result, mid = self.client.subscribe(topic, qos)
        if result == mqtt.MQTT_ERR_SUCCESS:
            logger.info(f"Subscribed to topic: {topic}")
            return True
        else:
            logger.error(f"Failed to subscribe to topic {topic}. Result code: {result}")
            return False

    def unsubscribe(self, topic: str) -> bool:
        if not self.connected:
            logger.warning("Cannot unsubscribe: not connected to MQTT broker")
            return False

        result, mid = self.client.unsubscribe(topic)
        if result == mqtt.MQTT_ERR_SUCCESS:
            logger.info(f"Unsubscribed from topic: {topic}")
            return True
        else:
            logger.error(
                f"Failed to unsubscribe from topic {topic}. Result code: {result}"
            )
            return False

    def publish(
        self,
        topic: str,
        payload: Union[str, Dict, bytes],
        qos: int = 0,
        retain: bool = False,
    ) -> bool:
        if not self.connected:
            logger.warning("Cannot publish: not connected to MQTT broker")
            return False

        if isinstance(payload, dict):
            payload = json.dumps(payload)

        if isinstance(payload, str):
            payload = payload.encode("utf-8")

        result, mid = self.client.publish(topic, payload, qos, retain)
        if result == mqtt.MQTT_ERR_SUCCESS:
            logger.debug(f"Published message to topic: {topic}")
            return True
        else:
            logger.error(f"Failed to publish to topic {topic}. Result code: {result}")
            return False
