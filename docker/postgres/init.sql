-- Initialize MinIO buckets and PostgreSQL database

-- Create buckets for MinIO (this is handled by MinIO itself, but we document it here)
-- MinIO initialization is done through MinIO client or web UI

-- PostgreSQL initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET TIMEZONE = 'Asia/Almaty';

-- Create schemas
CREATE SCHEMA IF NOT EXISTS kazdispatch;
SET search_path TO kazdispatch;

-- Enum types
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'COMPANY_ADMIN', 'DISPATCHER', 'DRIVER', 'CLIENT');
CREATE TYPE order_status AS ENUM (
  'DRAFT',
  'PUBLISHED',
  'ASSIGNED',
  'PICKUP_EN_ROUTE',
  'ARRIVED_AT_PICKUP',
  'LOADED',
  'IN_TRANSIT',
  'ARRIVED_AT_DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED'
);
CREATE TYPE driver_status AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'ON_VACATION');
CREATE TYPE vehicle_status AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'INSPECTION');

-- Base audit fields trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
