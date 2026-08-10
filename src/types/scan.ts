/**
 * Types for IMS Scan Results.
 * Matches the backend IMSResult dataclass structure.
 */

/**
 * Severity levels for friction points.
 */
export type FrictionSeverity = "high" | "medium" | "low";

/**
 * A friction point detected during IMS analysis.
 */
export interface FrictionPoint {
    /** Description of the issue */
    message: string;
    /** Severity level */
    severity: FrictionSeverity;
}

/**
 * Result of an IMS scan.
 */
export interface IMSResult {
    /** URL that was scanned */
    url: string;
    /** IMS score between 0 and 100 */
    score: number;
    /** List of detected friction points */
    friction_points: FrictionPoint[];
    /** Timestamp of the scan */
    scanned_at?: string;
}

/**
 * API response from /api/v1/scan endpoint.
 */
export interface ScanResponse {
    /** Status of the scan */
    status: "success" | "error";
    /** Scan result data */
    data?: IMSResult;
    /** Error message if scan failed */
    error?: string;
}
