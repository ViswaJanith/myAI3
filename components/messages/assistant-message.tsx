"use client";

import { UIMessage, ToolCallPart, ToolResultPart } from "ai";
import { Response } from "@/components/ai-elements/response";
import { ReasoningPart } from "./reasoning-part";
import { ToolCall, ToolResult } from "./tool-call";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Share2 } from "lucide-react";

export function AssistantMessage({ message, status, isLastMessage, durations, onDurationChange }: { message: UIMessage; status?: string; isLastMessage?: boolean; durations?: Record<string, number>; onDurationChange?: (key: string, duration: number) => void }) {
    
    // 1. RELAXED Detection Logic: 
    // Now checks for keywords like "trek", "hike", "itinerary", "route" in addition to tables.
    // This ensures the buttons appear even for simple text-based plans.
    const textContent = message.parts.filter(p => p.type === 'text').map(p => (p as any).text).join(' ').toLowerCase();
    
    const isTrekPlan = 
        textContent.includes("|") || // Table
        textContent.includes("trek") || 
        textContent.includes("hike") || 
        textContent.includes("itinerary") ||
        textContent.includes("route") ||
        textContent.includes("trail");

    // 2. Visual Theme: Topographic Map Pattern
    const containerClasses = isTrekPlan 
        ? "bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900 rounded-xl p-4 shadow-sm relative overflow-hidden w-full transition-all duration-500 ease-in-out" 
        : "w-full";

    const topographicPattern = isTrekPlan ? {
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18C20 18 20 18 20 18l.5-.5l.5.5v2.5l-.5.5l-.5-.5zM20 18c0-2 2-2 2-4s-2-3-2-5s2-2 2-4V2h-1v2.5c0 1.5-1.5 2-1.5 3.5s1.5 2 1.5 4s-1.5 2-1.5 3.5s1.5 2.5 1.5 2.5zM20 40v-2.5c0-1.5 1.5-2 1.5-3.5s-1.5-2-1.5-4s1.5-2 1.5-3.5s-1.5-2.5-1.5-2.5V22h1v2c0 2-2 2-2 4s2 3 2 5s-2 2-2 4v3h-1z' fill='%2310b981' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    } : {};

    // 3. Share Handlers
    const handleWhatsAppShare = () => {
        const text = `Hey! 🏔️ I found this amazing trek idea on TrekMate:\n\n${textContent.substring(0, 200)}...\n\nWant to join me?`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleEmailShare = () => {
        const subject = "Invitation: Let's go for a Trek! 🥾";
        const body = `Hey,\n\nI'm planning a trek and found this on TrekMate:\n\n${textContent}\n\nAre you free to join me?`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
    };

    return (
        <div className={containerClasses} style={topographicPattern}>
            {/* Badge for Trek Plans */}
            {isTrekPlan && (
                <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-200 dark:border-emerald-800 opacity-70 pointer-events-none z-20">
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

                {/* 4. BUTTONS: Showing if it's a trek plan OR just to test, you can remove the check */}
                {isTrekPlan && status !== 'streaming' && (
                    <div className="mt-4 pt-4 border-t border-emerald-600/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                                <Share2 className="w-3 h-3" /> Invite Friends
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                Found a good one? Send invites now!
                            </span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 sm:flex-none border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:hover:bg-emerald-900/50 cursor-pointer"
                                onClick={handleWhatsAppShare}
                            >
                                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                                WhatsApp
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 sm:flex-none border-stone-200 hover:bg-stone-50 hover:text-stone-700 dark:border-stone-800 dark:hover:bg-stone-800 cursor-pointer"
                                onClick={handleEmailShare}
                            >
                                <Mail className="w-4 h-4 mr-2 text-stone-600" />
                                Gmail
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
