import * as React from "react";
import { X, Mail, Clock, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmailLog } from "@/services/email.service";
import { animate } from "animejs";

interface EmailDetailModalProps {
    email: EmailLog | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EmailDetailModal({ email, isOpen, onClose }: EmailDetailModalProps) {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const overlayRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isOpen && modalRef.current && overlayRef.current) {
            animate(overlayRef.current, {
                opacity: [0, 1],
                duration: 300,
                easing: "easeOutQuad"
            });
            animate(modalRef.current, {
                scale: [0.95, 1],
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                easing: "easeOutExpo"
            });
        }
    }, [isOpen]);

    if (!isOpen || !email) return null;

    const isMalicious = email.scan?.result === "malicious";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* OVERLAY */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-background/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* MODAL CONTAINER */}
            <div
                ref={modalRef}
                className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-accent/20 bg-background/60 backdrop-blur-2xl shadow-2xl flex flex-col"
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-accent/10">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isMalicious ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                            {isMalicious ? (
                                <ShieldX className="h-5 w-5 text-red-500" />
                            ) : (
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{email.subject}</h2>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(email.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-accent/20">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
                    {/* SENDER/RECIPIENT INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">From</label>
                            <div className="mt-1 flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {email.sender[0]?.toUpperCase() || '?'}
                                </div>
                                <span className="text-sm font-medium">{email.sender}</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                            <div className="mt-1">
                                <Badge
                                    variant={isMalicious ? "destructive" : "success"}
                                    className="px-3 py-1 text-xs font-semibold"
                                >
                                    {email.scan?.result?.toUpperCase() || "UNKNOWN"}
                                </Badge>
                                {email.scan?.confidence !== undefined && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        Confidence: {Math.round(email.scan.confidence * 100)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* EMAIL BODY */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Mail className="h-4 w-4" />
                            Message Content
                        </div>
                        <div className="p-6 rounded-xl bg-accent/5 border border-accent/10 min-h-[200px] whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-light italic">
                            {email.body || "No content available for this message."}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-accent/10 flex justify-end">
                    <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-full">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
