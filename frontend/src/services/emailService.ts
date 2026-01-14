/**
 * Email Service
 * 
 * Purpose: Abstract data access layer for email-related operations.
 * This service acts as a proxy for the data layer in src/lib/data.ts,
 * allowing UI components to remain agnostic about whether data comes
 * from mocks or a real GraphQL backend.
 */

import {
    getEmails,
    getLatestThreats as getLatestThreatsFromData,
    getThreatsByDay as getThreatsByDayFromData,
    getMetrics as getMetricsFromData,
    EmailLog,
    Threat
} from "@/lib/data";

// Simulated delay to mimic API call (can be removed when using real API)
const simulateDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

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

/**
 * Fetch all email logs with optional filtering.
 */
export async function getEmailLogs(filters?: EmailFilters): Promise<EmailLog[]> {
    // We already have a simulateDelay in some lib/data functions potentially, 
    // but we'll keep it here as an extra layer of abstraction for now.
    await simulateDelay();

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
    const logs = await getEmails();
    return logs.find((log) => log.id === id) || null;
}

/**
 * Fetch latest critical threats.
 */
export async function getLatestThreats(): Promise<Threat[]> {
    await simulateDelay();
    return await getLatestThreatsFromData();
}

/**
 * Fetch threat statistics by day for the chart.
 */
export async function getThreatsByDay(): Promise<Array<{ date: string; threats: number }>> {
    await simulateDelay();
    return await getThreatsByDayFromData();
}

/**
 * Fetch summary metrics.
 */
export async function getSummaryMetrics(): Promise<any> {
    await simulateDelay();
    return await getMetricsFromData();
}