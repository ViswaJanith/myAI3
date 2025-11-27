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
            className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline decoration-emerald-300 underline-offset-2"
          />
        ),
        // 2. Custom Table Container -> The "Route Card" Look
        table: ({ node, ...props }) => (
          <div className="my-6 w-full overflow-hidden rounded-lg border-2 border-emerald-600/30 bg-white dark:bg-stone-900 shadow-sm">
             {/* Header Bar for the Table Card */}
             <div className="bg-emerald-600/10 border-b border-emerald-600/20 px-4 py-2 flex items-center gap-2">
                {/* Mountain Icon */}
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                   Itinerary Details
                </span>
             </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" {...props} />
            </div>
          </div>
        ),
        // 3. Table Header Styling
        thead: ({ node, ...props }) => (
          <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300 border-b border-stone-200 dark:border-stone-700" {...props} />
        ),
        // 4. Table Row Hover Effects
        tr: ({ node, ...props }) => (
          <tr className="border-b border-stone-100 dark:border-stone-800 last:border-0 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors" {...props} />
        ),
        // 5. Table Cell Styling
        th: ({ node, ...props }) => (
          <th className="px-4 py-3 font-semibold whitespace-nowrap" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-4 py-3 align-top text-stone-600 dark:text-stone-400" {...props} />
        ),
        ...props.components,
      }}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
