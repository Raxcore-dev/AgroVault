-- CreateTable "WeatherCropAdvisory"
CREATE TABLE "WeatherCropAdvisory" (
    "id" TEXT NOT NULL,
    "storageUnitId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "currentTemp" DOUBLE PRECISION NOT NULL,
    "currentHumidity" DOUBLE PRECISION NOT NULL,
    "forecastedTemp" DOUBLE PRECISION NOT NULL,
    "forecastedHumidity" DOUBLE PRECISION NOT NULL,
    "currentSpoilageRisk" DOUBLE PRECISION NOT NULL,
    "forecastedSpoilageRisk" DOUBLE PRECISION NOT NULL,
    "riskChange" DOUBLE PRECISION NOT NULL,
    "recommendations" JSONB NOT NULL,
    "overallStrategy" TEXT NOT NULL,
    "rawAiAnalysis" TEXT NOT NULL,
    "weatherForecastData" JSONB NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherCropAdvisory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeatherCropAdvisory_storageUnitId_farmerId_createdAt_idx" ON "WeatherCropAdvisory"("storageUnitId", "farmerId", "createdAt");

-- CreateIndex
CREATE INDEX "WeatherCropAdvisory_expiresAt_idx" ON "WeatherCropAdvisory"("expiresAt");

-- AddForeignKey
ALTER TABLE "WeatherCropAdvisory" ADD CONSTRAINT "WeatherCropAdvisory_storageUnitId_fkey" FOREIGN KEY ("storageUnitId") REFERENCES "StorageUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeatherCropAdvisory" ADD CONSTRAINT "WeatherCropAdvisory_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
