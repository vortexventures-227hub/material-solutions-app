const express = require('express');
const router = express.Router();
const db = require('../db');

// Intent classification helper
function classifyIntent(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.match(/price|cost|how much|pricing|expensive|cheap/)) {
    return 'price';
  }
  if (lowerMsg.match(/warranty|guarantee|cover/)) {
    return 'warranty';
  }
  if (lowerMsg.match(/reach truck|order picker|swing reach|forklift|raymond|toyota|crown|have|available|stock|inventory/)) {
    return 'inventory';
  }
  return 'general';
}

// POST /message - David AI chat (upgraded)
router.post('/message', async (req, res, next) => {
  const { message, leadId } = req.body;
  
  if (!message) {
    return res.json({ response: "I didn't catch that. Could you repeat?", timestamp: new Date().toISOString() });
  }

  try {
    const intent = classifyIntent(message);
    let response = '';

    switch (intent) {
      case 'price':
        response = "Great question! Here are our typical price ranges:\n\n" +
                  "• Reach trucks: $15,000 - $18,000\n" +
                  "• Order pickers: $14,000 - $16,000\n" +
                  "• Swing reaches: $45,000 - $80,000\n\n" +
                  "All our equipment is reconditioned and comes with warranty. Want to see what's in stock?";
        break;

      case 'warranty':
        response = "All our forklifts come with industry-leading warranty coverage:\n\n" +
                  "• 90 days full unit warranty\n" +
                  "• 6 months on major components\n" +
                  "• 1 year on battery & charger\n\n" +
                  "We've been in business for 29 years and stand behind our equipment. What else can I help with?";
        break;

      case 'inventory':
        // Search inventory based on message keywords
        const searchTerms = message.toLowerCase();
        
        const result = await db.query(
          `SELECT * FROM inventory 
           WHERE status = 'listed' 
           AND (
             LOWER(make) LIKE $1 OR 
             LOWER(model) LIKE $1 OR
             LOWER(mast_type) LIKE $1 OR
             LOWER(power_type) LIKE $1
           )
           LIMIT 5`,
          [`%${searchTerms.includes('reach') ? 'reach' : 
              searchTerms.includes('picker') ? 'picker' : 
              searchTerms.includes('raymond') ? 'raymond' :
              searchTerms.includes('toyota') ? 'toyota' : ''}%`]
        );

        if (result.rows.length > 0) {
          response = `I found ${result.rows.length} units that might interest you:\n\n`;
          result.rows.forEach((item, idx) => {
            response += `${idx + 1}. ${item.year} ${item.make} ${item.model}\n`;
            response += `   ${item.hours} hours | ${item.capacity_lbs} lbs | $${item.listing_price?.toLocaleString() || 'Call'}\n\n`;
          });
          response += "Would you like more details on any of these?";
        } else {
          response = "I don't have that specific type in stock right now, but we get new inventory regularly. " +
                    "Can I help you find something similar, or would you like me to notify you when one comes in?";
        }
        break;

      case 'general':
      default:
        response = "Hi! I'm David, your Material Solutions assistant. We specialize in narrow aisle forklifts — " +
                  "reach trucks, order pickers, and swing reaches. We've been serving NJ, Eastern PA, and NYC for 29 years.\n\n" +
                  "How can I help you today? I can tell you about our inventory, pricing, or warranty coverage.";
        break;
    }

    // Log interaction if lead ID provided
    if (leadId) {
      await db.query(
        `UPDATE leads 
         SET interactions = interactions || $1::jsonb
         WHERE id = $2`,
        [JSON.stringify({
          type: 'chat',
          date: new Date().toISOString(),
          notes: `User: ${message} | David: ${response.substring(0, 200)}...`
        }), leadId]
      );
    }

    res.json({ response, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: "I'm having a moment — can you try asking that again?",
      timestamp: new Date().toISOString()
    });
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
