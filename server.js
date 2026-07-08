const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const EL_KEY = process.env.ELEVENLABS_KEY;
const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;

app.post('/tts/:voiceId', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${req.params.voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': EL_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify(req.body)
      }
    );
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }
    res.set('Content-Type', 'audio/mpeg');
    response.body.pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}); app.post('/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: req.body.system,
        messages: req.body.messages
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000);
