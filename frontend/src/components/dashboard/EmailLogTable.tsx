/**
 * Email Log Table Component (Controlled)
 * 
 * Refactored to accept all data and state via props.
 * This prepares it for GraphQL integration where the parent component
 * will manage the data fetching and state.
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
import { EmailLog } from "@/lib/data";
import { ListFilter, Search, Mail } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";

const STATUS_OPTIONS = ["Clean", "Suspicious", "Malicious"] as const;

const getStatusBadgeVariant = (status: EmailLog["status"]) => {
    switch (status) {
        case "Clean":
            return "success";
        case "Suspicious":
            return "warning";
        case "Malicious":
            return "destructive";
        default:
            return "default";
    }
};

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
    className?: string;
}

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
    className,
}: EmailLogTableProps) {
    const handleStatusFilterChange = (status: string, checked: boolean) => {
        const nextFilter = checked
            ? [...statusFilter, status]
            : statusFilter.filter((s) => s !== status);
        onStatusFilterChange(nextFilter);
    };

    const handleClearFilters = () => {
        onSearchChange("");
        onStatusFilterChange([]);
    };

    const hasActiveFilters = searchTerm !== "" || statusFilter.length > 0;

    return (
        <div className={className}>
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
                        <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {STATUS_OPTIONS.map((status) => (
                            <DropdownMenuCheckboxItem
                                key={status}
                                checked={statusFilter.includes(status)}
                                onCheckedChange={(checked) => handleStatusFilterChange(status, checked)}
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

            {isLoading ? (
                <div className="rounded-md border py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : logs.length === 0 ? (
                <div className="rounded-md border">
                    <EmptyState
                        icon={Mail}
                        title={hasActiveFilters ? "No emails found" : "No email logs available"}
                        description={
                            hasActiveFilters
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Email logs will appear here once available."
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
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>From</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead className="hidden md:table-cell">Date/Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Confidence</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">{log.from}</TableCell>
                                        <TableCell>{log.subject}</TableCell>
                                        <TableCell className="hidden md:table-cell">{log.datetime}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(log.status)}>
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{log.confidence}%</TableCell>
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
                    <div className="flex items-center justify-between py-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {logs.length} of {totalItems} results
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
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
                                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
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