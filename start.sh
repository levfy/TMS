#!/bin/bash

# Create volumes directories
mkdir -p volumes/postgres_data
mkdir -p volumes/redis_data
mkdir -p volumes/minio_data

# Build and start services
docker-compose down
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Initialize MinIO buckets
docker exec kazdispatch_minio mc mb minio/driver-photos 2>/dev/null || true
docker exec kazdispatch_minio mc mb minio/vehicle-photos 2>/dev/null || true
docker exec kazdispatch_minio mc mb minio/cargo-photos 2>/dev/null || true
docker exec kazdispatch_minio mc mb minio/documents 2>/dev/null || true
docker exec kazdispatch_minio mc mb minio/signatures 2>/dev/null || true

echo "✅ All services started successfully!"
echo ""
echo "📊 Service URLs:"
echo "  Backend API:        http://localhost:3000"
echo "  Frontend:           http://localhost:5173"
echo "  PostgreSQL:         localhost:5432"
echo "  Redis:              localhost:6379"
echo "  MinIO S3:           http://localhost:9000"
echo "  MinIO Console:      http://localhost:9001"
echo ""
echo "Credentials:"
echo "  MinIO User:         minioadmin"
echo "  MinIO Password:     minioadmin123!"
echo "  PostgreSQL User:    kazdispatch"
echo "  PostgreSQL Pass:    SecurePassword123!"
echo "  Redis Password:     RedisPass123!"
