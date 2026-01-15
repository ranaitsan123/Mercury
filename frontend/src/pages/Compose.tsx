import * as React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft, Paperclip, Eraser } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Graphism } from "@/lib/Graphism";
import { animate } from "animejs";
import { toast } from "sonner";

import { CombinedGraphQLErrors } from "@apollo/client";
import { useMutation as useApolloMutation } from "@apollo/client/react";
import { SEND_EMAIL_MUTATION, GET_MY_EMAILS } from "@/graphql/queries";

interface SendEmailData {
    sendEmail: {
        success: boolean;
        message: string;
        email?: {
            id: string;
            sender: string;
            recipient: string;
            subject: string;
            createdAt: string;
            scan?: {
                result: string;
                confidence?: number;
            };
        };
    };
}

interface SendEmailVariables {
    recipient: string;
    subject: string;
    body: string;
}

interface MyEmailsData {
    myEmails: any[];
}

export default function ComposePage() {
    const navigate = useNavigate();
    const [recipient, setRecipient] = React.useState("");
    const [subject, setSubject] = React.useState("");
    const [body, setBody] = React.useState("");

    // Apollo useMutation hook
    const [sendEmail, { loading: isSending }] = useApolloMutation<SendEmailData, SendEmailVariables>(SEND_EMAIL_MUTATION, {
        update: (cache, { data }) => {
            if (data?.sendEmail?.success && data.sendEmail.email) {
                const newEmail = data.sendEmail.email;

                try {
                    // Optimized: Read the existing cache for the 'sent' folder
                    const existingData = cache.readQuery<MyEmailsData>({
                        query: GET_MY_EMAILS,
                        variables: { folder: 'sent' }
                    });

                    if (existingData) {
                        cache.writeQuery({
                            query: GET_MY_EMAILS,
                            variables: { folder: 'sent' },
                            data: {
                                myEmails: [newEmail, ...existingData.myEmails]
                            }
                        });
                        console.log("Apollo Cache updated: Added new email to 'sent' folder.");
                    }
                } catch (e) {
                    // Query might not be in cache yet, that's fine
                    console.log("Query GET_MY_EMAILS not found in cache, skipping manual update.");
                }
            }
        },
        onCompleted: (data) => {
            if (data.sendEmail.success) {
                toast.success("Message Sent", {
                    description: data.sendEmail.message || "Your message has been delivered securely."
                });

                // Clear form
                setRecipient("");
                setSubject("");
                setBody("");

                // Navigate back
                setTimeout(() => navigate("/"), 1000);
            } else {
                toast.error("Process Failed", {
                    description: data.sendEmail.message || "The security gateway rejected the message."
                });
            }
        },
        onError: (error) => {
            console.error("Mutation error:", error);

            // Explicit Auth Error Handling
            let isAuthError = false;
            if (CombinedGraphQLErrors.is(error)) {
                isAuthError = error.errors.some(err =>
                    err.message.includes("401") ||
                    err.message.includes("Unauthorized") ||
                    err.extensions?.code === "UNAUTHENTICATED"
                );
            } else {
                isAuthError = error.message.includes("401") || error.message.includes("Unauthorized");
            }

            if (isAuthError) {
                toast.error("Authentication Failed", {
                    description: "Please log in again to send emails."
                });
                navigate("/login");
                return;
            }

            toast.error("Gateway Error", {
                description: error.message || "Failed to connect to the secure gateway."
            });
        }
    });

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

    const handleClear = () => {
        setRecipient("");
        setSubject("");
        setBody("");
        toast.info("Form cleared");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!recipient.includes("@")) {
            toast.error("Invalid recipient", { description: "Please enter a valid email address." });
            return;
        }

        // Execute mutation
        sendEmail({
            variables: { recipient, subject, body }
        });
    };

    const glassCardClass = "bg-background/60 backdrop-blur-xl border-accent/20 shadow-2xl";

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
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleClear} className="bg-background/20 backdrop-blur-sm">
                            <Eraser className="h-4 w-4 mr-2" />
                            Clear Draft
                        </Button>
                    </div>
                </div>

                <Card className={`compose-card opacity-0 ${glassCardClass} overflow-hidden`}>
                    <CardHeader className="border-b border-border/40 bg-accent/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Send className="h-5 w-5 text-primary" />
                                    New Message
                                </CardTitle>
                                <CardDescription>
                                    All outgoing messages are scanned by AI before delivery
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-0">
                            <div className="flex flex-col">
                                <div className="flex items-center px-6 py-3 border-b border-border/40 gap-3 group focus-within:bg-accent/5 transition-colors">
                                    <Label htmlFor="recipient" className="text-muted-foreground w-12 shrink-0">To</Label>
                                    <Input
                                        id="recipient"
                                        type="email"
                                        placeholder="recipient@example.com"
                                        className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto py-1"
                                        required
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        disabled={isSending}
                                    />
                                </div>
                                <div className="flex items-center px-6 py-3 border-b border-border/40 gap-3 group focus-within:bg-accent/5 transition-colors">
                                    <Label htmlFor="subject" className="text-muted-foreground w-12 shrink-0">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Security Analysis Result"
                                        className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto py-1"
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
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
                                        onChange={(e) => setBody(e.target.value)}
                                        disabled={isSending}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-accent/5">
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    className="gap-2 px-6 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                                    disabled={isSending}
                                >
                                    {isSending ? "Sending..." : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Send Securely
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </Layout>
    );
}
