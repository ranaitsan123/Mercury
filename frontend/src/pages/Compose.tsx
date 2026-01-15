import * as React from "react";
import Layout from "@/components/layout/Layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft, Paperclip, Eraser } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Graphism } from "@/lib/Graphism";
import { animate } from "animejs";
import { toast } from "sonner";

import { authenticatedFetch } from "@/lib/api";

export default function ComposePage() {
    const navigate = useNavigate();

    const [recipient, setRecipient] = React.useState("");
    const [subject, setSubject] = React.useState("");
    const [body, setBody] = React.useState("");
    const [isSending, setIsSending] = React.useState(false);

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const graphismRef = React.useRef<Graphism | null>(null);

    // Init background animation
    React.useEffect(() => {
        if (canvasRef.current && !graphismRef.current) {
            try {
                graphismRef.current = new Graphism({
                    canvas: canvasRef.current,
                    particleCount: 60,
                    connectionDistance: 150,
                    mouseDistance: 200,
                    color: "99, 102, 241",
                });
            } catch (e) {
                console.error("Graphism init error:", e);
            }
        }
    }, []);

    // Card animation
    React.useEffect(() => {
        try {
            animate(".compose-card", {
                translateY: [20, 0],
                opacity: [0, 1],
                easing: "easeOutExpo",
                duration: 800,
                delay: 100,
            });
        } catch (e) {
            console.error("AnimeJS error:", e);
        }
    }, []);

    const handleClear = () => {
        setRecipient("");
        setSubject("");
        setBody("");
        toast.info("Draft cleared");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!recipient.includes("@")) {
            toast.error("Invalid recipient", {
                description: "Please enter a valid email address.",
            });
            return;
        }

        setIsSending(true);

        try {
            const response = await authenticatedFetch("/emails/send/", {
                method: "POST",
                body: JSON.stringify({
                    to: recipient,
                    subject,
                    body,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to send email");
            }

            toast.success("Message Sent", {
                description: "Your message has been delivered securely.",
            });

            setRecipient("");
            setSubject("");
            setBody("");

            setTimeout(() => navigate("/"), 800);
        } catch (error: any) {
            toast.error("Send failed", {
                description: error.message || "Could not connect to backend",
            });
        } finally {
            setIsSending(false);
        }
    };

    const glassCardClass =
        "bg-background/60 backdrop-blur-xl border-accent/20 shadow-2xl";

    return (
        <Layout>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-[-1] pointer-events-none opacity-50"
            />

            <div className="container max-w-3xl px-4 py-8 mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        className="gap-2 hover:bg-accent/20"
                        onClick={() => navigate("/")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        className="bg-background/20 backdrop-blur-sm"
                    >
                        <Eraser className="h-4 w-4 mr-2" />
                        Clear Draft
                    </Button>
                </div>

                <Card
                    className={`compose-card opacity-0 ${glassCardClass} overflow-hidden`}
                >
                    <CardHeader className="border-b border-border/40 bg-accent/5">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            New Message
                        </CardTitle>
                        <CardDescription>
                            All outgoing messages are scanned by AI before delivery
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-0">
                            <div className="flex flex-col">
                                <div className="flex items-center px-6 py-3 border-b border-border/40 gap-3">
                                    <Label
                                        htmlFor="recipient"
                                        className="text-muted-foreground w-12"
                                    >
                                        To
                                    </Label>
                                    <Input
                                        id="recipient"
                                        type="email"
                                        placeholder="recipient@example.com"
                                        className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0"
                                        required
                                        value={recipient}
                                        onChange={(e) =>
                                            setRecipient(e.target.value)
                                        }
                                        disabled={isSending}
                                    />
                                </div>

                                <div className="flex items-center px-6 py-3 border-b border-border/40 gap-3">
                                    <Label
                                        htmlFor="subject"
                                        className="text-muted-foreground w-12"
                                    >
                                        Subject
                                    </Label>
                                    <Input
                                        id="subject"
                                        placeholder="Security Analysis Result"
                                        className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0"
                                        required
                                        value={subject}
                                        onChange={(e) =>
                                            setSubject(e.target.value)
                                        }
                                        disabled={isSending}
                                    />
                                </div>

                                <div className="p-6">
                                    <Textarea
                                        id="body"
                                        placeholder="Start typing your secure message..."
                                        className="min-h-[400px] border-none bg-transparent shadow-none focus-visible:ring-0 resize-none p-0 leading-relaxed text-base"
                                        required
                                        value={body}
                                        onChange={(e) =>
                                            setBody(e.target.value)
                                        }
                                        disabled={isSending}
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-accent/5">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground"
                            >
                                <Paperclip className="h-5 w-5" />
                            </Button>

                            <Button
                                type="submit"
                                className="gap-2 px-6 shadow-lg shadow-primary/20"
                                disabled={isSending}
                            >
                                {isSending ? "Sending..." : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Send Securely
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </Layout>
    );
}
