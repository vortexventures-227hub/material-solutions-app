/**
 * SEO Configuration
 */

module.exports = {
  baseUrl: process.env.FRONTEND_URL || 'https://www.materialsolutionsnj.com',
  companyName: 'Material Solutions NJ',
  companyTagline: 'Forklift Sales Machine — New Jersey',
  phone: process.env.PUBLIC_CONTACT_PHONE || process.env.DAVID_PHONE || '(848) 999-6854',
  email: process.env.PUBLIC_CONTACT_EMAIL || 'david@materialsolutionsnj.com',
  defaultImage: 'https://www.materialsolutionsnj.com/og-default.jpg',
  locale: 'en-US',
  region: 'US',
};
