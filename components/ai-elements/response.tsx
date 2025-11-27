"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown, defaultRehypePlugins } from "streamdown";
import { rehypeSingleCharLink } from "@/lib/rehype-single-char-link";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      rehypePlugins={[
        defaultRehypePlugins.raw,
        defaultRehypePlugins.katex,
        rehypeSingleCharLink,
      ]}
      components={{
        // 1. Custom Link Styling (Emerald Green pop)
        a: ({ node, ...props }) => (
            <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline decoration-emerald-500 underline-offset-2 transition-colors"
          />
        ),
        // 2. Custom Table Container -> The "Route Card" Look
        // CHANGED: bg-white -> bg-stone-50 for a "Paper/Map" feel
        table: ({ node, ...props }) => (
          <div className="my-6 w-full overflow-hidden rounded-xl border-2 border-emerald-700/20 bg-stone-50 dark:bg-stone-900 shadow-md">
             {/* Header Bar for the Table Card */}
             <div className="bg-emerald-700/10 border-b border-emerald-700/10 px-4 py-3 flex items-center gap-2">
                {/* Mountain Icon */}
                <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                   Itinerary Details
                </span>
             </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" {...props} />
            </div>
          </div>
        ),
        // 3. Table Header Styling
        // CHANGED: bg-stone-50 -> bg-stone-100/80 for contrast against the card
        thead: ({ node, ...props }) => (
          <thead className="bg-stone-200/50 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-b border-stone-200 dark:border-stone-700" {...props} />
        ),
        // 4. Table Row Hover Effects
        // CHANGED: Darker text for readability on stone background
        tr: ({ node, ...props }) => (
          <tr className="border-b border-stone-200/60 dark:border-stone-800 last:border-0 hover:bg-emerald-100/40 dark:hover:bg-emerald-900/20 transition-colors" {...props} />
        ),
        // 5. Table Cell Styling
        th: ({ node, ...props }) => (
          <th className="px-4 py-3 font-bold whitespace-nowrap text-stone-700 dark:text-stone-300" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-4 py-3 align-top text-stone-600 dark:text-stone-400 font-medium" {...props} />
        ),
        ...props.components,
      }}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
