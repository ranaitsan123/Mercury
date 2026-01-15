import React from "react";
import { Navigate } from "react-router-dom";
import { authService } from "@/services/auth.service";

interface PublicRouteProps {
    children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
    if (authService.isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
