'use server';

/**
 * @fileOverview This file contains the Genkit flow for generating audio from text.
 *
 * - generateAudio - A function that takes text and returns audio data.
 */

import { ai } from '@/ai/genkit';
import { GenerateAudioInput, GenerateAudioInputSchema, GenerateAudioOutput, GenerateAudioOutputSchema } from '@/ai/schemas';
import wav from 'wav';

export async function generateAudio(input: GenerateAudioInput): Promise<GenerateAudioOutput> {
    return generateAudioFlow(input);
}

const generateAudioFlow = ai.defineFlow(
    {
        name: 'generateAudioFlow',
        inputSchema: GenerateAudioInputSchema,
        outputSchema: GenerateAudioOutputSchema,
    },
    async ({ text }) => {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.5-flash-preview-tts',
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Algenib' },
                    },
                },
            },
            prompt: text,
        });

        if (!media) {
            throw new Error('No media was returned from the TTS model.');
        }

        const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
        );

        const wavData = await toWav(audioBuffer);

        return {
            media: 'data:audio/wav;base64,' + wavData,
        };
    }
);

async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
): Promise<string> {
    return new Promise((resolve, reject) => {
        const writer = new wav.Writer({
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        });

        const bufs: any[] = [];
        writer.on('error', reject);
        writer.on('data', (d) => {
            bufs.push(d);
        });
        writer.on('end', () => {
            resolve(Buffer.concat(bufs).toString('base64'));
        });

        writer.write(pcmData);
        writer.end();
    });
}
