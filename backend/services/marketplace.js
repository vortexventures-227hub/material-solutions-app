const db = require('../db');

// ─── Gemini Content Generation ──────────────────────────────────────────────

async function generateListingContent(inventory) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Marketplace] No GEMINI_API_KEY — using fallback content');
    return generateFallbackContent(inventory);
  }

  const prompt = `You are an expert forklift equipment copywriter for Vortex Forklift / Material Solutions, a trusted dealer in New Jersey. Generate a marketplace listing for this forklift:

Make: ${inventory.make}
Model: ${inventory.model}
Year: ${inventory.year || 'Unknown'}
Hours: ${inventory.hours || 'Unknown'}
Capacity: ${inventory.capacity_lbs ? inventory.capacity_lbs + ' lbs' : 'Unknown'}
Mast Type: ${inventory.mast_type || 'Unknown'}
Lift Height: ${inventory.lift_height_inches ? inventory.lift_height_inches + ' inches' : 'Unknown'}
Power Type: ${inventory.power_type || 'Unknown'}
Battery Info: ${inventory.battery_info || 'N/A'}
Condition Score: ${inventory.condition_score || 'N/A'}/10
Condition Notes: ${inventory.condition_notes || 'N/A'}
Listing Price: ${inventory.listing_price ? '$' + Number(inventory.listing_price).toLocaleString() : 'Call for pricing'}

Return a JSON object with these fields:
{
  "title": "SEO-optimized title, 60-80 characters, include year make model and key selling point",
  "description": "300-500 word structured description with: key specs bullet points at top, detailed features, benefits/use cases, call to action with phone number (973) 500-1010",
  "meta_description": "155 character meta description for SEO",
  "tags": ["array", "of", "relevant", "search", "tags"],
  "faq": [{"q": "question", "a": "answer"}]
}

Return ONLY valid JSON, no markdown fences.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[Marketplace] Gemini API error:', response.status, errBody);
      return generateFallbackContent(inventory);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('[Marketplace] Empty Gemini response');
      return generateFallbackContent(inventory);
    }

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[Marketplace] Gemini content generation failed:', err.message);
    return generateFallbackContent(inventory);
  }
}

function generateFallbackContent(inv) {
  const title = `${inv.year || ''} ${inv.make} ${inv.model} ${inv.capacity_lbs ? inv.capacity_lbs + 'lb' : ''} Forklift`.trim();
  const price = inv.listing_price ? `$${Number(inv.listing_price).toLocaleString()}` : 'Call for pricing';

  return {
    title,
    description: `${title} — ${price}

Key Specs:
• Make: ${inv.make}
• Model: ${inv.model}
• Year: ${inv.year || 'N/A'}
• Hours: ${inv.hours?.toLocaleString() || 'N/A'}
• Capacity: ${inv.capacity_lbs ? inv.capacity_lbs + ' lbs' : 'N/A'}
• Power Type: ${inv.power_type || 'N/A'}
• Mast Type: ${inv.mast_type || 'N/A'}
• Lift Height: ${inv.lift_height_inches ? inv.lift_height_inches + '"' : 'N/A'}
• Condition: ${inv.condition_score || 'N/A'}/10

${inv.condition_notes ? inv.condition_notes + '\n' : ''}
This ${inv.make} ${inv.model} is available now from Vortex Forklift / Material Solutions in New Jersey. We offer competitive pricing, financing options, and nationwide shipping.

Contact us today at (973) 500-1010 or visit our website for more details.`,
    meta_description: `${title} for sale. ${price}. Contact Vortex Forklift NJ: (973) 500-1010.`,
    tags: [inv.make, inv.model, 'forklift', 'used forklift', inv.power_type, 'material handling'].filter(Boolean),
    faq: [
      { q: `What is the capacity of this ${inv.make} ${inv.model}?`, a: `This unit has a ${inv.capacity_lbs || 'N/A'} lb capacity.` },
      { q: 'Do you offer financing?', a: 'Yes, we offer flexible financing options. Contact us at (973) 500-1010 for details.' },
      { q: 'Do you offer shipping?', a: 'Yes, we offer nationwide shipping. Contact us for a quote.' },
    ],
  };
}

// ─── Facebook Marketplace Integration (Stub) ────────────────────────────────

async function publishToFacebook(inventory, content) {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!accessToken || !pageId) {
    console.log('[Marketplace] Facebook credentials not configured — returning stub');
    return {
      platform: 'facebook_marketplace',
      listing_id: `fb_stub_${Date.now()}`,
      url: `https://www.facebook.com/marketplace/item/stub_${inventory.id}`,
      status: 'pending',
      note: 'Facebook API credentials not configured. Listing saved locally.',
    };
  }

  // Real Facebook Graph API integration (when credentials are provided)
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${content.title}\n\n${content.description}`,
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Facebook API ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    return {
      platform: 'facebook_marketplace',
      listing_id: data.id,
      url: `https://www.facebook.com/${data.id}`,
      status: 'active',
    };
  } catch (err) {
    console.error('[Marketplace] Facebook publish failed:', err.message);
    return {
      platform: 'facebook_marketplace',
      listing_id: null,
      url: null,
      status: 'failed',
      error: err.message,
    };
  }
}

// ─── Website Listing (always succeeds) ──────────────────────────────────────

function publishToWebsite(inventory, content) {
  const baseUrl = process.env.FRONTEND_URL || 'https://materialsolutions.vercel.app';
  return {
    platform: 'website',
    listing_id: `web_${inventory.id}`,
    url: `${baseUrl}/inventory/${inventory.id}`,
    status: 'active',
  };
}

// ─── Main Publish Orchestrator ──────────────────────────────────────────────

async function publishToMarketplaces(inventoryId) {
  // Fetch inventory item
  const invResult = await db.query('SELECT * FROM inventory WHERE id = $1', [inventoryId]);
  if (invResult.rows.length === 0) {
    throw new Error('Inventory item not found');
  }
  const inventory = invResult.rows[0];

  // Check for existing active listings
  const existingResult = await db.query(
    "SELECT * FROM marketplace_listings WHERE inventory_id = $1 AND status IN ('active', 'pending')",
    [inventoryId]
  );
  if (existingResult.rows.length > 0) {
    throw new Error('Item already has active marketplace listings');
  }

  // Generate SEO content via Gemini
  const content = await generateListingContent(inventory);

  // Publish to each platform
  const platforms = [
    publishToFacebook(inventory, content),
    Promise.resolve(publishToWebsite(inventory, content)),
  ];

  const results = await Promise.allSettled(platforms);
  const listings = [];

  for (const result of results) {
    const platformResult = result.status === 'fulfilled' ? result.value : {
      platform: 'unknown',
      status: 'failed',
      error: result.reason?.message,
    };

    // Store in database
    const insertResult = await db.query(
      `INSERT INTO marketplace_listings
        (inventory_id, platform, listing_id, url, status, title, description, seo_content, error)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        inventoryId,
        platformResult.platform,
        platformResult.listing_id,
        platformResult.url,
        platformResult.status,
        content.title,
        content.description,
        JSON.stringify(content),
        platformResult.error || null,
      ]
    );

    listings.push(insertResult.rows[0]);
  }

  // Update inventory status to 'listed' if still in intake
  if (inventory.status === 'intake') {
    await db.query("UPDATE inventory SET status = 'listed' WHERE id = $1", [inventoryId]);
  }

  return { listings, content };
}

// ─── Get Listings for Inventory Item ────────────────────────────────────────

async function getListingsForInventory(inventoryId) {
  const result = await db.query(
    'SELECT * FROM marketplace_listings WHERE inventory_id = $1 ORDER BY published_at DESC',
    [inventoryId]
  );
  return result.rows;
}

module.exports = {
  publishToMarketplaces,
  getListingsForInventory,
  generateListingContent,
};
