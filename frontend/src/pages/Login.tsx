import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { Graphism } from "@/lib/Graphism";
import { animate } from "animejs";
import { DATA_MODE } from "@/services/email.service";

export default function LoginPage() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const navigate = useNavigate();

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const graphismRef = React.useRef<Graphism | null>(null);

    const USE_MOCK = DATA_MODE === 'mock';

    // Init Graphism
    React.useEffect(() => {
        if (canvasRef.current && !graphismRef.current) {
            try {
                graphismRef.current = new Graphism({
                    canvas: canvasRef.current,
                    particleCount: 60,
                    connectionDistance: 150,
                    mouseDistance: 200,
                    color: '99, 102, 241',
                });
            } catch (e) {
                console.error("Graphism init error:", e);
            }
        }
    }, []);

    // Animation
    React.useEffect(() => {
        try {
            animate('.auth-card', {
                translateY: [20, 0],
                opacity: [0, 1],
                easing: 'easeOutExpo',
                duration: 800,
                delay: 200
            });
        } catch (e) {
            console.error("AnimeJS error:", e);
            const el = document.querySelector('.auth-card') as HTMLElement;
            if (el) el.style.opacity = '1';
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await authService.login(username, password);

        if (result.success) {
            const profile = authService.getUserProfile();
            toast.success("Login Successful", {
                description: profile ? `Welcome back, ${profile.username || profile.email}!` : "Welcome back!"
            });
            navigate("/");
        } else {
            toast.error("Login Failed", {
                description: result.error || "Review your credentials and check if the backend is online."
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background/20 px-4">
            {/* Background Canvas */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-[-1] pointer-events-none opacity-50"
            />

            <Card className="w-full max-w-sm auth-card opacity-0 bg-background/60 backdrop-blur-xl border-accent/20 shadow-2xl">
                <CardHeader className="space-y-1 flex flex-col items-center pb-2">
                    <div className="mb-4">
                        <img src="/image.png" alt="Open Mercury Logo" className="h-16 w-auto rounded-lg shadow-lg border border-primary/20" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                        Enter your username to sign in to your dashboard
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
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="johndoe"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                                className="bg-background/50"
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
                                className="bg-background/50"
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