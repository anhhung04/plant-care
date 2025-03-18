FROM mongo:4.4

COPY ./init.js /docker-entrypoint-initdb.d/init.js

ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=admin
ENV MONGO_INITDB_DATABASE=plant_care

EXPOSE 27017
