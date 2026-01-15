import * as React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Graphism } from "@/lib/Graphism";
import { animate } from "animejs";

export default function ComposePage() {
    const navigate = useNavigate();
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const graphismRef = React.useRef<Graphism | null>(null);

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
            animate('.compose-card', {
                translateY: [20, 0],
                opacity: [0, 1],
                easing: 'easeOutExpo',
                duration: 800,
                delay: 100
            });
        } catch (e) {
            console.error("AnimeJS error:", e);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for sending logic
        console.log("Sending email...");
        navigate("/");
    };

    const glassCardClass = "bg-background/60 backdrop-blur-xl border-accent/20 shadow-2xl";

    return (
        <Layout>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-[-1] pointer-events-none opacity-50"
            />

            <div className="container max-w-2xl px-4 py-8 mx-auto">
                <Button
                    variant="ghost"
                    className="mb-4 gap-2 hover:bg-accent/20"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>

                <Card className={`compose-card opacity-0 ${glassCardClass}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            Compose Message
                        </CardTitle>
                        <CardDescription>
                            Draft and send a secure message through the AI gateway
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="recipient">Recipient</Label>
                                <Input
                                    id="recipient"
                                    placeholder="user@example.com"
                                    className="bg-background/40"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="Important Security Update"
                                    className="bg-background/40"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="body">Message</Label>
                                <Textarea
                                    id="body"
                                    placeholder="Type your message here..."
                                    className="min-h-[200px] bg-background/40"
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 border-t border-border/40 pt-6">
                            <Button variant="ghost" onClick={() => navigate("/")}>Cancel</Button>
                            <Button type="submit" className="gap-2">
                                <Send className="h-4 w-4" />
                                Send Message
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </Layout>
    );
}
