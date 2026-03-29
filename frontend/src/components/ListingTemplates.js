import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Copy, Check, Share2 } from 'lucide-react';

const COLOR_CLASSES = {
  blue: 'bg-[#1877F2] hover:bg-[#166fe5]', // FB Blue
  green: 'bg-[#558000] hover:bg-[#4d7300]', // Craigslist Green
  purple: 'bg-[#0A66C2] hover:bg-[#0958a8]', // LinkedIn Blue/Purple
};

const ListingTemplates = ({ inventory }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const { addToast } = useToast();

  const copyToClipboard = (text, index, name) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      addToast(`${name} template copied!`, 'success');
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(() => {
      addToast('Failed to copy to clipboard', 'error');
    });
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
    <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
          <Share2 size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Listing Templates</h3>
      </div>
      
      <div className="space-y-6">
        {templates.map((template, idx) => (
          <div key={idx} className="group relative">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-sm text-gray-500 uppercase tracking-widest">
                {template.name}
              </h4>
              <button
                onClick={() => copyToClipboard(template.text, idx, template.name)}
                className={`
                  flex items-center space-x-2 px-4 h-[44px] rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95
                  ${COLOR_CLASSES[template.color] || 'bg-gray-600'}
                `}
              >
                {copiedIndex === idx ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedIndex === idx ? 'COPIED!' : 'COPY'}</span>
              </button>
            </div>
            <div className="relative">
              <pre className="bg-gray-50 p-4 rounded-xl text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap border border-gray-100 shadow-inner max-h-[200px] overflow-y-auto">
                {template.text}
              </pre>
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 to-transparent rounded-b-xl pointer-events-none opacity-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingTemplates;
