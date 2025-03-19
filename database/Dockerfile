FROM postgres:16-alpine3.21

WORKDIR /docker-entrypoint-initdb.d
COPY ./schema.sql .

RUN chmod 644 schema.sql \
    && chown postgres:postgres schema.sql

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD pg_isready -U postgres || exit 1

EXPOSE 5432
