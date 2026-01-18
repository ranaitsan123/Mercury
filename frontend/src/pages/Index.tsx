/**
 * Dashboard Page (Enchanced "God Level" UI)
 */

import * as React from "react";
import Layout from "@/components/layout/Layout";
import MetricCard from "@/components/dashboard/MetricCard";
import { ShieldCheck, ShieldX, ScanLine, Target } from "lucide-react";
import ThreatsOverTimeChart from "@/components/dashboard/ThreatsOverTimeChart";
import LatestThreats from "@/components/dashboard/LatestThreats";
import EmailLogTable from "@/components/dashboard/EmailLogTable";
import EmailDetailModal from "@/components/dashboard/EmailDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { emailService, EmailLog, Threat } from "@/services/email.service";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { Graphism } from "@/lib/Graphism";
import { animate, stagger } from "animejs";
import { useQuery } from "@apollo/client/react";
import { GET_MY_EMAILS } from "@/graphql/queries";

interface MyEmailsData {
    myEmails: {
        id: string;
        sender: string;
        recipient: string;
        subject: string;
        body: string;
        createdAt: string;
        scan?: {
            result: string;
            confidence: number;
        };
    }[];
}

export default function DashboardPage() {
    // Metrics State
    const [metrics, setMetrics] = React.useState<{
        totalScanned: number;
        threatsBlocked: number;
        cleanEmails: number;
        detectionAccuracy: number;
    } | null>(null);
    const [isLoadingMetrics, setIsLoadingMetrics] = React.useState(true);

    // Latest Threats State
    const [threats, setThreats] = React.useState<Threat[]>([]);
    const [isLoadingThreats, setIsLoadingThreats] = React.useState(true);

    // Chart Data State
    const [threatsHistory, setThreatsHistory] = React.useState<Array<{ date: string; threats: number }>>([]);
    const [isLoadingChart, setIsLoadingChart] = React.useState(true);

    // Folder State
    const [selectedFolder, setSelectedFolder] = React.useState<"inbox" | "sent">("inbox");
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 15;

    // Email Logs State via useQuery
    const {
        data: emailData,
        loading: isLoadingLogs,
        error: emailError
    } = useQuery<MyEmailsData>(GET_MY_EMAILS, {
        variables: {
            folder: selectedFolder,
            limit: 100, // Fetch a larger batch for client-side pagination within the folder
            offset: 0   // Fetch from start since we paginate locally for now
        },
    });

    const [searchTerm, setSearchTerm] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const graphismRef = React.useRef<Graphism | null>(null);

    // Init Graphism
    React.useEffect(() => {
        if (canvasRef.current && !graphismRef.current) {
            try {
                graphismRef.current = new Graphism({
                    canvas: canvasRef.current,
                    particleCount: 80,
                    connectionDistance: 150,
                    mouseDistance: 200,
                    color: '99, 102, 241', // Indigo-500 for a cool tech feel
                });
            } catch (e) {
                console.error("Graphism init error:", e);
            }
        }
    }, []);

    // Animations
    React.useEffect(() => {
        if (!isLoadingMetrics && metrics) {
            try {
                animate('.metric-card', {
                    translateY: [20, 0],
                    opacity: [0, 1],
                    delay: stagger(100),
                    easing: 'easeOutExpo',
                    duration: 800
                });
            } catch (e) {
                console.error("AnimeJS error:", e);
                document.querySelectorAll('.metric-card').forEach((el) => {
                    (el as HTMLElement).style.opacity = '1';
                });
            }
        }
    }, [isLoadingMetrics, metrics]);

    React.useEffect(() => {
        try {
            animate('.dashboard-section', {
                translateY: [30, 0],
                opacity: [0, 1],
                delay: stagger(200, { start: 400 }),
                easing: 'easeOutExpo',
                duration: 1000
            });
        } catch (e) {
            console.error("AnimeJS error:", e);
            document.querySelectorAll('.dashboard-section').forEach((el) => {
                (el as HTMLElement).style.opacity = '1';
            });
        }
    }, []);

    // Unified data fetcher for metrics and threats
    const refreshDashboardData = React.useCallback(async () => {
        setIsLoadingMetrics(true);
        setIsLoadingThreats(true);
        setIsLoadingChart(true);
        try {
            const [metricsData, threatsData, historyData] = await Promise.all([
                emailService.getMetrics(),
                emailService.getLatestThreats(),
                emailService.getThreatTrends()
            ]);
            setMetrics(metricsData);
            setThreats(threatsData);
            setThreatsHistory(historyData);
        } catch (error) {
            console.error("Failed to refresh dashboard data:", error);
        } finally {
            setIsLoadingMetrics(false);
            setIsLoadingThreats(false);
            setIsLoadingChart(false);
        }
    }, []);

    // Initial fetch
    React.useEffect(() => {
        refreshDashboardData();
    }, [refreshDashboardData]);

    // Real-time reactivity: Refresh dashboard stats whenever new email data arrives via Apollo
    React.useEffect(() => {
        if (emailData?.myEmails) {
            refreshDashboardData();
        }
    }, [emailData, refreshDashboardData]);

    const [userEmail, setUserEmail] = React.useState<string | null>(null);

    // Sync user profile on mount to ensure filtering works correctly
    React.useEffect(() => {
        const syncProfile = async () => {
            const profile = await authService.getProfile();
            if (profile?.email) {
                setUserEmail(profile.email.toLowerCase().trim());
            } else {
                const cached = authService.getUserProfile();
                if (cached?.email) {
                    setUserEmail(cached.email.toLowerCase().trim());
                }
            }
        };
        syncProfile();
    }, []);

    // Map GraphQL data to EmailLog format
    const logs: EmailLog[] = React.useMemo(() => {
        if (!emailData?.myEmails) return [];

        // If we don't have the user's identity yet, we can't filter safely. 
        // We'll fallback to showing all if identity is missing to avoid "blackout",
        // but we prioritize identity-based strictly filtering when available.
        const currentIdentity = userEmail;

        return emailData.myEmails
            .filter((email: any) => {
                if (!currentIdentity) return true; // Show all if profile hasn't loaded yet

                const sender = email.sender?.toLowerCase().trim();
                const recipient = email.recipient?.toLowerCase().trim();

                const isSentByMe = sender === currentIdentity;
                const isReceivedByMe = recipient === currentIdentity;

                // Strict Identity-Based Separation
                if (selectedFolder === "sent") {
                    return isSentByMe;
                } else {
                    return isReceivedByMe;
                }
            })
            .map((email: any) => {
                return {
                    ...email,
                    // Presentation: Show the "other" party
                    sender: selectedFolder === 'sent' ? email.recipient : email.sender,
                    scan: email.scan || { result: "safe", confidence: 1.0 }
                };
            });
    }, [emailData, selectedFolder, userEmail]);

    const filteredLogs = React.useMemo(() => {
        let result = logs;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(l => l.subject.toLowerCase().includes(term) || l.sender.toLowerCase().includes(term));
        }
        if (statusFilter.length > 0) {
            result = result.filter(l => statusFilter.includes(l.scan?.result || ""));
        }
        return result;
    }, [logs, searchTerm, statusFilter]);

    const allLogs = filteredLogs;
    const totalItems = allLogs.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const paginatedLogs = allLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset page on filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, selectedFolder]);

    // Error handling for useQuery
    React.useEffect(() => {
        if (emailError) {
            console.error("Failed to fetch emails via Apollo:", emailError);
            toast.error("Query Error", {
                description: "Failed to load messages. Please check your connection."
            });
        }
    }, [emailError]);

    // Threat Viewing Logic
    const [selectedEmailForModal, setSelectedEmailForModal] = React.useState<EmailLog | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

    const handleViewThreat = (threat: Threat) => {
        // Try to find the email in our logs
        const email = logs.find(l => l.id === threat.id || (threat.emailId && l.id === threat.emailId));
        if (email) {
            setSelectedEmailForModal(email);
            setIsDetailModalOpen(true);
        } else {
            // Reconstruct a full EmailLog from enriched Threat data
            setSelectedEmailForModal({
                id: threat.id,
                subject: threat.subject,
                sender: threat.from,
                recipient: threat.recipient || "You",
                createdAt: threat.emailCreatedAt || threat.datetime || new Date().toISOString(),
                scan: { result: "malicious", confidence: threat.confidence },
                body: threat.body || "No content available for this malicious email."
            });
            setIsDetailModalOpen(true);
        }
    };

    // Common Glassy Card Style
    const glassCardClass = "bg-background/60 backdrop-blur-xl border-accent/20 shadow-xl hover:shadow-2xl hover:border-accent/40 transition-all duration-300";

    return (
        <Layout>
            {/* Background Canvas */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-[-1] pointer-events-none opacity-50"
            />

            <ErrorBoundary>
                {isLoadingMetrics ? (
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className={`${glassCardClass} animate-pulse`}>
                                <CardContent className="pt-6">
                                    <LoadingSpinner size="sm" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : metrics ? (
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                        <div className="metric-card">
                            <MetricCard
                                title="Total Emails Scanned"
                                value={metrics.totalScanned.toLocaleString()}
                                icon={(props) => <div className="p-2 bg-primary/10 rounded-lg"><ScanLine {...props} className="h-4 w-4 text-primary" /></div>}
                                description="Real-time"
                                className={glassCardClass}
                            />
                        </div>
                        <div className="metric-card">
                            <MetricCard
                                title="Malicious Emails"
                                value={metrics.threatsBlocked}
                                icon={(props) => <div className="p-2 bg-red-500/10 rounded-lg"><ShieldX {...props} className="h-4 w-4 text-red-500" /></div>}
                                description="Today"
                                className={glassCardClass}
                            />
                        </div>
                        <div className="metric-card">
                            <MetricCard
                                title="Clean Emails"
                                value={metrics.cleanEmails.toLocaleString()}
                                icon={(props) => <div className="p-2 bg-green-500/10 rounded-lg"><ShieldCheck {...props} className="h-4 w-4 text-green-500" /></div>}
                                description="Success"
                                className={glassCardClass}
                            />
                        </div>
                        <div className="metric-card">
                            <MetricCard
                                title="Detection Accuracy"
                                value={`${metrics.detectionAccuracy}%`}
                                icon={(props) => <div className="p-2 bg-blue-500/10 rounded-lg"><Target {...props} className="h-4 w-4 text-blue-500" /></div>}
                                className={glassCardClass}
                            />
                        </div>
                    </div>
                ) : null}
            </ErrorBoundary>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-8">
                <div className="xl:col-span-2 dashboard-section">
                    <ErrorBoundary>
                        {isLoadingChart ? (
                            <Card className={glassCardClass}>
                                <CardContent className="py-12">
                                    <LoadingSpinner />
                                </CardContent>
                            </Card>
                        ) : (
                            <div className={`h-full ${glassCardClass} rounded-xl overflow-hidden`}>
                                <div className="p-6">
                                    <h3 className="font-semibold text-lg mb-4">Threat Trends</h3>
                                    <ThreatsOverTimeChart data={threatsHistory} />
                                </div>
                            </div>
                        )}
                    </ErrorBoundary>
                </div>
                <div className="dashboard-section">
                    <ErrorBoundary>
                        {isLoadingThreats ? (
                            <Card className={glassCardClass}>
                                <CardContent className="py-12">
                                    <LoadingSpinner />
                                </CardContent>
                            </Card>
                        ) : (
                            <div className={`h-full ${glassCardClass} rounded-xl overflow-hidden`}>
                                <LatestThreats
                                    threats={threats}
                                    onView={handleViewThreat}
                                />
                            </div>
                        )}
                    </ErrorBoundary>
                </div>
            </div>

            <EmailDetailModal
                email={selectedEmailForModal}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
            />

            <div className="mt-8 dashboard-section opacity-0">
                <Card className={glassCardClass}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Email Logs</CardTitle>
                        <div className="flex bg-accent/20 rounded-full p-1 border border-accent/20">
                            <button
                                onClick={() => setSelectedFolder("inbox")}
                                className={`px-4 py-1 rounded-full text-sm transition-all ${selectedFolder === "inbox" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Inbox
                            </button>
                            <button
                                onClick={() => setSelectedFolder("sent")}
                                className={`px-4 py-1 rounded-full text-sm transition-all ${selectedFolder === "sent" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Sent
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ErrorBoundary>
                            <EmailLogTable
                                logs={paginatedLogs}
                                isLoading={isLoadingLogs}
                                totalItems={totalItems}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                statusFilter={statusFilter}
                                onStatusFilterChange={setStatusFilter}
                                fromLabel={selectedFolder === 'sent' ? 'To' : 'From'}
                            />
                        </ErrorBoundary>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
