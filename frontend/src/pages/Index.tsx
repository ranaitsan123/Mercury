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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getSummaryMetrics, getPaginatedEmailLogs, getLatestThreats, getThreatsByDay } from "@/services/emailService";
import { EmailLog, Threat } from "@/lib/data";
import { toast } from "sonner";
import { Graphism } from "@/lib/Graphism";
import { animate, stagger } from "animejs";

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

    // Email Logs State
    const [logs, setLogs] = React.useState<EmailLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = React.useState(true);
    const [totalPages, setTotalPages] = React.useState(0);
    const [totalItems, setTotalItems] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string[]>([]);

    const itemsPerPage = 7;
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
        return () => {
            // Cleanup if needed
        };
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
                // Fallback: manually set opacity if animation fails
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



    // Fetch Metrics
    React.useEffect(() => {
        const fetchMetricsData = async () => {
            setIsLoadingMetrics(true);
            try {
                const data = await getSummaryMetrics();
                setMetrics(data);
            } catch (error) {
                console.error("Failed to fetch metrics:", error);
                toast.error("Metrics Error", {
                    description: "Could not load dashboard metrics."
                });
            } finally {
                setIsLoadingMetrics(false);
            }
        };
        fetchMetricsData();
    }, []);

    // Fetch Latest Threats and History
    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoadingThreats(true);
            setIsLoadingChart(true);
            try {
                const [threatsData, historyData] = await Promise.all([
                    getLatestThreats(),
                    getThreatsByDay()
                ]);
                setThreats(threatsData);
                setThreatsHistory(historyData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                toast.error("Dashboard Error", {
                    description: "Could not load current threats or history."
                });
            } finally {
                setIsLoadingThreats(false);
                setIsLoadingChart(false);
            }
        };
        fetchData();
    }, []);

    // Fetch Email Logs
    React.useEffect(() => {
        const fetchLogsData = async () => {
            setIsLoadingLogs(true);
            try {
                const response = await getPaginatedEmailLogs(
                    { searchTerm, statusFilter },
                    { page: currentPage, itemsPerPage }
                );
                setLogs(response.data);
                setTotalPages(response.totalPages);
                setTotalItems(response.total);
            } catch (error) {
                console.error("Failed to fetch logs:", error);
                toast.error("Log Error", {
                    description: "Could not load email scan logs."
                });
            } finally {
                setIsLoadingLogs(false);
            }
        };
        fetchLogsData();
    }, [searchTerm, statusFilter, currentPage]);

    // Reset page on filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

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
                                description="Today"
                                className={glassCardClass}
                            />
                        </div>
                        <div className="metric-card">
                            <MetricCard
                                title="Threats Blocked"
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
                                description="Today"
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
                                <LatestThreats threats={threats} />
                            </div>
                        )}
                    </ErrorBoundary>
                </div>
            </div>

            <div className="mt-8 dashboard-section opacity-0">
                <Card className={glassCardClass}>
                    <CardHeader>
                        <CardTitle>Email Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ErrorBoundary>
                            <EmailLogTable
                                logs={logs}
                                isLoading={isLoadingLogs}
                                totalItems={totalItems}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                statusFilter={statusFilter}
                                onStatusFilterChange={setStatusFilter}
                            />
                        </ErrorBoundary>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
