/**
 * Core TypeScript interfaces for the Intelligent Mail Dashboard.
 * These types are designed to align with the future GraphQL backend schema.
 */

export interface Email {
    id: string;
    sender: string;
    recipient: string;
    subject: string;
    body: string;
    folder: string;
    createdAt: string;
}

export type ScanResult = "clean" | "malicious" | "suspicious";

export interface ScanLog {
    id: string;
    result: ScanResult;
    confidence: number;
    createdAt: string;
    email: {
        subject: string;
    };
}

export interface Metric {
    label: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}
