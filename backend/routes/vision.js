const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST /analyze - Analyze forklift photo with Vision AI
router.post('/analyze', async (req, res, next) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image data required' });
  }

  try {
    // Call OpenAI GPT-4V API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this forklift photo. Identify: make (e.g. Raymond, Toyota, Crown), model number, approximate year, and overall condition score (1-10). Return your response as valid JSON with keys: make, model, year, condition_score, condition_notes.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    
    // Try to parse JSON from AI response
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      // If JSON parsing fails, return raw response
      return res.json({
        raw_response: aiResponse,
        error: 'Could not parse structured data from AI response'
      });
    }

    res.json({
      make: parsed.make || '',
      model: parsed.model || '',
      year: parsed.year || null,
      condition_score: parsed.condition_score || null,
      condition_notes: parsed.condition_notes || ''
    });

  } catch (error) {
    console.error('Vision API error:', error.response?.data || error.message);
    next(error);
  }
});

module.exports = router;
