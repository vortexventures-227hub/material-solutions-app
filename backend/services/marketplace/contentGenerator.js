/**
 * Enhanced Content Generator
 * Single AI call generates content for ALL platforms
 * Uses Gemini 2.5 Flash
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class ContentGenerator {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Generate content for ALL platforms in a single call
   * @param {Object} inventory - The inventory item
   * @param {Object} options - Additional options
   * @returns {Object} Platform-specific content for all platforms
   */
  async generateAll(inventory, options = {}) {
    const prompt = this.buildPrompt(inventory, options);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Try to parse as JSON
      let content;
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || [null, text];
        content = JSON.parse(jsonMatch[1] || text);
      } catch (parseError) {
        console.error('Failed to parse AI response:', text.substring(0, 200));
        throw new Error('AI returned invalid JSON');
      }
      
      // Validate and fill in defaults
      return this.validateAndFillDefaults(content, inventory);
    } catch (error) {
      console.error('Content generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Build comprehensive prompt for single-call generation
   */
  buildPrompt(inventory, options = {}) {
    const {
      brandVoice = 'Professional, trustworthy, experienced forklift dealer since 1999',
      targetAudience = 'Warehouse managers, logistics coordinators, small business owners in NJ/PA area',
      includeSchema = true,
      includeFaq = true
    } = options;

    return `You are a professional copywriter for a New Jersey forklift dealership (Material Solutions). Brand voice: "${brandVoice}". Target audience: ${targetAudience}.

Generate listing content for this forklift:

INVENTORY DATA:
- Make: ${inventory.make}
- Model: ${inventory.model}
- Year: ${inventory.year || 'N/A'}
- Hours: ${inventory.hours || 'N/A'}
- Capacity: ${inventory.capacity_lbs ? `${inventory.capacity_lbs.toLocaleString()} lbs` : 'N/A'}
- Power: ${inventory.power_type || 'N/A'}
- Mast: ${inventory.mast_type || 'N/A'}
- Lift Height: ${inventory.lift_height_inches ? `${inventory.lift_height_inches}"` : 'N/A'}
- Condition: ${inventory.condition_notes || 'Good'}
- Price: ${inventory.listing_price ? `$${inventory.listing_price.toLocaleString()}` : 'Call for pricing'}

Generate content for these platforms in a SINGLE JSON response:

{
  "website": {
    "title": "SEO-optimized title (max 60 chars)",
    "metaDescription": "150-160 char meta description with call to action",
    "ogTitle": "Social share title (40-60 chars)",
    "ogDescription": "Social share description (under 100 chars)",
    "description": "Full HTML description for website (2-3 paragraphs, include specs)",
    "schema": { "@type": "Product", ... },
    "faq": [{ "question": "...", "answer": "..." }],
    "keywords": ["keyword1", "keyword2", ...],
    "alt_texts": { "image1": "alt text", ... }
  },
  "facebook": {
    "headline": "Catchy headline (under 40 chars)",
    "body": "Facebook post body (2-3 sentences, includes specs and CTA)",
    "cta": "Shop Now"
  },
  "craigslist": {
    "title": "CL title format: YEAR MAKE MODEL - CONDITION (LOCATION)",
    "description": "CL body (be specific, include price, no HTML)"
  },
  "ebay": {
    "title": "eBay title (max 80 chars, include keywords)",
    "description": "eBay HTML description template"
  },
  "linkedin": {
    "headline": "Professional headline (under 70 chars)",
    "body": "Professional post body (1-2 paragraphs)"
  }
}

Rules:
- Use actual inventory data, don't hallucinate
- Facebook/CL/eBay/LinkedIn are SHORT versions
- Website is FULL version with HTML allowed
- Schema should be valid JSON-LD Product schema
- FAQ should be 4-6 common questions
- All text should be brand-consistent
- Response must be valid JSON only, no markdown outside code blocks`;
  }

  /**
   * Validate and fill defaults for missing content
   */
  validateAndFillDefaults(content, inventory) {
    const defaults = {
      website: this.defaultWebsiteContent(inventory),
      facebook: this.defaultFacebookContent(inventory),
      craigslist: this.defaultCraigslistContent(inventory),
      ebay: this.defaultEbayContent(inventory),
      linkedin: this.defaultLinkedinContent(inventory)
    };

    return {
      website: { ...defaults.website, ...content.website },
      facebook: { ...defaults.facebook, ...content.facebook },
      craigslist: { ...defaults.craigslist, ...content.craigslist },
      ebay: { ...defaults.ebay, ...content.ebay },
      linkedin: { ...defaults.linkedin, ...content.linkedin }
    };
  }

  defaultWebsiteContent(inventory) {
    return {
      title: `${inventory.year || ''} ${inventory.make} ${inventory.model} | Material Solutions`,
      metaDescription: `Buy or lease this ${inventory.year || ''} ${inventory.make} ${inventory.model} with ${inventory.hours || 'low'} hours. ${inventory.capacity_lbs ? `${inventory.capacity_lbs.toLocaleString()} lb capacity`. Contact us for pricing!`,
      ogTitle: `${inventory.make} ${inventory.model} for Sale`,
      ogDescription: `${inventory.year} ${inventory.make} ${inventory.model}. ${inventory.hours} hours. ${inventory.capacity_lbs ? `${inventory.capacity_lbs.toLocaleString()} lb capacity`.} Call Material Solutions today!`,
      description: `<h2>${inventory.make} ${inventory.model}</h2><p>Year: ${inventory.year || 'Call for details'}<br>Hours: ${inventory.hours || 'Call for details'}<br>Capacity: ${inventory.capacity_lbs ? `${inventory.capacity_lbs.toLocaleString()} lbs` : 'Call for pricing'}<br>Power: ${inventory.power_type || 'Call for details'}</p><p>${inventory.condition_notes || 'Call for condition details.'}</p><p>Contact Material Solutions at (800) 555-0199 for pricing and availability.</p>`,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${inventory.year} ${inventory.make} ${inventory.model}`,
        description: inventory.condition_notes || '',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: inventory.listing_price?.toString() || '0',
          availability: 'https://schema.org/InStock'
        }
      },
      faq: [],
      keywords: [inventory.make, inventory.model, 'forklift', 'warehouse', 'nj'],
      alt_texts: {}
    };
  }

  defaultFacebookContent(inventory) {
    return {
      headline: `${inventory.make} ${inventory.model} - ${inventory.listing_price ? `$${inventory.listing_price.toLocaleString()}` : 'Call for pricing'}`,
      body: `Just arrived! ${inventory.year || ''} ${inventory.make} ${inventory.model} with ${inventory.hours || '?'} hours. ${inventory.capacity_lbs ? `${inventory.capacity_lbs.toLocaleString()} lb capacity`.} Perfect for your warehouse. DM or call (800) 555-0199! #forklift #warehouse #materialhandling`,
      cta: 'Message Seller'
    };
  }

  defaultCraigslistContent(inventory) {
    return {
      title: `${inventory.year} ${inventory.make} ${inventory.model} - ${inventory.hours || '?'} Hours ${inventory.capacity_lbs ? `(${inventory.capacity_lbs.toLocaleString()} lb)` : ''} - NJ`,
      description: `${inventory.year} ${inventory.make} ${inventory.model}\n${inventory.hours || '?'} hours\n${inventory.capacity_lbs ? `Capacity: ${inventory.capacity_lbs.toLocaleString()} lbs\n` : ''}Price: ${inventory.listing_price ? `$${inventory.listing_price.toLocaleString()}` : 'Call for pricing'}\n${inventory.condition_notes || ''}\nContact: (800) 555-0199`
    };
  }

  defaultEbayContent(inventory) {
    return {
      title: `${inventory.year} ${inventory.make} ${inventory.model} ${inventory.hours || ''} Hours Forklift ${inventory.capacity_lbs ? inventory.capacity_lbs.toLocaleString() + 'lb' : ''}`,
      description: `<h2>${inventory.make} ${inventory.model}</h2><p>Year: ${inventory.year || 'N/A'}<br>Hours: ${inventory.hours || 'N/A'}<br>Capacity: ${inventory.capacity_lbs ? `${inventory.capacity_lbs.toLocaleString()} lbs` : 'N/A'}<br>Price: ${inventory.listing_price ? `$${inventory.listing_price.toLocaleString()}` : 'See Price'}</p><p>${inventory.condition_notes || ''}</p><p>Contact: (800) 555-0199</p>`
    };
  }

  defaultLinkedinContent(inventory) {
    return {
      headline: `${inventory.make} ${inventory.model} Now Available | Material Solutions`,
      body: `We've just listed a ${inventory.year || ''} ${inventory.make} ${inventory.model} for sale. With ${inventory.hours || '?'} hours and a ${inventory.capacity_lbs ? `${inventory.capacity_lbs.toLocaleString()} lb` : ''} capacity, it's perfect for your warehouse needs.\n\nLocated in New Jersey. Contact us for details: (800) 555-0199`
    };
  }
}

module.exports = ContentGenerator;
