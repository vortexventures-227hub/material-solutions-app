/**
 * Meta Tag Generator
 * Title, description, OG tags for inventory listings
 */

const SEO_CONFIG = require('./seoConfig');

const MAX_TITLE = 60;
const MAX_DESCRIPTION = 160;

/**
 * Generate full meta tag set for an inventory unit
 */
function generateMeta(unit) {
  const base = `${unit.year || ''} ${unit.make || ''} ${unit.model || ''}`.trim();
  const price = unit.asking_price ? ` — $${parseFloat(unit.asking_price).toLocaleString()}` : '';
  const condition = unit.condition ? ` [${unit.condition}]` : '';

  const title = buildTitle(base + condition + price);
  const description = buildDescription(unit);
  const og = buildOgTags(unit, title);

  return {
    title,
    description,
    keywords: buildKeywords(unit),
    og: og,
    canonical: `${SEO_CONFIG.baseUrl}/inventory/${unit.id}`,
    robots: 'index, follow',
    schema: null, // caller should add JSON-LD from schemaGenerator
  };
}

/**
 * Build SEO title
 */
function buildTitle(base) {
  const prefix = 'Forklift for Sale: ';
  const full = `${prefix}${base} | Material Solutions`;

  if (full.length <= MAX_TITLE) return full;

  // Truncate with ellipsis
  const truncated = base.substring(0, MAX_TITLE - prefix.length - 5 - 18) + '...';
  return `${prefix}${truncated} | Material Solutions`;
}

/**
 * Build SEO meta description
 */
function buildDescription(unit) {
  const parts = [];

  if (unit.year && unit.make && unit.model) {
    parts.push(`${unit.year} ${unit.make} ${unit.model}`);
  }
  if (unit.condition) parts.push(`${unit.condition} condition`);
  if (unit.hours) parts.push(`${parseInt(unit.hours).toLocaleString()} hours`);
  if (unit.capacity_lbs) parts.push(`${parseInt(unit.capacity_lbs).toLocaleString()} lb lift capacity`);
  if (unit.mast_type) parts.push(`${unit.mast_type} mast`);
  if (unit.power_type) parts.push(`${unit.power_type} powered`);
  if (unit.asking_price) parts.push(`$${parseFloat(unit.asking_price).toLocaleString()}`);

  const joined = parts.slice(0, 6).join(', ');

  const suffix = ` — Material Solutions | Mid-Atlantic | +1 (800) 555-0199`;
  const available = `Available for sale. ${joined}`;

  if (available.length + suffix.length <= MAX_DESCRIPTION) {
    return available + suffix;
  }

  return joined.substring(0, MAX_DESCRIPTION - suffix.length - 3) + '...' + suffix;
}

/**
 * Build Open Graph tags
 */
function buildOgTags(unit, title) {
  const image = unit.photos?.[0] || SEO_CONFIG.defaultImage;
  const description = buildDescription(unit);
  const url = `${SEO_CONFIG.baseUrl}/inventory/${unit.id}`;

  return {
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogImageAlt: `${unit.year || ''} ${unit.make || ''} ${unit.model || ''} forklift for sale`,
    ogUrl: url,
    ogType: 'product',
    ogSiteName: 'Material Solutions',
    ogLocale: 'en_US',
    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    twitterSite: '@MaterialSolutions',
    // Product-specific
    productPriceAmount: unit.asking_price ? parseFloat(unit.asking_price).toFixed(2) : '0.00',
    productPriceCurrency: 'USD',
    productAvailability: unit.status === 'listed' || unit.status === 'reserved' ? 'instock' : 'oos',
    productCondition: mapCondition(unit.condition),
  };
}

/**
 * Build comma-separated keywords
 */
function buildKeywords(unit) {
  const kw = [
    'forklift for sale',
    unit.make?.toLowerCase(),
    unit.model?.toLowerCase(),
    unit.year ? `${unit.year} forklift` : null,
    unit.condition ? `${unit.condition} forklift` : null,
    unit.power_type ? `${unit.power_type} forklift` : null,
    'forklift sales',
    'warehouse equipment',
    'material handling',
    'industrial forklift',
  ].filter(Boolean);

  return [...new Set(kw)].join(', ');
}

function mapCondition(c) {
  const map = { new: 'new', excellent: 'new', 'like-new': 'refurbished', good: 'used', fair: 'used', poor: 'used' };
  return map[c?.toLowerCase()] || 'used';
}

/**
 * Generate a URL slug from unit data
 */
function generateSlug(unit) {
  const parts = [
    unit.year,
    unit.make?.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    unit.model?.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    unit.id?.substring(0, 8),
  ].filter(Boolean);
  return parts.join('-');
}

module.exports = { generateMeta, generateSlug };
