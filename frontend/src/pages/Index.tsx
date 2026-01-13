/**
 * Dashboard Page (Refactored for controlled components)
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

    return (
        <Layout>
            <ErrorBoundary>
                {isLoadingMetrics ? (
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <LoadingSpinner size="sm" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : metrics ? (
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                        <MetricCard
                            title="Total Emails Scanned"
                            value={metrics.totalScanned.toLocaleString()}
                            icon={ScanLine}
                            description="Today"
                        />
                        <MetricCard
                            title="Threats Blocked"
                            value={metrics.threatsBlocked}
                            icon={ShieldX}
                            description="Today"
                        />
                        <MetricCard
                            title="Clean Emails"
                            value={metrics.cleanEmails.toLocaleString()}
                            icon={ShieldCheck}
                            description="Today"
                        />
                        <MetricCard
                            title="Detection Accuracy"
                            value={`${metrics.detectionAccuracy}%`}
                            icon={Target}
                        />
                    </div>
                ) : null}
            </ErrorBoundary>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-8">
                <div className="xl:col-span-2">
                    <ErrorBoundary>
                        {isLoadingChart ? (
                            <Card>
                                <CardContent className="py-12">
                                    <LoadingSpinner />
                                </CardContent>
                            </Card>
                        ) : (
                            <ThreatsOverTimeChart data={threatsHistory} />
                        )}
                    </ErrorBoundary>
                </div>
                <div>
                    <ErrorBoundary>
                        {isLoadingThreats ? (
                            <Card>
                                <CardContent className="py-12">
                                    <LoadingSpinner />
                                </CardContent>
                            </Card>
                        ) : (
                            <LatestThreats threats={threats} />
                        )}
                    </ErrorBoundary>
                </div>
            </div>

            <div className="mt-8">
                <Card>
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