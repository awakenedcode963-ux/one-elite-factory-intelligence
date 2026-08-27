import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/analyze-qms', async (req, res) => {
  try {
    const { stats, recentDefects } = req.body;
    
    // We use gemini-3.1-pro-preview with high thinking for complex architectural insights
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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
