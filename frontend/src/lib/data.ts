/**
 * Data Layer / Service Interface
 * 
 * This file acts as the single source of truth for data structures and 
 * provides a unified service interface for the rest of the application.
 * 
 * Feature: USE_MOCK flag allows toggling between local mock data and 
 * future GraphQL/Backend integration.
 */

import {
    MOCK_EMAIL_LOGS,
    MOCK_THREATS,
    MOCK_THREATS_BY_DAY,
    MOCK_METRICS
} from "./mockData";

// --- Types ---

export type EmailLog = {
    id: string;
    sender: string;
    recipient: string;
    subject: string;
    body?: string;
    createdAt: string;
    folder?: "inbox" | "sent";
    scan?: {
        result: "safe" | "malicious";
        confidence?: number;
    };
};

export type Threat = {
    id: string;
    subject: string;
    type: string;
    from: string;
};

export type SummaryMetrics = {
    totalScanned: number;
    threatsBlocked: number;
    cleanEmails: number;
    detectionAccuracy: number;
};

// --- Configuration ---

/**
 * Toggle this flag to switch between Mock Mode and Backend Integration.
 * Driven by VITE_USE_MOCK environment variable.
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || import.meta.env.VITE_USE_MOCK === undefined;

// --- Service Functions ---

/**
 * Fetch email logs.
 * Supports filtering in mock mode.
 */
export async function getEmails(): Promise<EmailLog[]> {
    try {
        if (USE_MOCK) {
            return [...MOCK_EMAIL_LOGS];
        }
        // FUTURE: Implement GraphQL query using Apollo Client
        return [];
    } catch (error) {
        console.error("Error fetching emails:", error);
        return [];
    }
}

/**
 * Fetch latest critical threats.
 */
export async function getLatestThreats(): Promise<Threat[]> {
    try {
        if (USE_MOCK) {
            return [...MOCK_THREATS];
        }
        return [];
    } catch (error) {
        console.error("Error fetching latest threats:", error);
        return [];
    }
}

/**
 * Fetch summary metrics for the dashboard.
 */
export async function getMetrics(): Promise<SummaryMetrics> {
    if (USE_MOCK) {
        return { ...MOCK_METRICS };
    }

    // FUTURE: Implement GraphQL query
    return {
        totalScanned: 0,
        threatsBlocked: 0,
        cleanEmails: 0,
        detectionAccuracy: 0
    };
}

/**
 * Fetch threat statistics by day for the chart.
 */
export async function getThreatsByDay(): Promise<Array<{ date: string; threats: number }>> {
    if (USE_MOCK) {
        return [...MOCK_THREATS_BY_DAY];
    }

    // FUTURE: Implement GraphQL query
    return [];
}

// --- Legacy Export (Temporarily kept for compatibility if needed) ---
// Note: It's better to use the async functions above.
export const emailLogs = MOCK_EMAIL_LOGS;
export const latestThreats = MOCK_THREATS;
export const threatsByDay = MOCK_THREATS_BY_DAY;
export const summaryMetrics = MOCK_METRICS;