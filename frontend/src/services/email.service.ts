/**
 * Email Service
 * 
 * Purpose: Data access layer for email-related operations via GraphQL.
 */

import { client } from "@/lib/apolloClient";
import { GET_MY_EMAILS, SEND_EMAIL_MUTATION } from "@/graphql/queries";
import { MOCK_EMAIL_LOGS, MOCK_THREATS, MOCK_THREATS_BY_DAY, MOCK_METRICS } from "@/lib/mockData";

export type EmailLog = {
    id: string;
    from: string;
    subject: string;
    datetime: string;
    status: "Clean" | "Suspicious" | "Malicious" | "Dangerous";
    confidence?: number;
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

interface SendEmailResponse {
    sendEmail: {
        success: boolean;
        message: string;
        email?: {
            id: string;
            subject: string;
        };
    };
}

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
    },

    /**
     * Send an email via GraphQL mutation.
     */
    async sendEmail(recipient: string, subject: string, body: string): Promise<{ success: boolean; message: string }> {
        // According to user request: "Do not use mock data here"
        // Even if USE_MOCK is true, we will try to call the real API if it's for sending logic
        // This is a common pattern when transitioning from mock to real parts.

        try {
            const result = await client.mutate<SendEmailResponse>({
                mutation: SEND_EMAIL_MUTATION,
                variables: { recipient, subject, body }
            });

            if (result.data?.sendEmail?.success) {
                return {
                    success: true,
                    message: result.data.sendEmail.message || "Email sent successfully"
                };
            } else {
                return {
                    success: false,
                    message: result.data?.sendEmail?.message || "Failed to send email"
                };
            }
        } catch (error: any) {
            console.error("GraphQL sendEmail error:", error);
            // Extract meaningful error message if possible
            const errorMessage = error.message || "An unexpected error occurred while sending the email.";
            return { success: false, message: errorMessage };
        }
    }
};
