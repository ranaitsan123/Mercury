/**
 * Email Service
 * 
 * Purpose: Data access layer for email-related operations via GraphQL.
 */

import { client } from "@/lib/apolloClient";
import { GET_MY_EMAILS } from "@/graphql/queries";
import { MOCK_EMAIL_LOGS, MOCK_THREATS, MOCK_THREATS_BY_DAY, MOCK_METRICS } from "@/lib/mockData";

export type EmailLog = {
    id: string;
    from: string;
    subject: string;
    datetime: string;
    status: "Clean" | "Suspicious" | "Malicious";
    confidence: number;
    trace_id?: string;
    used?: "real" | "mock";
};

export type Threat = {
    id: string;
    subject: string;
    type: string;
    from: string;
    datetime?: string;
};

export const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'mock';
const USE_MOCK = DATA_MODE === 'mock';

export const emailService = {
    /**
     * Fetch emails for the current user.
     */
    async getEmails(): Promise<EmailLog[]> {
        if (USE_MOCK) return [...MOCK_EMAIL_LOGS];

        try {
            const result = await client.query<{ myEmails: EmailLog[] }>({
                query: GET_MY_EMAILS,
                fetchPolicy: 'network-only' // Ensure we get fresh data
            });
            return result.data.myEmails || [];
        } catch (error) {
            console.error("Failed to fetch emails via GraphQL:", error);
            return []; // Empty array as per requirement
        }
    },

    /**
     * Fetch paginated logs.
     */
    async getPaginatedLogs(page: number, itemsPerPage: number, filters?: any): Promise<{ data: EmailLog[], total: number }> {
        const allLogs = await this.getEmails();
        // Filtering logic can be added here or move to backend if GraphQL supports it
        let filtered = allLogs;
        if (filters?.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = allLogs.filter(l => l.subject.toLowerCase().includes(term) || l.from.toLowerCase().includes(term));
        }
        if (filters?.statusFilter?.length > 0) {
            filtered = filtered.filter(l => filters.statusFilter.includes(l.status));
        }

        const start = (page - 1) * itemsPerPage;
        return {
            data: filtered.slice(start, start + itemsPerPage),
            total: filtered.length
        };
    },

    /**
     * Fetch latest threats.
     */
    async getLatestThreats(): Promise<Threat[]> {
        if (USE_MOCK) return [...MOCK_THREATS];

        // Placeholder for real GraphQL threat query if exists
        return [];
    },

    /**
     * Fetch threat trends for charts.
     */
    async getThreatTrends(): Promise<any[]> {
        if (USE_MOCK) return [...MOCK_THREATS_BY_DAY];

        return [];
    },

    /**
     * Fetch summary metrics.
     */
    async getMetrics(): Promise<any> {
        if (USE_MOCK) return { ...MOCK_METRICS };

        return {
            totalScanned: 0,
            threatsBlocked: 0,
            cleanEmails: 0,
            detectionAccuracy: 0
        };
    }
};
