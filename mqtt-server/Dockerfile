FROM eclipse-mosquitto:latest

COPY ./config/mosquitto.conf /mosquitto/config/mosquitto.conf
COPY ./config/passwd /mosquitto/config/passwd

RUN chmod 700 /mosquitto/config/passwd

EXPOSE 1884

ENTRYPOINT [ "mosquitto" ]
CMD [ "-c", "/mosquitto/config/mosquitto.conf" ]