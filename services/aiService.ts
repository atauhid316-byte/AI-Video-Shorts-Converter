import { GoogleGenAI, Type } from '@google/genai';
import type { ShortClip } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      startTime: {
        type: Type.NUMBER,
        description: 'The start time of the clip in seconds.',
      },
      endTime: {
        type: Type.NUMBER,
        description: 'The end time of the clip in seconds.',
      },
      title: {
        type: Type.STRING,
        description: 'A catchy, viral-style title for the short clip (max 10 words).',
      },
      description: {
        type: Type.STRING,
        description: 'A brief, engaging description of the clip (max 20 words).',
      },
      captions: {
        type: Type.OBJECT,
        properties: {
          en: {
            type: Type.STRING,
            description: 'A viral caption for social media in English, including relevant hashtags.'
          },
          hi: {
            type: Type.STRING,
            description: 'A viral caption for social media in Hindi, including relevant hashtags.'
          }
        },
        required: ['en', 'hi']
      },
    },
    required: ['startTime', 'endTime', 'title', 'description', 'captions'],
  },
};

export const generateShortsFromVideo = async (duration: number): Promise<ShortClip[]> => {
  const prompt = `Analyze a video with a total duration of ${Math.round(duration)} seconds. Identify 3-5 distinct, high-impact moments suitable for viral short-form videos. For each clip, provide: a precise start and end time in seconds (each clip must be between 15 to 60 seconds long), a catchy title, a short description, and viral captions in both English and Hindi with hashtags. Ensure clips do not exceed the video duration. Output as a valid JSON array.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    },
  });
  
  try {
    const jsonStr = response.text.trim();
    if (!jsonStr) {
      throw new Error("The AI returned an empty response.");
    }
    const clipsFromAI = JSON.parse(jsonStr);

    if (!Array.isArray(clipsFromAI)) {
       throw new Error("AI response is not in the expected format (array).");
    }

    // Validate and format the clips received from the AI
    return clipsFromAI.map((clip: any, index: number) => ({
      id: `clip-${index}-${Date.now()}`,
      startTime: Number(clip.startTime),
      endTime: Number(clip.endTime),
      title: String(clip.title || 'Untitled Clip'),
      description: String(clip.description || 'No description provided.'),
      captions: {
        en: String(clip.captions?.en || 'No English caption generated.'),
        hi: String(clip.captions?.hi || 'कोई हिंदी कैप्शन नहीं बनाया गया।'),
      }
    })).filter(clip => 
      !isNaN(clip.startTime) &&
      !isNaN(clip.endTime) &&
      clip.endTime <= duration && 
      clip.startTime < clip.endTime && 
      (clip.endTime - clip.startTime) >= 5 // ensure a reasonable minimum duration
    );
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("The AI returned an invalid response. Please try analyzing the video again.");
  }
};