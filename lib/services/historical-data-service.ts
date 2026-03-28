/**
 * Historical Sensor Data Service
 *
 * Fetches and processes historical sensor readings for trend analysis.
 */

import { prisma } from '@/lib/prisma'

export interface HistoricalReading {
  id: string
  storageUnitId: string
  temperature: number
  humidity: number
  timestamp: Date
  status: string
}

export interface TrendAnalysis {
  temperature: {
    direction: 'rising' | 'falling' | 'stable'
    ratePerHour: number
    changePercent: number
    avgValue: number
    maxValue: number
    minValue: number
  }
  humidity: {
    direction: 'rising' | 'falling' | 'stable'
    ratePerHour: number
    changePercent: number
    avgValue: number
    maxValue: number
    minValue: number
  }
  duration: {
    minutesAnalyzed: number
    readingsCount: number
    dataQuality: 'poor' | 'fair' | 'good' | 'excellent'
  }
}

/**
 * Fetch historical readings for a storage unit
 */
export async function getHistoricalReadings(
  storageUnitId: string,
  minutes: number = 60
): Promise<HistoricalReading[]> {
  try {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);

    const readings = await prisma.storageReading.findMany({
      where: {
        storageUnitId,
        recordedAt: {
          gte: cutoffTime,
        },
      },
      orderBy: {
        recordedAt: 'asc',
      },
    });

    return readings.map((r) => ({
      id: r.id,
      storageUnitId: r.storageUnitId,
      temperature: r.temperature,
      humidity: r.humidity,
      timestamp: r.recordedAt,
      status: r.status,
    }));
  } catch (error) {
    console.error('[HistoricalData] Error fetching readings:', error);
    return [];
  }
}

/**
 * Analyze trends in historical data
 */
export function analyzeTrend(readings: HistoricalReading[]): TrendAnalysis | null {
  if (readings.length < 2) {
    return null;
  }

  const minutesAnalyzed =
    (readings[readings.length - 1].timestamp.getTime() -
      readings[0].timestamp.getTime()) /
    (1000 * 60);

  // Calculate temperature trend
  const tempValues = readings.map((r) => r.temperature);
  const tempTrend = calculateTrend(tempValues, minutesAnalyzed);

  // Calculate humidity trend
  const humidityValues = readings.map((r) => r.humidity);
  const humidityTrend = calculateTrend(humidityValues, minutesAnalyzed);

  // Determine data quality
  const readingsPerHour = (readings.length / minutesAnalyzed) * 60;
  let dataQuality: 'poor' | 'fair' | 'good' | 'excellent' = 'poor';
  if (readingsPerHour >= 12) dataQuality = 'excellent';
  else if (readingsPerHour >= 6) dataQuality = 'good';
  else if (readingsPerHour >= 2) dataQuality = 'fair';

  return {
    temperature: {
      direction: tempTrend.direction,
      ratePerHour: tempTrend.ratePerHour,
      changePercent: tempTrend.changePercent,
      avgValue: tempTrend.avgValue,
      maxValue: tempTrend.maxValue,
      minValue: tempTrend.minValue,
    },
    humidity: {
      direction: humidityTrend.direction,
      ratePerHour: humidityTrend.ratePerHour,
      changePercent: humidityTrend.changePercent,
      avgValue: humidityTrend.avgValue,
      maxValue: humidityTrend.maxValue,
      minValue: humidityTrend.minValue,
    },
    duration: {
      minutesAnalyzed: Math.round(minutesAnalyzed),
      readingsCount: readings.length,
      dataQuality,
    },
  };
}

/**
 * Calculate trend for a series of values
 */
function calculateTrend(
  values: number[],
  timeSpanMinutes: number
): {
  direction: 'rising' | 'falling' | 'stable';
  ratePerHour: number;
  changePercent: number;
  avgValue: number;
  maxValue: number;
  minValue: number;
} {
  if (values.length < 2) {
    return {
      direction: 'stable',
      ratePerHour: 0,
      changePercent: 0,
      avgValue: values[0] || 0,
      maxValue: values[0] || 0,
      minValue: values[0] || 0,
    };
  }

  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  // Calculate linear regression slope
  const n = values.length;
  const sumX = ((n - 1) * n) / 2; // Sum of 0, 1, 2, ..., n-1
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, val, idx) => sum + idx * val, 0);
  const sumX2 = ((n - 1) * n * (2 * n - 1)) / 6; // Sum of squares

  const denominator = n * sumX2 - sumX * sumX;
  const slope =
    denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;

  // Convert slope to rate per hour
  const minutesPerPoint = timeSpanMinutes / (n - 1);
  const pointsPerHour = 60 / minutesPerPoint;
  const ratePerHour = slope * pointsPerHour;

  // Calculate total change percent
  const startValue = values[0];
  const endValue = values[values.length - 1];
  const changePercent =
    startValue !== 0 ? ((endValue - startValue) / Math.abs(startValue)) * 100 : 0;

  // Determine direction with threshold
  const threshold = 0.5; // Minimum rate to be considered rising/falling
  let direction: 'rising' | 'falling' | 'stable' = 'stable';
  if (ratePerHour > threshold) direction = 'rising';
  else if (ratePerHour < -threshold) direction = 'falling';

  return {
    direction,
    ratePerHour: Math.round(ratePerHour * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    avgValue: Math.round(avgValue * 100) / 100,
    maxValue,
    minValue,
  };
}

/**
 * Get latest reading for a storage unit
 */
export async function getLatestReading(storageUnitId: string) {
  try {
    const reading = await prisma.storageReading.findFirst({
      where: { storageUnitId },
      orderBy: { recordedAt: 'desc' },
    });
    return reading;
  } catch (error) {
    console.error('[HistoricalData] Error fetching latest reading:', error);
    return null;
  }
}

/**
 * Get readings summary for dashboard
 */
export async function getReadingsSummary(storageUnitIds: string[]) {
  try {
    const readings = await prisma.storageReading.findMany({
      where: {
        storageUnitId: { in: storageUnitIds },
      },
      orderBy: { recordedAt: 'desc' },
    });

    // Group by storage unit and get latest
    const latestByUnit = new Map();
    for (const reading of readings) {
      if (!latestByUnit.has(reading.storageUnitId)) {
        latestByUnit.set(reading.storageUnitId, reading);
      }
    }

    return Array.from(latestByUnit.values());
  } catch (error) {
    console.error('[HistoricalData] Error fetching summary:', error);
    return [];
  }
}
