import React, { useState } from 'react';

// Static Tailwind class mapping (dynamic class names are purged at build time)
const COLOR_CLASSES = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  green: 'bg-green-600 hover:bg-green-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
};

const ListingTemplates = ({ inventory }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback: clipboard API may not be available (no HTTPS, permission denied)
    });
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const templates = [
    {
      name: 'Facebook Marketplace',
      color: 'blue',
      text: `🚀 ${inventory.year} ${inventory.make} ${inventory.model} - Ready to Work! 🔥

📦 ${inventory.capacity_lbs} lbs capacity
⏱ ${inventory.hours} hours
💰 $${inventory.listing_price?.toLocaleString()}

${inventory.condition_notes}

📍 NJ/PA/NYC delivery available
✅ 90-day warranty included

Contact us today! 👇`
    },
    {
      name: 'Craigslist',
      color: 'green',
      text: `${inventory.year} ${inventory.make} ${inventory.model} Forklift - $${inventory.listing_price?.toLocaleString()}

SPECS:
• Make: ${inventory.make}
• Model: ${inventory.model}
• Year: ${inventory.year}
• Hours: ${inventory.hours}
• Capacity: ${inventory.capacity_lbs} lbs
• Mast Type: ${inventory.mast_type || 'N/A'}
• Lift Height: ${inventory.lift_height_inches || 'N/A'}"
• Power: ${inventory.power_type || 'N/A'}

CONDITION:
${inventory.condition_notes}

WARRANTY:
• 90 days full unit
• 6 months major components
• 1 year battery & charger

Serving NJ, Eastern PA, and NYC area for 29 years.

Contact Material Solutions for details.`
    },
    {
      name: 'LinkedIn',
      color: 'purple',
      text: `Material Solutions | ${inventory.year} ${inventory.make} ${inventory.model}

We're pleased to offer a reconditioned ${inventory.year} ${inventory.make} ${inventory.model} forklift, ideal for narrow aisle warehouse operations.

Key Specifications:
→ ${inventory.capacity_lbs} lb capacity
→ ${inventory.hours} operating hours
→ ${inventory.mast_type || 'Standard'} mast configuration
→ ${inventory.power_type || 'Electric'} power system

This unit has been thoroughly inspected and reconditioned to our high standards. ${inventory.condition_notes}

Price: $${inventory.listing_price?.toLocaleString()}

Includes comprehensive warranty coverage:
• 90-day full unit warranty
• 6-month major component coverage
• 1-year battery & charger warranty

With 29 years serving businesses across NJ, Eastern PA, and NYC, Material Solutions is your trusted partner for material handling equipment.

Contact us to schedule an inspection or request additional details.

#MaterialHandling #Forklift #Warehouse #Logistics`
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h3 className="text-xl font-bold mb-4">📋 Listing Templates</h3>
      <div className="space-y-4">
        {templates.map((template, idx) => (
          <div key={idx} className="border rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-lg">{template.name}</h4>
              <button
                onClick={() => copyToClipboard(template.text, idx)}
                className={`px-4 py-2 rounded font-semibold text-white ${COLOR_CLASSES[template.color] || 'bg-gray-600 hover:bg-gray-700'}`}
              >
                {copiedIndex === idx ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">
              {template.text}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingTemplates;
