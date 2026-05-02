/** Shared data-shape types for all 5 report endpoints (R1–R5).
 *
 * Field names match the BigQuery column names returned by ft-api.
 */

/** R1 — occupancy per area over time (tall format from BQ) */
export interface AreaOccupancyRow {
  areaId: string;
  hour: string;       // TIMESTAMP_TRUNC result, ISO-8601 string
  tagCount: number;
}
export type AreaOccupancyData = AreaOccupancyRow[];

/** R1 — wide format used by Recharts LineChart after pivot */
export interface AreaOccupancyChartRow {
  timestamp: string;
  [areaId: string]: string | number;
}

/** R2 — occupancy per floor (tall format from BQ) */
export interface FloorOccupancyRow {
  floor: number | string;
  hour: string;
  tagCount: number;
}
export type FloorOccupancyData = FloorOccupancyRow[];

/** R2 — wide format used by Recharts BarChart after pivot */
export interface FloorOccupancyChartRow {
  timestamp: string;
  [floor: string]: string | number;
}

/** R3 — building utilisation % daily (field names from BQ) */
export interface UtilisationRow {
  day: string;
  occupied_hours: number;
  total_hours: number;
  utilisation_pct: number; // 0–100
}
export type UtilisationData = UtilisationRow[];

/** R4 — people-day (field names from BQ) */
export interface PeopleDayRow {
  tagId: string;
  day: string;
  first_seen: string;
  last_seen: string;
  duration_min: number;
}
export type PeopleDayData = PeopleDayRow[];

/** R5 — geofence alert history (field names from BQ) */
export interface AlertRow {
  geofenceId: string;
  tagId: string;
  event: 'enter' | 'exit' | string;
  ts: string;  // TIMESTAMP, ISO-8601 string
}
export type AlertsData = AlertRow[];
