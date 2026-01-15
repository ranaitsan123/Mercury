import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, AlertCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { Graphism } from "@/lib/Graphism";
import { animate } from "animejs";
import { DATA_MODE } from "@/services/email.service";

export default function SignupPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Password mismatch", { description: "Passwords do not match." });
            return;
        }

        const result = await authService.signup(email, password);

        if (result.success) {
            toast.success("Account Created", {
                description: "You can now log in with your new account.",
            });
            navigate("/login");
        } else {
            let errorMessage = "An error occurred during account creation.";
            let description = "Please try again later.";

            if (result.error) {
                if (typeof result.error === 'string') {
                    errorMessage = result.error;
                } else {
                    // Handle DRF-style dynamic errors (e.g., { email: ["Already exists"] })
                    const keys = Object.keys(result.error);
                    if (keys.length > 0) {
                        errorMessage = "Signup Failed";
                        description = keys.map(k => `${k}: ${result.error![k].join(', ')}`).join('. ');
                    }
                }
            }

            toast.error(errorMessage, {
                description: description,
            });
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background/20 px-4">
            {/* Background Canvas */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-[-1] pointer-events-none opacity-50"
            />

            <Card className="w-full max-w-sm auth-card opacity-0 bg-background/60 backdrop-blur-xl border-accent/20 shadow-2xl">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                        <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your details below to create your account
                    </CardDescription>
                    {USE_MOCK && (
                        <div className="mt-2 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Backend not connected – running in mock mode
                        </div>
                    )}
                </CardHeader>
                <form onSubmit={handleSignup}>
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
                                className="bg-background/50"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full">
                            Create account
                        </Button>
                        <div className="text-center text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                                Login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
