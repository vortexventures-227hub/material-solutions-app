const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /message - David AI chat (MVP: simple inventory lookup)
router.post('/message', async (req, res, next) => {
  const { message, leadId } = req.body;
  
  try {
    // Simple keyword matching for MVP
    const lowerMessage = message.toLowerCase();
    let response = '';
    
    // Check if asking about specific equipment
    if (lowerMessage.includes('reach truck') || lowerMessage.includes('raymond')) {
      const result = await db.query(
        `SELECT * FROM inventory 
         WHERE LOWER(model) LIKE '%reach%' OR LOWER(make) = 'raymond'
         AND status = 'listed'
         LIMIT 5`
      );
      
      if (result.rows.length > 0) {
        response = `I found ${result.rows.length} reach trucks available:\\n\\n`;
        result.rows.forEach(item => {
          response += `- ${item.year} ${item.make} ${item.model}, ${item.hours} hours, $${item.listing_price}\\n`;
        });
        response += `\\nWould you like more details on any of these?`;
      } else {
        response = `I don't currently have any reach trucks in stock, but we get new inventory regularly. Can I help you find something else?`;
      }
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      response = `Our reconditioned forklifts typically range from $12,000 to $80,000 depending on type and condition. Reach trucks are usually $15,000-$18,000. What type of equipment are you looking for?`;
    } else if (lowerMessage.includes('warranty')) {
      response = `All our forklifts come with a 90-day full warranty, 6 months on major components, and 1 year on battery & charger. We've been in business for 29 years serving NJ, Eastern PA, and NYC.`;
    } else {
      response = `Thanks for your message! I'm David, Material Solutions' AI assistant. We specialize in narrow aisle forklifts - reach trucks, order pickers, and swing reaches. How can I help you today?`;
    }
    
    // Log interaction if lead ID provided
    if (leadId) {
      await db.query(
        `UPDATE leads 
         SET interactions = interactions || $1::jsonb
         WHERE id = $2`,
        [JSON.stringify({ type: 'chat', date: new Date().toISOString(), notes: `User: ${message} | David: ${response}` }), leadId]
      );
    }
    
    res.json({ response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error in chat:', error);
    next(error);
  }
});

// GET /history/:leadId - Get chat history for lead
router.get('/history/:leadId', async (req, res, next) => {
  const { leadId } = req.params;
  
  try {
    const result = await db.query(
      `SELECT interactions FROM leads WHERE id = $1`,
      [leadId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    const chatHistory = (result.rows[0].interactions || [])
      .filter(i => i.type === 'chat');
    
    res.json({ history: chatHistory });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    next(error);
  }
});

module.exports = router;
