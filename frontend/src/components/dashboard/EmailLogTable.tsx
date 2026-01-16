/**
 * Email Log Table Component (Controlled)
 *
 * Backend-compatible version
 * - GraphQL-ready
 * - Works with real scan results
 * - UI preserved
 */

import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmailLog } from "@/services/email.service";
import { ListFilter, Search, Mail } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";

/* =========================
   STATUS CONFIG
========================= */

const STATUS_OPTIONS = ["safe", "malicious"] as const;

const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
        case "safe":
            return "success";
        case "malicious":
            return "destructive";
        default:
            return "default";
    }
};

/* =========================
   PROPS
========================= */

export interface EmailLogTableProps {
    logs: EmailLog[];
    isLoading: boolean;
    totalItems: number;
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    searchTerm: string;
    onSearchChange: (search: string) => void;
    statusFilter: string[];
    onStatusFilterChange: (status: string[]) => void;
    fromLabel?: string;
    className?: string;
}

/* =========================
   COMPONENT
========================= */

export default function EmailLogTable({
    logs,
    isLoading,
    totalItems,
    totalPages,
    currentPage,
    onPageChange,
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    fromLabel = "From",
    className,
}: EmailLogTableProps) {
    const handleStatusFilterChange = (status: string, checked: boolean) => {
        const next = checked
            ? [...statusFilter, status]
            : statusFilter.filter((s) => s !== status);
        onStatusFilterChange(next);
    };

    const handleClearFilters = () => {
        onSearchChange("");
        onStatusFilterChange([]);
    };

    const hasActiveFilters = searchTerm !== "" || statusFilter.length > 0;

    return (
        <div className={className}>
            {/* FILTER BAR */}
            <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by sender or subject..."
                        className="pl-8 sm:w-full"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 gap-1">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Filter
                                {statusFilter.length > 0 && ` (${statusFilter.length})`}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by scan result</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {STATUS_OPTIONS.map((status) => (
                            <DropdownMenuCheckboxItem
                                key={status}
                                checked={statusFilter.includes(status)}
                                onCheckedChange={(checked) =>
                                    handleStatusFilterChange(status, checked)
                                }
                            >
                                {status}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                        Clear
                    </Button>
                )}
            </div>

            {/* STATES */}
            {isLoading ? (
                <div className="rounded-md border py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : logs.length === 0 ? (
                <div className="rounded-md border">
                    <EmptyState
                        icon={Mail}
                        title={hasActiveFilters ? "No emails found" : "No emails available"}
                        description={
                            hasActiveFilters
                                ? "Try adjusting your filters."
                                : "Emails will appear here once received."
                        }
                        action={
                            hasActiveFilters ? (
                                <Button variant="outline" onClick={handleClearFilters}>
                                    Clear filters
                                </Button>
                            ) : undefined
                        }
                    />
                </div>
            ) : (
                <>
                    {/* TABLE */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{fromLabel}</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Date / Time
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Confidence
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">
                                            {log.sender}
                                        </TableCell>

                                        <TableCell>{log.subject}</TableCell>

                                        <TableCell className="hidden md:table-cell">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant={getStatusBadgeVariant(log.scan?.result)}
                                            >
                                                {log.scan?.result ?? "unknown"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            {log.scan?.confidence !== undefined
                                                ? `${Math.round(log.scan.confidence * 100)}%`
                                                : "N/A"}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINATION */}
                    <div className="flex items-center justify-between py-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {logs.length} of {totalItems} results
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    onPageChange(Math.max(currentPage - 1, 1))
                                }
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    onPageChange(
                                        Math.min(currentPage + 1, totalPages)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
