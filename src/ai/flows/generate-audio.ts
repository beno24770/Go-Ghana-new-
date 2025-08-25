
'use server';

/**
 * @fileOverview This file contains the Genkit flow for generating audio from text.
 *
 * - generateAudio - A function that takes text and returns audio data.
 */

import { ai } from '@/ai/genkit';
import { GenerateAudioInput, GenerateAudioInputSchema, GenerateAudioOutput, GenerateAudioOutputSchema } from '@/ai/schemas';
import wav from 'wav';
import { z } from 'zod';

export async function generateAudio(input: GenerateAudioInput): Promise<GenerateAudioOutput> {
    return generateAudioFlow(input.text);
}

const generateAudioFlow = ai.defineFlow(
    {
        name: 'generateAudioFlow',
        inputSchema: z.string(),
        outputSchema: GenerateAudioOutputSchema,
    },
    async (query) => {
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
            prompt: query,
        });

        if (!media) {
            throw new Error('no media returned');
        }

        const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
        );

        return {
            media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
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

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
