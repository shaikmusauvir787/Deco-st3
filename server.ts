import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePort(): number {
  const portFlagIdx = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portFlagIdx !== -1 && process.argv[portFlagIdx + 1]) {
    const parsed = Number(process.argv[portFlagIdx + 1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const eqArg = process.argv.find((arg) => arg.startsWith('--port='));
  if (eqArg) {
    const parsed = Number(eqArg.split('=')[1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  if (process.env.NODE_ENV === 'production' && process.env.PORT && process.env.PORT !== process.env.NGINX_PORT) {
    return Number(process.env.PORT) || 3000;
  }
  return Number(process.env.DEFAULT_APP_PORT) || 3000;
}

const PORT = resolvePort();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function stripXmlTags(xml: string): string {
  return xml
    .replace(/<a:p[^>]*>/g, '\n')
    .replace(/<w:p[^>]*>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
}

async function extractTextFromOfficeBuffer(buffer: Buffer, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  const zip = await JSZip.loadAsync(buffer);
  const chunks: string[] = [];

  if (lower.endsWith('.docx')) {
    const docXml = zip.file('word/document.xml');
    if (docXml) {
      chunks.push(stripXmlTags(await docXml.async('string')));
    }
  } else if (lower.endsWith('.pptx')) {
    const slideNames = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const na = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
        const nb = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);
        return na - nb;
      });
    for (const slide of slideNames.slice(0, 40)) {
      const xml = await zip.file(slide)!.async('string');
      const text = stripXmlTags(xml);
      if (text) chunks.push(`[${slide}]\n${text}`);
    }
  }

  return chunks.join('\n\n').slice(0, 24000);
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'deco-course-hub', geminiConfigured: Boolean(process.env.GEMINI_API_KEY) });
  });

  app.post('/api/analyze-drive', async (req, res) => {
    try {
      const { driveUrl, pastedText, fileName, fileBase64, mimeType } = req.body as {
        driveUrl?: string;
        pastedText?: string;
        fileName?: string;
        fileBase64?: string;
        mimeType?: string;
      };

      const ai = getGeminiClient();

      let extractedDocumentText = (pastedText ?? '').trim();
      let pdfInlinePart: { inlineData: { mimeType: string; data: string } } | null = null;

      if (fileBase64 && fileName) {
        const cleanBase64 = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
        const lower = fileName.toLowerCase();

        if (lower.endsWith('.docx') || lower.endsWith('.pptx')) {
          const buf = Buffer.from(cleanBase64, 'base64');
          const parsedOffice = await extractTextFromOfficeBuffer(buf, fileName);
          if (parsedOffice) {
            extractedDocumentText = `${extractedDocumentText}\n\n[Extracted from ${fileName}]\n${parsedOffice}`.trim();
          }
        } else if (lower.endsWith('.csv') || lower.endsWith('.txt') || lower.endsWith('.md')) {
          const decoded = Buffer.from(cleanBase64, 'base64').toString('utf8').slice(0, 24000);
          extractedDocumentText = `${extractedDocumentText}\n\n[Uploaded ${fileName}]\n${decoded}`.trim();
        } else if (lower.endsWith('.pdf') || mimeType === 'application/pdf') {
          pdfInlinePart = {
            inlineData: {
              mimeType: 'application/pdf',
              data: cleanBase64,
            },
          };
        }
      }

      const sourceDescription = [
        driveUrl ? `Google Drive Repository Link: ${driveUrl}` : '',
        fileName ? `Uploaded File Name: ${fileName}` : '',
        extractedDocumentText ? `Document Content:\n${extractedDocumentText.slice(0, 20000)}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      if (!sourceDescription && !pdfInlinePart) {
        res.status(400).json({ error: 'Provide a Google Drive link, syllabus text, or a file (.docx, .pptx, .pdf, .csv).' });
        return;
      }

      const promptText = `You are an academic curriculum parser for Lords Institute of Engineering and Technology (LIET Autonomous, LR24 Regulation), Course: U24EC304 Digital Electronics & Computer Organization.
Analyze the provided syllabus / lecture slides / assessment input and extract structured updates in JSON:
- summary: concise 2-sentence overview of what was parsed from the input.
- units: 1 to 5 syllabus units detected (or refined topics for the matching unit).
- lectures: 2 to 6 concrete lecture plan entries derived from the material.
- questions: 1 to 3 practice exam questions with step-by-step solutions, CO (CO1..CO5), and BTL (BTL1..BTL5).

Input context:
${sourceDescription}`;

      const contents = pdfInlinePart
        ? { parts: [pdfInlinePart, { text: promptText }] }
        : promptText;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction:
            'Extract accurate Digital Electronics and Computer Organization syllabus units, lecture schedules, and exam questions in strict JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              units: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    unitNumber: { type: Type.STRING },
                    title: { type: Type.STRING },
                    coMapping: { type: Type.ARRAY, items: { type: Type.STRING } },
                    btlRange: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    keyOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
              },
              lectures: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    unit: { type: Type.STRING },
                    co: { type: Type.STRING },
                    btl: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    resourceFile: { type: Type.STRING },
                  },
                },
              },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    unit: { type: Type.STRING },
                    co: { type: Type.STRING },
                    btl: { type: Type.STRING },
                    marks: { type: Type.INTEGER },
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctOptionIndex: { type: Type.INTEGER },
                    solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                    finalAnswer: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json({ ok: true, extractedTextLength: extractedDocumentText.length, data: parsed });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to analyze Drive or file content.';
      const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/generate-question', async (req, res) => {
    try {
      const { unit, co, btl, topicHint } = req.body as {
        unit?: string;
        co?: string;
        btl?: string;
        topicHint?: string;
      };

      const ai = getGeminiClient();

      const prompt = `Create 1 rigorous university exam question for LIET Autonomous (LR24 Regulation) course U24EC304: Digital Electronics & Computer Organization.
Target Unit: ${unit || 'Unit I'}
Course Outcome: ${co || 'CO1'}
Bloom's Taxonomy Level: ${btl || 'BTL3'}
${topicHint ? `Focus Topic: ${topicHint}` : ''}

Provide 4 distinct MCQ options (correctOptionIndex 0..3), clear numbered solutionSteps, and a concise finalAnswer.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are Dr. Abdul Mateen Ahmed setting rigorous Digital Electronics & Computer Organization exam problems for B.E. III Semester CSE-AIML.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              unit: { type: Type.STRING },
              co: { type: Type.STRING },
              btl: { type: Type.STRING },
              marks: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctOptionIndex: { type: Type.INTEGER },
              solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              finalAnswer: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ ok: true, question: parsed });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate question.';
      const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DECO Course Hub server listening on http://localhost:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
