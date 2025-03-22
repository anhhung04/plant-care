FROM eclipse-temurin:21-jdk-jammy as build

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV POSTGRES_HOST=localhost
ENV POSTGRES_PORT=5432
ENV POSTGRES_DB=your_db
ENV POSTGRES_USER=your_user
ENV POSTGRES_PASSWORD=your_password

ENV MONGODB_URI=mongodb://localhost:27017/your_db

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
