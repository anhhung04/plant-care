FROM postgres:16-alpine3.21

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=postgres

COPY ./schema.sql /docker-entrypoint-initdb.d/

