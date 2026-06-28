-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('JSON', 'CSV', 'PDF', 'MARKDOWN');

-- CreateEnum
CREATE TYPE "ExportType" AS ENUM ('WEATHER_SEARCH', 'TRIP', 'SEARCH_HISTORY', 'TRIP_HISTORY', 'COMPARISON');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_searches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "query" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "temperature" DOUBLE PRECISION NOT NULL,
    "feels_like" DOUBLE PRECISION NOT NULL,
    "humidity" INTEGER NOT NULL,
    "pressure" INTEGER NOT NULL,
    "wind_speed" DOUBLE PRECISION NOT NULL,
    "visibility" INTEGER NOT NULL,
    "cloud_coverage" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "condition_icon" TEXT NOT NULL,
    "sunrise" TIMESTAMP(3) NOT NULL,
    "sunset" TIMESTAMP(3) NOT NULL,
    "timezone" INTEGER NOT NULL,
    "uv_index" DOUBLE PRECISION,
    "air_quality_index" INTEGER,
    "rain_probability" DOUBLE PRECISION,
    "snow_probability" DOUBLE PRECISION,
    "forecast_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "destination" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'PLANNING',
    "notes" TEXT,
    "packing_notes" TEXT,
    "is_favourite" BOOLEAN NOT NULL DEFAULT false,
    "weather_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favourite_locations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "nickname" TEXT,
    "notes" TEXT,
    "last_weather_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favourite_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_comparisons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "location_a_city" TEXT NOT NULL,
    "location_a_country" TEXT NOT NULL,
    "location_a_latitude" DOUBLE PRECISION NOT NULL,
    "location_a_longitude" DOUBLE PRECISION NOT NULL,
    "location_a_snapshot" JSONB NOT NULL,
    "location_b_city" TEXT NOT NULL,
    "location_b_country" TEXT NOT NULL,
    "location_b_latitude" DOUBLE PRECISION NOT NULL,
    "location_b_longitude" DOUBLE PRECISION NOT NULL,
    "location_b_snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "format" "ExportFormat" NOT NULL,
    "export_type" "ExportType" NOT NULL,
    "record_id" TEXT,
    "record_count" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "weather_searches_user_id_idx" ON "weather_searches"("user_id");

-- CreateIndex
CREATE INDEX "weather_searches_city_idx" ON "weather_searches"("city");

-- CreateIndex
CREATE INDEX "weather_searches_created_at_idx" ON "weather_searches"("created_at");

-- CreateIndex
CREATE INDEX "weather_searches_latitude_longitude_idx" ON "weather_searches"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "trips_user_id_idx" ON "trips"("user_id");

-- CreateIndex
CREATE INDEX "trips_status_idx" ON "trips"("status");

-- CreateIndex
CREATE INDEX "trips_start_date_idx" ON "trips"("start_date");

-- CreateIndex
CREATE INDEX "trips_destination_idx" ON "trips"("destination");

-- CreateIndex
CREATE INDEX "favourite_locations_user_id_idx" ON "favourite_locations"("user_id");

-- CreateIndex
CREATE INDEX "favourite_locations_city_idx" ON "favourite_locations"("city");

-- CreateIndex
CREATE UNIQUE INDEX "favourite_locations_user_id_latitude_longitude_key" ON "favourite_locations"("user_id", "latitude", "longitude");

-- CreateIndex
CREATE INDEX "weather_comparisons_user_id_idx" ON "weather_comparisons"("user_id");

-- CreateIndex
CREATE INDEX "weather_comparisons_created_at_idx" ON "weather_comparisons"("created_at");

-- CreateIndex
CREATE INDEX "export_history_user_id_idx" ON "export_history"("user_id");

-- CreateIndex
CREATE INDEX "export_history_created_at_idx" ON "export_history"("created_at");

-- AddForeignKey
ALTER TABLE "weather_searches" ADD CONSTRAINT "weather_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite_locations" ADD CONSTRAINT "favourite_locations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_comparisons" ADD CONSTRAINT "weather_comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_history" ADD CONSTRAINT "export_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
