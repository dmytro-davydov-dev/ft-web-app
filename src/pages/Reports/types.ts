/** Shared data-shape types for all 5 report endpoints (R1–R5). */

/** R1 — occupancy per area over time */
export interface AreaOccupancyRow {
  timestamp: string;
  [areaName: string]: string | number;
}
export type AreaOccupancyData = AreaOccupancyRow[];

/** R2 — occupancy per floor (stacked) */
export interface FloorOccupancyRow {
  timestamp: string;
  [floorName: string]: string | number;
}
export type FloorOccupancyData = FloorOccupancyRow[];

/** R3 — building utilisation % daily */
export interface UtilisationRow {
  date: string;
  utilisation: number; // 0–100
}
export type UtilisationData = UtilisationRow[];

/** R4 — people-day table */
export interface PeopleDayRow {
  personId: string;
  name: string;
  date: string;
  durationMinutes: number;
  primaryArea: string;
}
export type PeopleDayData = PeopleDayRow[];

/** R5 — alerts table */
export type AlertSeverity = 'critical' | 'warning' | 'info';
export interface AlertRow {
  id: string;
  timestamp: string;
  eventType: string;
  severity: AlertSeverity;
  message: string;
  areaName: string;
  personName?: string;
}
export type AlertsData = AlertRow[];
