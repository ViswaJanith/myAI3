import { streamText, UIMessage, convertToModelMessages, stepCountIs, 
  createUIMessageStream, createUIMessageStreamResponse, tool, server } from 'ai';
import { z } from 'zod';
import { MODEL } from '@/config';
import { SYSTEM_PROMPT } from '@/prompts';
import { isContentFlagged } from '@/lib/moderation';
import { webSearch } from './tools/web-search';
import { vectorDatabaseSearch } from './tools/search-vector-database';

export const maxDuration = 30;

// ------------------------------------
// FIXED TOOL DEFINITION
// ------------------------------------
const show_photos = tool({
  description:
    'Display a photo carousel for a specific trek location or fort.',
  parameters: z.object({
    location: z.string().describe(
      'The name of the fort or trek location (e.g., "Rajgad", "Torna").'
    ),
  }),

  execute: server(async ({ location }) => {
    return {
      location,
      message: `PHOTO_TOOL_TRIGGERED: Displaying photos for ${location}`,
    };
  }),
});
