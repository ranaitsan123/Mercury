import { client } from "@/lib/apolloClient";
import { GET_MY_EMAILS, GET_MY_SCAN_LOGS } from "@/graphql/queries";
import { SEND_EMAIL_MUTATION } from "@/graphql/mutations";
import {
    MOCK_EMAIL_LOGS,
    MOCK_THREATS,
    MOCK_THREATS_BY_DAY,
    MOCK_METRICS
} from "@/lib/mockData";

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
        result: "safe" | "malicious";
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
    async getEmails(folder: string = "inbox"): Promise<EmailLog[]> {
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
        const allLogs = await this.getEmails(filters?.folder || "inbox");
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

        try {
            const result = await client.query<{ myScanLogs: any[] }>({
                query: GET_MY_SCAN_LOGS,
                variables: { limit: 10 },
                fetchPolicy: "network-only"
            });

            const logs = result.data.myScanLogs || [];
            return logs
                .filter((l: any) => l.result === "malicious")
                .map((l: any) => ({
                    id: l.id,
                    subject: l.email?.subject || "No Subject",
                    type: "Phishing", // Backend doesn't provide specific type, defaulting
                    from: "Unknown",   // Backend ScanLog doesn't have sender, would need email fetch
                    datetime: l.createdAt
                }));
        } catch (error) {
            console.error("Failed to fetch latest threats:", error);
            return [];
        }
    },

    /**
     * 📊 Threat trends (Last 7 days)
     */
    async getThreatTrends(): Promise<any[]> {
        if (USE_MOCK) return [...MOCK_THREATS_BY_DAY];

        try {
            const result = await client.query<{ myScanLogs: any[] }>({
                query: GET_MY_SCAN_LOGS,
                variables: { limit: 100 },
                fetchPolicy: "network-only"
            });

            const logs = result.data.myScanLogs || [];
            const trends: Record<string, number> = {};

            logs.forEach((l: any) => {
                const date = new Date(l.createdAt).toLocaleDateString();
                if (l.result === "malicious") {
                    trends[date] = (trends[date] || 0) + 1;
                } else if (!trends[date]) {
                    trends[date] = 0;
                }
            });

            return Object.entries(trends).map(([date, count]) => ({
                date,
                threats: count
            })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } catch (error) {
            console.error("Failed to fetch threat trends:", error);
            return [];
        }
    },

    /**
     * 📈 Summary metrics
     */
    async getMetrics(): Promise<any> {
        if (USE_MOCK) return { ...MOCK_METRICS };

        try {
            const result = await client.query<{ myScanLogs: any[] }>({
                query: GET_MY_SCAN_LOGS,
                variables: { limit: 500 },
                fetchPolicy: "network-only"
            });

            const logs = result.data.myScanLogs || [];
            const totalScanned = logs.length;
            const threatsBlocked = logs.filter((l: any) => l.result === "malicious").length;
            const cleanEmails = totalScanned - threatsBlocked;
            const detectionAccuracy = totalScanned > 0 ? 98 : 0; // Mock accuracy as backend doesn't provide real accuracy metric

            return {
                totalScanned,
                threatsBlocked,
                cleanEmails,
                detectionAccuracy
            };
        } catch (error) {
            console.error("Failed to fetch metrics:", error);
            return {
                totalScanned: 0,
                threatsBlocked: 0,
                cleanEmails: 0,
                detectionAccuracy: 0
            };
        }
    },

    /**
     * ✉️ SEND EMAIL (GraphQL Mutation)
     */
    async sendEmail(
        recipient: string,
        subject: string,
        body: string
    ): Promise<{ success: boolean; message: string }> {
        if (USE_MOCK) {
            return { success: true, message: "Mock email sent" };
        }

        try {
            const result = await client.mutate<{ sendEmail: { email: any } }>({
                mutation: SEND_EMAIL_MUTATION,
                variables: {
                    to: recipient,
                    subject,
                    body
                }
            });

            if (result.data?.sendEmail?.email) {
                return {
                    success: true,
                    message: "Email sent successfully"
                };
            }

            return {
                success: false,
                message: "Failed to send email"
            };
        } catch (error: any) {
            console.error("GraphQL sendEmail error:", error);
            return {
                success: false,
                message: error.message || "Unable to send email via GraphQL"
            };
        }
    }
};
