import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Shared Gemini client utility
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health & configuration check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash-tts',
    persona: 'VOICE_ABU_MOHAMMED_01',
    whatsapp: '0552910447',
    targetDuration: 120,
    scenesCount: 8,
  });
});

// Single Scene or Text TTS generation endpoint using gemini-3.8-flash-tts
app.post('/api/tts/generate', async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceName = 'Charon', // Charon or Fenrir (Warm baritone, 35-45 male)
      style = 'Warm baritone, confident, professional, calm, empathetic, light Gulf Arabic commercial voiceover, natural conversational pace with clear pauses',
      sceneNumber,
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the server environment.',
        needsKey: true,
      });
    }

    // Call Gemini 3.8 Flash TTS model
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                speaker: 'Abu Mohammed',
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || 'Charon',
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find((p) => p.inlineData?.data);

    if (!audioPart || !audioPart.inlineData?.data) {
      console.error('Gemini TTS response missing audio part:', JSON.stringify(response));
      return res.status(502).json({
        error: 'The TTS model did not return audio data for this phrase.',
        details: candidate?.finishReason || 'No audio part',
      });
    }

    const base64Audio = audioPart.inlineData.data;
    const mimeType = audioPart.inlineData.mimeType || 'audio/wav';

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType,
      voiceName,
      sceneNumber,
    });
  } catch (error: any) {
    console.error('Error generating speech with gemini-3.8-flash-tts:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate voiceover with Gemini TTS',
    });
  }
});

// Batch generation for all scenes
app.post('/api/tts/generate-all', async (req: Request, res: Response) => {
  try {
    const { scenes, voiceName = 'Charon' } = req.body;

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({ error: 'Scenes array is required' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the server environment.',
        needsKey: true,
      });
    }

    const results = [];

    // Generate sequentially to respect rate limits while maintaining quality
    for (const scene of scenes) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: scene.spokenText.trim(),
                  speechMetadata: {
                    speaker: 'Abu Mohammed',
                    style:
                      scene.style ||
                      'Warm baritone, confident, professional, calm, empathetic, light Gulf Arabic commercial voiceover, natural conversational pace',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName || 'Charon',
                },
              },
            },
          },
        });

        const candidate = response.candidates?.[0];
        const audioPart = candidate?.content?.parts?.find((p) => p.inlineData?.data);

        if (audioPart?.inlineData?.data) {
          results.push({
            id: scene.id,
            sceneNumber: scene.sceneNumber,
            success: true,
            audioBase64: audioPart.inlineData.data,
            mimeType: audioPart.inlineData.mimeType || 'audio/wav',
          });
        } else {
          results.push({
            id: scene.id,
            sceneNumber: scene.sceneNumber,
            success: false,
            error: 'No audio returned for scene',
          });
        }
      } catch (err: any) {
        console.error(`Error generating scene ${scene.sceneNumber}:`, err);
        results.push({
          id: scene.id,
          sceneNumber: scene.sceneNumber,
          success: false,
          error: err.message,
        });
      }
    }

    return res.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Error in batch generation:', error);
    return res.status(500).json({
      error: error.message || 'Batch generation failed',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🎙️ Abu Mohammed Voiceover Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
