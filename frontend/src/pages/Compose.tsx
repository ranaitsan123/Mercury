import * as React from "react";
import Layout from "@/components/layout/Layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
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
import { useMutation } from "@apollo/client/react";

import { SEND_EMAIL_MUTATION } from "@/graphql/mutations";

/* =========================
   TYPES (MATCH GRAPHQL)
========================= */
interface SendEmailResponse {
    sendEmail: {
        email: {
            id: string;
            sender: string;
            recipient: string;
            subject: string;
            body: string;
            folder: string;
            createdAt: string;
            scan: {
                result: string;
                confidence: number;
            };
        };
    };
}

interface SendEmailVariables {
    to: string;
    subject: string;
    body: string;
}

export default function ComposePage() {
    const navigate = useNavigate();

    const [recipient, setRecipient] = React.useState("");
    const [subject, setSubject] = React.useState("");
    const [body, setBody] = React.useState("");

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const graphismRef = React.useRef<Graphism | null>(null);

    const [sendEmail, { loading }] = useMutation<
        SendEmailResponse,
        SendEmailVariables
    >(SEND_EMAIL_MUTATION, {
        onCompleted: (data) => {
            const email = data.sendEmail.email;
            const scan = email.scan;

            toast.success("Message Sent", {
                description: `AI Scan: ${scan.result} (${Math.round(
                    scan.confidence * 100
                )}%)`,
            });

            setRecipient("");
            setSubject("");
            setBody("");

            setTimeout(() => navigate("/"), 800);
        },
        onError: (error) => {
            toast.error("Send failed", {
                description: error.message,
            });
        },
    });

    /* =========================
       EFFECTS
    ========================= */
    React.useEffect(() => {
        if (canvasRef.current && !graphismRef.current) {
            graphismRef.current = new Graphism({
                canvas: canvasRef.current,
                particleCount: 60,
                connectionDistance: 150,
                mouseDistance: 200,
                color: "99, 102, 241",
            });
        }
    }, []);

    React.useEffect(() => {
        animate(".compose-card", {
            translateY: [20, 0],
            opacity: [0, 1],
            easing: "easeOutExpo",
            duration: 800,
            delay: 100,
        });
    }, []);

    /* =========================
       HANDLERS
    ========================= */
    const handleClear = () => {
        setRecipient("");
        setSubject("");
        setBody("");
        toast.info("Draft cleared");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!recipient.includes("@")) {
            toast.error("Invalid recipient");
            return;
        }

        await sendEmail({
            variables: {
                to: recipient,
                subject,
                body,
            },
        });
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
                        className="gap-2"
                        onClick={() => navigate("/")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                    >
                        <Eraser className="h-4 w-4 mr-2" />
                        Clear Draft
                    </Button>
                </div>

                <Card className={`compose-card opacity-0 ${glassCardClass}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            New Message
                        </CardTitle>
                        <CardDescription>
                            Emails are AI-scanned before delivery
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-0">
                            <div className="flex flex-col">
                                <div className="flex items-center px-6 py-3 border-b gap-3">
                                    <Label className="w-12">To</Label>
                                    <Input
                                        type="email"
                                        required
                                        value={recipient}
                                        onChange={(e) =>
                                            setRecipient(e.target.value)
                                        }
                                        disabled={loading}
                                        className="border-none bg-transparent"
                                    />
                                </div>

                                <div className="flex items-center px-6 py-3 border-b gap-3">
                                    <Label className="w-12">Subject</Label>
                                    <Input
                                        required
                                        value={subject}
                                        onChange={(e) =>
                                            setSubject(e.target.value)
                                        }
                                        disabled={loading}
                                        className="border-none bg-transparent"
                                    />
                                </div>

                                <div className="p-6">
                                    <Textarea
                                        required
                                        value={body}
                                        onChange={(e) =>
                                            setBody(e.target.value)
                                        }
                                        disabled={loading}
                                        className="min-h-[400px] border-none bg-transparent resize-none"
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between border-t px-6 py-4">
                            <Button type="button" variant="ghost" size="icon">
                                <Paperclip className="h-5 w-5" />
                            </Button>

                            <Button type="submit" disabled={loading}>
                                {loading ? "Sending..." : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
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
