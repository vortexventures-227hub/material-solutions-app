/**
 * FAQ Generator for AEO (Answer Engine Optimization)
 * People Also Ask, featured snippets
 */

const { generateFaqSchema } = require('./schemaGenerator');

/**
 * Generate FAQ schema + rendered HTML
 */
function generateFaq(unit) {
  const faqSchema = generateFaqSchema(unit);
  const faqHtml = renderFaqHtml(faqSchema);
  return { schema: faqSchema, html: faqHtml };
}

/**
 * Render FAQ as HTML accordion (for web display)
 */
function renderFaqHtml(faqSchema) {
  return faqSchema.map((item, i) => `
    <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
      <h3 class="faq-question" itemprop="name" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('open')">
        ${item.name}
        <span class="faq-toggle">+</span>
      </h3>
      <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
        <p itemprop="text">${item.acceptedAnswer.text}</p>
      </div>
    </div>
  `).join('');
}

/**
 * Generate unit-specific FAQ questions (raw)
 */
function generateFaqQuestions(unit) {
  const year = unit.year || '';
  const make = unit.make || '';
  const model = unit.model || '';
  const price = unit.asking_price ? `$${parseFloat(unit.asking_price).toLocaleString()}` : 'Contact for pricing';

  return [
    {
      q: `What is the price of a ${year} ${make} ${model} forklift?`,
      a: `The ${year} ${make} ${model} is listed at ${price}. Prices vary based on condition, hours, and accessories. Call +1 (800) 555-0199 for a quote.`,
    },
    {
      q: `What is the lifting capacity of the ${make} ${model}?`,
      a: `The ${make} ${model} has a lift capacity of ${unit.capacity_lbs ? `${parseInt(unit.capacity_lbs).toLocaleString()} pounds` : 'varies by configuration'}.`,
    },
    {
      q: `How many hours does this forklift have?`,
      a: `This unit has ${unit.hours ? `${parseInt(unit.hours).toLocaleString()} operating hours` : 'been inspected — see specs for full hour meter reading'}.`,
    },
    {
      q: `Is this forklift electric or propane?`,
      a: `The ${year} ${make} ${model} is ${unit.power_type || 'available in your choice of power type'}. ${unit.power_type === 'electric' ? 'Electric forklifts are ideal for indoor/warehouse use with zero emissions and lower operating costs.' : 'Propane forklifts offer excellent power for outdoor applications with quick refueling.'}`,
    },
    {
      q: `What type of mast does this forklift have?`,
      a: `This ${make} ${model} features a ${unit.mast_type || 'available in multiple mast configurations'}. We can configure the right mast height for your racking system.`,
    },
    {
      q: `Does Material Solutions deliver forklifts?`,
      a: `Yes — we deliver throughout the Mid-Atlantic region (MD, VA, DC, PA, DE). Call +1 (800) 555-0199 for a delivery quote.`,
    },
    {
      q: `Can I finance a forklift purchase?`,
      a: `Yes — Material Solutions works with equipment financing partners. We offer competitive rates for qualified buyers. Call +1 (800) 555-0199 to apply.`,
    },
    {
      q: `What is the lift height on this forklift?`,
      a: `This unit offers a maximum lift height of ${unit.lift_height_inches ? `${unit.lift_height_inches} inches` : 'varies by mast configuration'}. We can spec the right lift height for your warehouse.`,
    },
  ];
}

module.exports = { generateFaq, generateFaqQuestions };
