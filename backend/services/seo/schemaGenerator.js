/**
 * JSON-LD Schema Generator for Inventory
 * Outputs Product schema for rich snippets in Google
 */

const SEO_CONFIG = require('./seoConfig');

/**
 * Build complete JSON-LD Product schema for an inventory unit
 */
function generateProductSchema(unit) {
  const price = parseFloat(unit.asking_price || 0);
  const year = parseInt(unit.year) || null;
  const hours = parseInt(unit.hours) || null;
  const capacity = parseInt(unit.capacity_lbs || 0);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${year ? `${year} ` : ''}${unit.make} ${unit.model}`,
    description: buildDescription(unit),
    image: unit.photos?.[0] || null,
    url: `${SEO_CONFIG.baseUrl}/inventory/${unit.id}`,
    sku: unit.serial || unit.id,
    productID: unit.id,
    brand: {
      '@type': 'Brand',
      name: unit.make,
    },
    manufacturer: {
      '@type': 'Organization',
      name: unit.make,
    },
    category: 'Industrial Equipment > Forklifts',
    offers: buildOffersSchema(unit, price),
    aggregateRating: null, // No reviews for MVP
    additionalProperty: buildAdditionalProperties(unit),
  };

  // Add condition
  if (unit.condition) {
    schema.itemCondition = mapCondition(unit.condition);
  }

  return schema;
}

/**
 * Build the offers schema (pricing + availability)
 */
function buildOffersSchema(unit, price) {
  return {
    '@type': 'Offer',
    price: price.toFixed(2),
    priceCurrency: 'USD',
    priceValidUntil: getPriceValidUntil(),
    availability: mapAvailability(unit.status),
    itemCondition: unit.condition ? mapCondition(unit.condition) : 'https://schema.org/NewCondition',
    seller: {
      '@type': 'Organization',
      name: 'Material Solutions',
      url: SEO_CONFIG.baseUrl,
    },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: '0',
        currency: 'USD',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'US',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: '1',
          maxValue: '3',
          unitCode: 'DAY',
        },
      },
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'US',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 14,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
    },
  };
}

/**
 * Build additional properties (specs as structured data)
 */
function buildAdditionalProperties(unit) {
  const props = [];

  if (unit.hours) props.push({ '@type': 'PropertyValue', name: 'Hour Meter', value: `${unit.hours} hours` });
  if (unit.capacity_lbs) props.push({ '@type': 'PropertyValue', name: 'Lift Capacity', value: `${unit.capacity_lbs} lbs` });
  if (unit.mast_type) props.push({ '@type': 'PropertyValue', name: 'Mast Type', value: unit.mast_type });
  if (unit.power_type) props.push({ '@type': 'PropertyValue', name: 'Power Type', value: capitalize(unit.power_type) });
  if (unit.serial) props.push({ '@type': 'PropertyValue', name: 'Serial Number', value: unit.serial });
  if (unit.lift_height_inches) props.push({ '@type': 'PropertyValue', name: 'Max Lift Height', value: `${unit.lift_height_inches} inches` });
  if (unit.year) props.push({ '@type': 'PropertyValue', name: 'Year', value: String(unit.year) });

  return props;
}

/**
 * Human-readable description for SEO
 */
function buildDescription(unit) {
  const parts = [];

  if (unit.year) parts.push(`${unit.year} ${unit.make} ${unit.model}`);
  else parts.push(`${unit.make} ${unit.model}`);

  if (unit.hours) parts.push(`${parseInt(unit.hours).toLocaleString()} hours`);
  if (unit.capacity_lbs) parts.push(`${parseInt(unit.capacity_lbs).toLocaleString()} lb capacity`);
  if (unit.mast_type) parts.push(`${unit.mast_type} mast`);
  if (unit.power_type) parts.push(`${capitalize(unit.power_type)} powered`);
  if (unit.condition) parts.push(`${unit.condition} condition`);

  return `${parts.slice(0, 5).join(', ')}. ${unit.condition_notes || ''} For sale by Material Solutions — call +1 (800) 555-0199.`;
}

/**
 * Map our status to schema.org availability
 */
function mapAvailability(status) {
  const map = {
    listed: 'https://schema.org/InStock',
    reserved: 'https://schema.org/InStock',
    pending: 'https://schema.org/PreOrder',
    sold: 'https://schema.org/SoldOut',
    intake: 'https://schema.org/PreOrder',
  };
  return map[status] || 'https://schema.org/InStock';
}

/**
 * Map our condition to schema.org item condition
 */
function mapCondition(condition) {
  const map = {
    new: 'https://schema.org/NewCondition',
    excellent: 'https://schema.org/NewCondition',
    'like-new': 'https://schema.org/RefurbishedCondition',
    good: 'https://schema.org/UsedCondition',
    fair: 'https://schema.org/UsedCondition',
    poor: 'https://schema.org/UsedCondition',
  };
  return map[condition?.toLowerCase()] || 'https://schema.org/UsedCondition';
}

/**
 * Price valid 30 days from now
 */
function getPriceValidUntil() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate FAQ schema (for AEO — People Also Ask)
 */
function generateFaqSchema(unit) {
  const year = unit.year || '';
  const make = unit.make || '';
  const model = unit.model || '';

  return [
    {
      '@type': 'Question',
      name: `How much is a ${year} ${make} ${model} forklift worth?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `A ${year} ${make} ${model} in ${unit.condition || 'good'} condition with ${unit.hours ? `${parseInt(unit.hours).toLocaleString()} hours` : 'unknown hours'} is priced at $${parseFloat(unit.asking_price || 0).toLocaleString()} USD. Prices vary based on condition, hours, and location.`,
      },
    },
    {
      '@type': 'Question',
      name: `What is the lift capacity of a ${make} ${model} forklift?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `The ${year} ${make} ${model} has a lift capacity of ${unit.capacity_lbs ? `${parseInt(unit.capacity_lbs).toLocaleString()} lbs` : 'see specs'}.`,
      },
    },
    {
      '@type': 'Question',
      name: `Are electric forklifts better than propane?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: unit.power_type === 'electric'
          ? `This ${make} ${model} is electric-powered — ideal for indoor warehouses with zero emissions and lower operating costs.`
          : `Propane forklifts like the ${year} ${make} ${model} offer more power for outdoor applications and faster refueling. Electric is better for indoor use; propane for heavy outdoor loads.`,
      },
    },
    {
      '@type': 'Question',
      name: `Does Material Solutions offer delivery for forklifts?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Yes. Material Solutions offers delivery throughout the Mid-Atlantic region. Contact us at +1 (800) 555-0199 or email sales@materialsolutions.com for a delivery quote.`,
      },
    },
    {
      '@type': 'Question',
      name: `Can I finance a forklift purchase?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Yes — Material Solutions works with multiple equipment financing partners. Call +1 (800) 555-0199 to discuss financing options for this ${year} ${make} ${model}.`,
      },
    },
  ];
}

module.exports = { generateProductSchema, generateFaqSchema };
