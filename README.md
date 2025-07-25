# Microservices System with Auth & Product Catalog Services

This repository contains two independent microservices built with NestJS:

- **Auth Service** (handles user authentication and JWT token management)
- **Product Service** (manages product CRUD linked with users)

Both services communicate asynchronously via **RabbitMQ** message broker.

---

## Architecture Overview

+----------------+ RabbitMQ +--------------------+
| Auth Service | <------------------> | Product Service |
| - User signup | | - Product catalog CRUD |
| - Login/logout | | - Token validation |
| - JWT tokens | | |
+----------------+ +--------------------+

RabbitMQ acts as the communication bus to:

Publish user.created events

Handle token validation requests

yaml
Copy
Edit

---

## Prerequisites

- Docker & Docker Compose installed on your machine
- (Optional) Local MongoDB if you want to use your own DB instead of containerized one

---

## Directory Structure

project-root/
│
├── auth-service/ # Auth microservice
│ ├── Dockerfile
│ ├── .env
│ └── src/...
│
├── product-service/ # Product microservice
│ ├── Dockerfile
│ ├── .env
│ └── src/...
│
└── docker-compose.yml # Compose file to run both services and RabbitMQ

yaml
Copy
Edit

---

## Environment Variables

Each service uses its own `.env` file located inside its folder.

- Auth Service `.env`:  
  Contains MongoDB URI, JWT secrets, RabbitMQ URL, Swagger credentials, etc.

- Product Service `.env`:  
  Contains MongoDB URI, RabbitMQ URL, Swagger credentials, etc.

---

## How to Run

### Start All Services with RabbitMQ

Run the following from the **project root** directory:

```bash
docker-compose up --build
This will build and start:

RabbitMQ (with management UI at http://localhost:15672, user: admin, pass: admin)

Auth Service (http://localhost:7000)

Product Service (http://localhost:3000)

Stop All Services
bash
Copy
Edit
docker-compose down
Running Services Individually
If you want to run a single service (e.g. auth-service):

bash
Copy
Edit
docker-compose up --build auth-service
Development
Source code of each service is mounted as a volume for hot reload.

To run without Docker, go inside each service folder and run:

bash
Copy
Edit
yarn
yarn dev
Make sure RabbitMQ is running (via Docker or locally).

RabbitMQ Management
Open browser: http://localhost:15672

Login: admin / admin

Important Notes
Make sure RABBITMQ_URL in each service’s .env points to RabbitMQ service:

perl
Copy
Edit
amqp://admin:admin@rabbitmq:5672
MongoDB URIs in .env files can be pointed to local MongoDB or containerized MongoDB if added.

JWT secrets (AT_SECRET, RT_SECRET) must be kept secure in production.

Product service validates user tokens by sending a request to Auth service via RabbitMQ.

Auth service emits user events (user.created) to RabbitMQ, consumed by Product Service.
