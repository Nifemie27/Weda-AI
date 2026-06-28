-- Add device_id columns with default for existing rows
ALTER TABLE "weather_searches" ADD COLUMN "device_id" TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE "trips" ADD COLUMN "device_id" TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE "favourite_locations" ADD COLUMN "device_id" TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE "weather_comparisons" ADD COLUMN "device_id" TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE "export_history" ADD COLUMN "device_id" TEXT NOT NULL DEFAULT 'legacy';

-- Remove defaults (new rows must provide a device_id)
ALTER TABLE "weather_searches" ALTER COLUMN "device_id" DROP DEFAULT;
ALTER TABLE "trips" ALTER COLUMN "device_id" DROP DEFAULT;
ALTER TABLE "favourite_locations" ALTER COLUMN "device_id" DROP DEFAULT;
ALTER TABLE "weather_comparisons" ALTER COLUMN "device_id" DROP DEFAULT;
ALTER TABLE "export_history" ALTER COLUMN "device_id" DROP DEFAULT;

-- Drop old unique constraint on favourite_locations and add new one with device_id
ALTER TABLE "favourite_locations" DROP CONSTRAINT IF EXISTS "favourite_locations_user_id_latitude_longitude_key";
CREATE UNIQUE INDEX "favourite_locations_device_id_latitude_longitude_key" ON "favourite_locations"("device_id", "latitude", "longitude");

-- Add indexes for device_id
CREATE INDEX "weather_searches_device_id_idx" ON "weather_searches"("device_id");
CREATE INDEX "trips_device_id_idx" ON "trips"("device_id");
CREATE INDEX "favourite_locations_device_id_idx" ON "favourite_locations"("device_id");
CREATE INDEX "weather_comparisons_device_id_idx" ON "weather_comparisons"("device_id");
CREATE INDEX "export_history_device_id_idx" ON "export_history"("device_id");
