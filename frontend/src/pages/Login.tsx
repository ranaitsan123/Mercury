import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { loginMock } from "@/lib/auth";
import { USE_MOCK } from "@/lib/data";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (USE_MOCK) {
            // MOCK MODE: Simulate successful login without real network calls
            setTimeout(() => {
                loginMock();
                toast.success("Mock Login Successful", {
                    description: "You are now logged in to the mock dashboard.",
                });
                navigate("/");
                setIsLoading(false);
            }, 800);
            return;
        }

        // REAL MODE: Backend authentication
        try {
            const response = await fetch("http://localhost:8000/auth/token/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                const token = data.access || data.token;
                if (token) {
                    // We'd use setAccessToken here in a real scenario
                    // setAccessToken(token); 
                    loginMock(); // Reusing mock helper for session marking
                    toast.success("Login Successful");
                    navigate("/");
                }
            } else {
                toast.error("Login Failed", { description: data.detail || "Invalid credentials" });
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Network Error", {
                description: "Could not connect to the authentication server.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to sign in to your dashboard
                    </CardDescription>
                    {USE_MOCK && (
                        <div className="mt-2 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Backend not connected – running in mock mode
                        </div>
                    )}
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </Button>
                        <div className="text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link to="/signup" className="underline underline-offset-4 hover:text-primary">
                                Create an account
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
