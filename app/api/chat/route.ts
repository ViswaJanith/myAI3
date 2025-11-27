import { streamText, UIMessage, convertToModelMessages, stepCountIs, createUIMessageStream, createUIMessageStreamResponse, tool } from 'ai';
import { z } from 'zod'; // Added z import
import { MODEL } from '@/config';
import { SYSTEM_PROMPT } from '@/prompts';
import { isContentFlagged } from '@/lib/moderation';
import { webSearch } from './tools/web-search';
import { vectorDatabaseSearch } from './tools/search-vector-database';

export const maxDuration = 30;

// ------------------------------------
// NEW TOOL DEFINITION: show_photos
// ------------------------------------
const show_photos = tool({
  description: 'Display a photo carousel for a specific trek location or fort. Use this whenever the user asks to see photos, visuals, or images of a trek, mountain, or fort.',
  parameters: z.object({
    location: z.string().describe('The name of the fort or trek location to show photos for (e.g., "Rajgad", "Torna").'),
  }),
  execute: async ({ location }) => {
    // The UI (AssistantMessage) handles the actual image rendering based on the location name.
    return { location, message: `PHOTO_TOOL_TRIGGERED: Displaying photos for ${location}` };
  },
});
// ------------------------------------

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const latestUserMessage = messages
        .filter(msg => msg.role === 'user')
        .pop();

    if (latestUserMessage) {
        const textParts = latestUserMessage.parts
            .filter(part => part.type === 'text')
            .map(part => 'text' in part ? part.text : '')
            .join('');

        if (textParts) {
            const moderationResult = await isContentFlagged(textParts);

            if (moderationResult.flagged) {
                const stream = createUIMessageStream({
                    execute({ writer }) {
                        const textId = 'moderation-denial-text';

                        writer.write({
                            type: 'start',
                        });

                        writer.write({
                            type: 'text-start',
                            id: textId,
                        });

                        writer.write({
                            type: 'text-delta',
                            id: textId,
                            delta: moderationResult.denialMessage || "Your message violates our guidelines. I can't answer that.",
                        });

                        writer.write({
                            type: 'text-end',
                            id: textId,
                        });

                        writer.write({
                            type: 'finish',
                        });
                    },
                });

                return createUIMessageStreamResponse({ stream });
            }
        }
    }

    const result = streamText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        messages: convertToModelMessages(messages),
        tools: {
            webSearch,
            vectorDatabaseSearch,
            show_photos, // <--- NEW TOOL ADDED HERE
        },
        // INCREASED STEP COUNT to give the model more time to resolve tool decisions.
        stopWhen: stepCountIs(15), 
        providerOptions: {
            openai: {
                reasoningSummary: 'auto',
                reasoningEffort: 'low',
                parallelToolCalls: false,
            }
        }
    });

    return result.toUIMessageStreamResponse({
        sendReasoning: true,
    });
}
