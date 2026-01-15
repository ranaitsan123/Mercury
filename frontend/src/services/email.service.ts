/**
 * Email Service
 *
 * Purpose:
 * - Read emails via GraphQL
 * - Send emails via REST
 * - Keep mock mode for UI dev
 */

import { client } from "@/lib/apolloClient";
import { GET_MY_EMAILS } from "@/graphql/queries";
import {
    MOCK_EMAIL_LOGS,
    MOCK_THREATS,
    MOCK_THREATS_BY_DAY,
    MOCK_METRICS
} from "@/lib/mockData";
import { authenticatedFetch } from "@/lib/api";

/* =========================
   TYPES
========================= */

export type EmailLog = {
    id: string;
    sender: string;
    recipient: string;
    subject: string;
    body?: string;
    createdAt: string;
    folder?: "inbox" | "sent";
    scan?: {
        result: "safe" | "malicious" | "clean" | "dangerous";
        confidence?: number;
    };
};

export type Threat = {
    id: string;
    subject: string;
    type: string;
    from: string;
    datetime?: string;
};

/* =========================
   DATA MODE
========================= */

export const DATA_MODE = import.meta.env.VITE_DATA_MODE || "mock";
const USE_MOCK = DATA_MODE === "mock";

/* =========================
   SERVICE
========================= */

export const emailService = {
    /**
     * 📩 Fetch emails (GraphQL)
     */
    async getEmails(folder?: string): Promise<EmailLog[]> {
        if (USE_MOCK) return [...MOCK_EMAIL_LOGS];

        try {
            const result = await client.query<{ myEmails: EmailLog[] }>({
                query: GET_MY_EMAILS,
                variables: {
                    folder,
                    limit: 50,
                    offset: 0
                },
                fetchPolicy: "network-only"
            });

            return result.data.myEmails || [];
        } catch (error) {
            console.error("Failed to fetch emails via GraphQL:", error);
            return [];
        }
    },

    /**
     * 📄 Paginated logs (frontend-side)
     */
    async getPaginatedLogs(
        page: number,
        itemsPerPage: number,
        filters?: any
    ): Promise<{ data: EmailLog[]; total: number }> {
        const allLogs = await this.getEmails();
        let filtered = allLogs;

        if (filters?.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(
                (l) =>
                    l.subject.toLowerCase().includes(term) ||
                    l.sender.toLowerCase().includes(term)
            );
        }

        if (filters?.statusFilter?.length > 0) {
            filtered = filtered.filter((l) =>
                filters.statusFilter.includes(l.scan?.result || "")
            );
        }

        const start = (page - 1) * itemsPerPage;
        return {
            data: filtered.slice(start, start + itemsPerPage),
            total: filtered.length
        };
    },

    /**
     * 🚨 Latest threats
     */
    async getLatestThreats(): Promise<Threat[]> {
        if (USE_MOCK) return [...MOCK_THREATS];
        return [];
    },

    /**
     * 📊 Threat trends
     */
    async getThreatTrends(): Promise<any[]> {
        if (USE_MOCK) return [...MOCK_THREATS_BY_DAY];
        return [];
    },

    /**
     * 📈 Summary metrics
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
     * ✉️ SEND EMAIL (REST — NOT GRAPHQL)
     * Endpoint: POST /emails/send/
     */
    async sendEmail(
        recipient: string,
        subject: string,
        body: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await authenticatedFetch("/emails/send/", {
                method: "POST",
                body: JSON.stringify({
                    to: recipient,
                    subject,
                    body
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return {
                    success: false,
                    message:
                        errorData?.error ||
                        errorData?.detail ||
                        "Failed to send email"
                };
            }

            const data = await response.json();
            return {
                success: true,
                message: "Email sent successfully"
            };
        } catch (error: any) {
            console.error("REST sendEmail error:", error);
            return {
                success: false,
                message:
                    error.message ||
                    "Unable to reach the email gateway"
            };
        }
    }
};
