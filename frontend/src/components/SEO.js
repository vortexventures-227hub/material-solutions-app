import React from 'react';

/**
 * SEO.js — Reusable AEO/Schema.org markup components
 * For Answer Engine Optimization and structured data
 */

/**
 * LocalBusiness Schema — Add to homepage
 * @param {Object} props
 * @param {string} props.name - Business name
 * @param {string} props.description - Business description
 * @param {string} props.phone - Phone number
 * @param {string} props.email - Email address
 * @param {Object} props.address - {street, city, region, zip, country}
 * @param {Object} props.geo - {latitude, longitude}
 * @param {string} props.url - Website URL
 * @param {Array} props.priceRange - Price range (e.g., "$$")
 * @param {Array} props.areasServed - Array of served areas
 * @param {Array} props.services - Array of service names
 * @param {string} props.foundingDate - Year founded
 */
export function LocalBusinessSchema({
  name = 'Material Solutions',
  description = 'New Jersey\'s trusted forklift dealer since 1999.',
  phone = '+1-800-555-0199',
  email = 'info@materialsolutionsnj.com',
  address = { street: '[Street Address]', city: '[City]', region: 'NJ', zip: '[ZIP]', country: 'US' },
  geo = { latitude: '40.123456', longitude: '-74.123456' },
  url = 'https://materialsolutionsnj.com',
  priceRange = '$$',
  areasServed = ['New Jersey', 'Pennsylvania', 'New York'],
  services = ['New Forklift Sales', 'Used Forklift Sales', 'OSHA Forklift Training', 'Forklift Repair & Maintenance', 'Forklift Rentals'],
  foundingDate = '1999'
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    alternateName: 'Material Solutions NJ',
    description,
    url,
    telephone: phone,
    email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      postalCode: address.zip,
      addressCountry: address.country
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00'
      }
    ],
    priceRange,
    areaServed: areasServed.map(name => ({ '@type': 'State', name })),
    sameAs: [
      'https://www.facebook.com/MaterialSolutionsNJ',
      'https://www.linkedin.com/company/material-solutions-nj'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Forklift Services',
      itemListElement: services.map(service => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: service }
      }))
    },
    foundingDate,
    numberOfEmployees: { '@type': 'QuantitativeValue', value: '15' }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}

/**
 * FAQPage Schema — Add to service pages
 * @param {Array} props.questions - Array of {question, answer} objects
 */
export function FAQSchema({ questions = [] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}

/**
 * Product Schema — Add to inventory item pages
 * @param {Object} props
 * @param {string} props.name - Product name (e.g., "Toyota 7FBE15 Electric Forklift")
 * @param {string} props.description - Product description
 * @param {string} props.brand - Brand name
 * @param {string} props.model - Model number
 * @param {string} props.price - Price in USD
 * @param {string} props.condition - "NewCondition" or "UsedCondition"
 * @param {string} props.image - Image URL
 * @param {string} props.url - Product page URL
 * @param {Object} props.seller - {name}
 * @param {Array} props.specs - Array of {name, value} for additionalProperty
 * @param {Object} props.rating - {ratingValue, reviewCount}
 */
export function ProductSchema({
  name,
  description,
  brand,
  model,
  price,
  condition = 'UsedCondition',
  image,
  url,
  seller = { name: 'Material Solutions' },
  specs = [],
  rating = { ratingValue: '4.8', reviewCount: '12' }
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: { '@type': 'Brand', name: brand },
    model,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: seller.name }
    },
    itemCondition: `https://schema.org/${condition}`,
    image,
    additionalProperty: specs.map(({ name: specName, value }) => ({
      '@type': 'PropertyValue',
      name: specName,
      value: String(value)
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.ratingValue,
      reviewCount: rating.reviewCount
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}

/**
 * HowTo Schema — Add to how-to guide pages
 * @param {Object} props
 * @param {string} props.name - Guide title
 * @param {string} props.description - Guide description
 * @param {string} props.totalTime - ISO 8601 duration (e.g., "PT10M")
 * @param {Array} props.tools - Array of tool names
 * @param {Array} props.steps - Array of {name, text} step objects
 */
export function HowToSchema({
  name,
  description,
  totalTime = 'PT10M',
  tools = [],
  steps = []
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    totalTime,
    tool: tools.map(tool => ({ '@type': 'HowToTool', name: tool })),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}

/**
 * Organization Schema — Add to about page
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Material Solutions',
    url: 'https://materialsolutionsnj.com',
    logo: 'https://materialsolutionsnj.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-555-0199',
      email: 'info@materialsolutionsnj.com',
      contactType: 'sales',
      availableLanguage: ['English', 'Spanish']
    },
    sameAs: [
      'https://www.facebook.com/MaterialSolutionsNJ',
      'https://www.linkedin.com/company/material-solutions-nj'
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}

/**
 * Default exports for easy importing
 */
const SEOSchemas = {
  LocalBusinessSchema,
  FAQSchema,
  ProductSchema,
  HowToSchema,
  OrganizationSchema
};

export default SEOSchemas;
