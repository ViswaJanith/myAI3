import { UIMessage, ToolCallPart, ToolResultPart } from "ai";
import { Response } from "@/components/ai-elements/response";
import { ReasoningPart } from "./reasoning-part";
import { ToolCall, ToolResult } from "./tool-call";
import { cn } from "@/lib/utils"; 

export function AssistantMessage({ message, status, isLastMessage, durations, onDurationChange }: { message: UIMessage; status?: string; isLastMessage?: boolean; durations?: Record<string, number>; onDurationChange?: (key: string, duration: number) => void }) {
    
    // 1. Detection Logic: Check if the message likely contains a Trek Plan (Markdown Table)
    const isTrekPlan = message.parts.some(part => 
        part.type === 'text' && 
        (part.text.includes("| Day") || part.text.includes("| Route") || part.text.includes("|---"))
    );

    // 2. Visual Theme: Topographic Map Pattern
    // If it's a trek plan, we change the container to have a border, background color, and specific padding.
    const containerClasses = isTrekPlan 
        ? "bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900 rounded-xl p-4 shadow-sm relative overflow-hidden w-full" 
        : "w-full";

    // This SVG pattern creates a subtle topographic line effect for the background
    const topographicPattern = isTrekPlan ? {
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18C20 18 20 18 20 18l.5-.5l.5.5v2.5l-.5.5l-.5-.5zM20 18c0-2 2-2 2-4s-2-3-2-5s2-2 2-4V2h-1v2.5c0 1.5-1.5 2-1.5 3.5s1.5 2 1.5 4s-1.5 2-1.5 3.5s1.5 2.5 1.5 2.5zM20 40v-2.5c0-1.5 1.5-2 1.5-3.5s-1.5-2-1.5-4s1.5-2 1.5-3.5s-1.5-2.5-1.5-2.5V22h1v2c0 2-2 2-2 4s2 3 2 5s-2 2-2 4v3h-1z' fill='%2310b981' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    } : {};

    return (
        <div className={containerClasses} style={topographicPattern}>
            {/* Badge for Trek Plans */}
            {isTrekPlan && (
                <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-200 dark:border-emerald-800 opacity-70 pointer-events-none">
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
            </div>
        </div>
    )
}
