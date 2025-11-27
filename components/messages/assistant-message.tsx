"use client";

import { UIMessage, ToolCallPart, ToolResultPart } from "ai";
import { Response } from "@/components/ai-elements/response";
import { ReasoningPart } from "./reasoning-part";
import { ToolCall, ToolResult } from "./tool-call";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Share2, Send } from "lucide-react";

export function AssistantMessage({ message, status, isLastMessage, durations, onDurationChange }: { message: UIMessage; status?: string; isLastMessage?: boolean; durations?: Record<string, number>; onDurationChange?: (key: string, duration: number) => void }) {
    
    // 1. Content Extraction
    const textParts = message.parts.filter(p => p.type === 'text');
    const textContent = textParts.map(p => (p as any).text).join(' ');
    const lowerContent = textContent.toLowerCase();
    
    // Check if there is ANY text content first
    const hasContent = textContent.length > 10;

    // 2. Trek Plan Detection
    const isTrekPlan = hasContent && (
        lowerContent.includes("|") || 
        lowerContent.includes("trek") || 
        lowerContent.includes("hike") || 
        lowerContent.includes("plan") ||
        lowerContent.includes("route") ||
        lowerContent.includes("day") ||
        lowerContent.includes("start") ||
        lowerContent.includes("reach")
    );

    // 3. Email Address Detection
    // Regex to find the first email address in the response
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const foundEmailMatch = textContent.match(emailRegex);
    const targetEmail = foundEmailMatch ? foundEmailMatch[0] : null;

    // 4. Visual Theme: Topographic Map Pattern
    const containerClasses = isTrekPlan 
        ? "bg-emerald-50/80 border-2 border-emerald-200/50 dark:bg-emerald-950/30 dark:border-emerald-800 rounded-xl p-5 shadow-sm relative overflow-hidden w-full transition-all duration-500 ease-in-out" 
        : "w-full";

    const topographicPattern = isTrekPlan ? {
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18C20 18 20 18 20 18l.5-.5l.5.5v2.5l-.5.5l-.5-.5zM20 18c0-2 2-2 2-4s-2-3-2-5s2-2 2-4V2h-1v2.5c0 1.5-1.5 2-1.5 3.5s1.5 2 1.5 4s-1.5 2-1.5 3.5s1.5 2.5 1.5 2.5zM20 40v-2.5c0-1.5 1.5-2 1.5-3.5s-1.5-2-1.5-4s1.5-2 1.5-3.5s-1.5-2.5-1.5-2.5V22h1v2c0 2-2 2-2 4s2 3 2 5s-2 2-2 4v3h-1z' fill='%23059669' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    } : {};

    // 5. Share Handlers
    const handleWhatsAppShare = () => {
        const text = `Hey! 🏔️ I found this amazing trek idea on TrekMate:\n\n${textContent.substring(0, 300)}...\n\nWant to join me?`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleEmailShare = () => {
        // If a specific email was found in the text, use it as the recipient ('to').
        // Otherwise, leave 'to' blank for the user to fill.
        const recipient = targetEmail ? targetEmail : ""; 
        const subject = targetEmail 
            ? "Regarding your Trek Inquiry via TrekMate" // Subject if sending TO a specific contact found
            : "Invitation: Let's go for a Trek! 🥾"; // Subject if sending invite to friend
            
        const body = targetEmail
            ? `Hello,\n\nI am contacting you regarding the following trek information:\n\n${textContent}`
            : `Hey,\n\nI'm planning a trek and found this on TrekMate:\n\n${textContent}\n\nAre you free to join me?`;

        window.open(`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    };

    return (
        <div className={containerClasses} style={topographicPattern}>
            {/* Badge for Trek Plans */}
            {isTrekPlan && (
                <div className="absolute top-0 right-0 m-0 px-3 py-1 bg-emerald-100/80 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl border-l border-b border-emerald-200 dark:border-emerald-800 opacity-90 pointer-events-none z-20">
                    Trek Plan
                </div>
            )}

            <div className="text-sm flex flex-col gap-4 relative z-10">
                {message.parts.map((part, i) => {
                    const isStreaming = status === "streaming" && isLastMessage && i === message.parts.length - 1;
                    const durationKey = `${message.id}-${i}`;
                    const duration = durations?.[durationKey];

                    if (part.type === "text") {
                        return <Response key={`${message.id}-${i}`}>{part.text}</Response>;
                    } else if (part.type === "reasoning") {
                        return (
                            <ReasoningPart
                                key={`${message.id}-${i}`}
                                part={part}
                                isStreaming={isStreaming}
                                duration={duration}
                                onDurationChange={onDurationChange ? (d) => onDurationChange(durationKey, d) : undefined}
                            />
                        );
                    } else if (
                        part.type.startsWith("tool-") || part.type === "dynamic-tool"
                    ) {
                        if ('state' in part && part.state === "output-available") {
                            return (
                                <ToolResult
                                    key={`${message.id}-${i}`}
                                    part={part as unknown as ToolResultPart}
                                />
                            );
                        } else {
                            return (
                                <ToolCall
                                    key={`${message.id}-${i}`}
                                    part={part as unknown as ToolCallPart}
                                />
                            );
                        }
                    }
                    return null;
                })}

                {/* 6. ACTION BUTTONS */}
                {isTrekPlan && (
                    <div className="mt-6 pt-4 border-t border-emerald-600/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/40 dark:bg-black/20 p-4 rounded-lg backdrop-blur-sm">
                        <div className="flex flex-col">
                            {targetEmail ? (
                                <>
                                    <span className="text-sm font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                                        <Send className="w-4 h-4" /> Contact Found
                                    </span>
                                    <span className="text-xs text-emerald-800/70 dark:text-emerald-300/70 font-medium truncate max-w-[200px]">
                                        Send mail to: {targetEmail}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                                        <Share2 className="w-4 h-4" /> Invite Friends
                                    </span>
                                    <span className="text-xs text-emerald-800/70 dark:text-emerald-300/70 font-medium">
                                        Don't trek alone! Share this plan.
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 sm:flex-none border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700 cursor-pointer shadow-sm transition-all hover:scale-105"
                                onClick={handleWhatsAppShare}
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                WhatsApp
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className={`flex-1 sm:flex-none border-stone-300 bg-white hover:bg-stone-50 text-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800 dark:text-stone-300 dark:border-stone-700 cursor-pointer shadow-sm transition-all hover:scale-105 ${targetEmail ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' : ''}`}
                                onClick={handleEmailShare}
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                {targetEmail ? "Send Email" : "Gmail"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
