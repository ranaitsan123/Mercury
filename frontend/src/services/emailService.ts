/**
 * Email Service
 * 
 * Purpose: Abstract data access layer for email-related operations.
 * This service controls the data source based on VITE_DATA_MODE environment variable.
 */

import {
    MOCK_EMAIL_LOGS,
    MOCK_THREATS,
    MOCK_THREATS_BY_DAY,
    MOCK_METRICS
} from "@/lib/mockData";
import { client } from "@/lib/apolloClient";
import { GET_MY_EMAILS } from "@/graphql/queries";

// --- Types (Re-exported for component usage) ---

export type EmailLog = {
    id: string;
    from: string;
    subject: string;
    datetime: string;
    status: "Clean" | "Suspicious" | "Malicious";
    confidence: number;
};

export type Threat = {
    id: string;
    subject: string;
    type: string;
    from: string;
    datetime?: string; // Optional in case it varies
};

export interface EmailFilters {
    searchTerm?: string;
    statusFilter?: string[];
}

export interface PaginationParams {
    page: number;
    itemsPerPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

// --- Configuration ---

export const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'mock';
export const USE_MOCK = DATA_MODE === 'mock';

// Simulated delay to mimic API call
const simulateDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// --- Service Functions ---

/**
 * Main data fetching function exposed to the app.
 */
export async function getEmails(): Promise<EmailLog[]> {
    await simulateDelay();

    if (USE_MOCK) {
        // Return a copy to avoid mutation issues
        return [...MOCK_EMAIL_LOGS];
    }

    try {
        const result = await client.query<{ myEmails: EmailLog[] }>({
            query: GET_MY_EMAILS,
        });
        return result.data.myEmails;
    } catch (error) {
        console.error("GraphQL query failed:", error);
        // Fallback to empty state as per "Show empty state" requirement
        // The error is already handled/toasted by apolloClient's onError link
        return [];
    }
}

/**
 * Fetch all email logs with optional filtering.
 */
export async function getEmailLogs(filters?: EmailFilters): Promise<EmailLog[]> {
    // Re-use core getEmails function
    let logs = await getEmails();

    if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        logs = logs.filter(
            (log) =>
                log.from.toLowerCase().includes(searchLower) ||
                log.subject.toLowerCase().includes(searchLower)
        );
    }

    if (filters?.statusFilter && filters.statusFilter.length > 0) {
        logs = logs.filter((log) => filters.statusFilter!.includes(log.status));
    }

    return logs;
}

/**
 * Fetch paginated email logs.
 */
export async function getPaginatedEmailLogs(
    filters?: EmailFilters,
    pagination?: PaginationParams
): Promise<PaginatedResponse<EmailLog>> {
    const allLogs = await getEmailLogs(filters);

    const page = pagination?.page || 1;
    const itemsPerPage = pagination?.itemsPerPage || 10;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
        data: allLogs.slice(startIndex, endIndex),
        total: allLogs.length,
        page,
        totalPages: Math.ceil(allLogs.length / itemsPerPage),
    };
}

/**
 * Fetch a single email log by ID.
 */
export async function getEmailLogById(id: string): Promise<EmailLog | null> {
    await simulateDelay();
    // Assuming getEmails() returns everything for now (Mock mode)
    // For Real mode, this might need a specific backend endpoint
    const logs = await getEmails();
    return logs.find((log) => log.id === id) || null;
}

/**
 * Fetch latest critical threats.
 */
export async function getLatestThreats(): Promise<Threat[]> {
    await simulateDelay();

    if (USE_MOCK) {
        return [...MOCK_THREATS];
    }

    return [];
}

/**
 * Fetch threat statistics by day for the chart.
 */
export async function getThreatsByDay(): Promise<Array<{ date: string; threats: number }>> {
    await simulateDelay();

    if (USE_MOCK) {
        return [...MOCK_THREATS_BY_DAY];
    }

    return [];
}

/**
 * Fetch summary metrics.
 */
export async function getSummaryMetrics(): Promise<any> {
    await simulateDelay();

    if (USE_MOCK) {
        return { ...MOCK_METRICS };
    }

    return {
        totalScanned: 0,
        threatsBlocked: 0,
        cleanEmails: 0,
        detectionAccuracy: 0
    };
}
