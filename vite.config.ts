import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiApp = express();
apiApp.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

apiApp.post('/analyze-qms', async (req, res) => {
  try {
    const { stats, recentDefects } = req.body;
    
    // Using gemini-3.1-pro-preview with high thinking level
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `You are the Lead Quality & Industrial Systems Architect for POLO Egypt.
Review the following current factory stats and recent defects:
Stats: ${JSON.stringify(stats)}
Recent Critical Defects: ${JSON.stringify(recentDefects)}

Based on ISO 9001:2015 and plastic pipe manufacturing industry norms (PPR & UPVC), provide a concise, professional assessment of the current production quality status, and recommend exactly 2 actionable next steps for the QC team.`,
      config: {
        thinkingConfig: {
          thinkingBudget: 1024,
        }
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error('Error in analyze-qms:', error);
    res.status(500).json({ error: 'Failed to analyze QMS data' });
  }
});

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'express-api-plugin',
        configureServer(server) {
          server.middlewares.use('/api', apiApp);
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
