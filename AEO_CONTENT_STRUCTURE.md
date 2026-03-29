# AEO Content Structure — MaterialsSolutionsNJ.com

**Created:** 2026-03-28 9:30 PM EDT  
**Author:** Axis  
**Purpose:** Answer Engine Optimization templates for AI search visibility

---

## What is AEO?

Answer Engine Optimization ensures Material Solutions appears when someone asks AI:
- "Where to buy a forklift in New Jersey?"
- "OSHA forklift training near me"
- "Best used forklifts in NJ"
- "Forklift repair service"

---

## Core Principles

1. **First 100 Words = Direct Answer** — AI engines extract from the intro
2. **FAQ Schema Markup** — Machine-readable Q&A
3. **LocalBusiness Schema** — Entity recognition
4. **E-E-A-T Signals** — 27 years experience, certifications, expertise

---

## Template 1: Service Page (Forklift Sales)

### Page: `/services/forklift-sales`

#### Direct Answer Block (First 100 words)
```
Material Solutions has been New Jersey's trusted forklift dealer since 1999. We sell new and certified pre-owned forklifts from Toyota, Hyster, Yale, and Crown. Located in [City], NJ, we serve warehouses, distribution centers, and manufacturing facilities throughout New Jersey, Pennsylvania, and New York.

Our inventory includes sit-down forklifts (3,000-15,000 lb capacity), reach trucks, pallet jacks, and order pickers. Every used forklift undergoes a 50-point OSHA safety inspection and comes with a warranty. Free delivery within 50 miles. Same-day quotes available.

Contact us: (XXX) XXX-XXXX | sales@materialsolutionsnj.com
```

#### FAQ Schema (JSON-LD)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does a forklift cost in New Jersey?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "New forklifts range from $20,000 to $50,000 depending on capacity and features. Certified pre-owned forklifts start at $8,000. Material Solutions offers financing options and free quotes. Call (XXX) XXX-XXXX for current inventory pricing."
      }
    },
    {
      "@type": "Question",
      "name": "What brands of forklifts do you sell?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We sell Toyota, Hyster, Yale, Crown, and other major brands. Our inventory includes electric, propane, and diesel forklifts. All brands undergo the same rigorous safety inspection process."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer forklift financing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Material Solutions partners with equipment financing providers. We offer lease-to-own, rental purchase, and traditional financing options. Approval typically takes 24-48 hours."
      }
    },
    {
      "@type": "Question",
      "name": "What areas do you serve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We serve all of New Jersey, Eastern Pennsylvania, and the greater New York metro area. Free delivery within 50 miles of our [City], NJ location. Extended delivery available for a fee."
      }
    },
    {
      "@type": "Question",
      "name": "Are used forklifts safe to buy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, when certified. Every Material Solutions pre-owned forklift undergoes a 50-point OSHA safety inspection covering brakes, mast, hydraulics, tires, lights, and load capacity. We replace worn components before sale and include a warranty."
      }
    }
  ]
}
</script>
```

---

## Template 2: Service Page (OSHA Training)

### Page: `/services/osha-forklift-training`

#### Direct Answer Block
```
Material Solutions provides OSHA-compliant forklift operator training in New Jersey. Our certified instructors deliver classroom and hands-on training that meets OSHA 1910.178 requirements. Training takes 4-8 hours and includes certification valid for 3 years.

We offer on-site training at your facility or at our [City], NJ training center. Classes available in English and Spanish. Recertification and refresher courses also available.

Cost: $150-250 per operator (group discounts available)  
Schedule training: (XXX) XXX-XXXX | training@materialsolutionsnj.com
```

#### FAQ Schema
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does OSHA forklift training take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "OSHA forklift training takes 4-8 hours total. This includes classroom instruction (safety rules, load handling, OSHA regulations) and hands-on operation practice. Certification is issued upon completion and is valid for 3 years."
      }
    },
    {
      "@type": "Question",
      "name": "How much does OSHA forklift certification cost in NJ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Individual training costs $150-250 per operator. Group discounts available for 5+ employees. On-site training at your facility may have additional travel fees. Contact Material Solutions for a custom quote: (XXX) XXX-XXXX."
      }
    },
    {
      "@type": "Question",
      "name": "Is forklift certification required in New Jersey?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. OSHA requires all forklift operators to be trained and evaluated. New Jersey follows federal OSHA standards (29 CFR 1910.178). Employers must provide training, and operators must be re-certified every 3 years."
      }
    },
    {
      "@type": "Question",
      "name": "What topics are covered in OSHA forklift training?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Training covers: vehicle inspection, safe operation, load capacity and stability, pedestrian safety, refueling/recharging, ramp operation, and OSHA compliance. Hands-on practice includes maneuvering, stacking, and pickup/delivery."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer Spanish-language training?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Material Solutions offers OSHA forklift training in English and Spanish. Bilingual instructors are available for on-site training sessions."
      }
    }
  ]
}
</script>
```

---

## Template 3: LocalBusiness Schema (Homepage)

### Page: `/`

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Material Solutions",
  "alternateName": "Material Solutions NJ",
  "description": "New Jersey's trusted forklift dealer since 1999. We sell, rent, repair, and service forklifts. OSHA training available.",
  "url": "https://materialsolutionsnj.com",
  "telephone": "+1-XXX-XXX-XXXX",
  "email": "info@materialsolutionsnj.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Street Address]",
    "addressLocality": "[City]",
    "addressRegion": "NJ",
    "postalCode": "[ZIP]",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "XX.XXXXXX",
    "longitude": "-XX.XXXXXX"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "17:00"
    }
  ],
  "priceRange": "$$",
  "areaServed": [
    {
      "@type": "State",
      "name": "New Jersey"
    },
    {
      "@type": "State",
      "name": "Pennsylvania"
    },
    {
      "@type": "State",
      "name": "New York"
    }
  ],
  "logo": "https://materialsolutionsnj.com/logo.png",
  "image": "https://materialsolutionsnj.com/og-image.jpg",
  "sameAs": [
    "https://www.facebook.com/MaterialSolutionsNJ",
    "https://www.linkedin.com/company/material-solutions-nj"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Forklift Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "New Forklift Sales"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Used Forklift Sales"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "OSHA Forklift Training"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Forklift Repair & Maintenance"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Forklift Rentals"
        }
      }
    ]
  },
  "foundingDate": "1999",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": "X"
  }
}
</script>
```

---

## Template 4: HowTo Schema (Inspection Guide)

### Page: `/resources/how-to-inspect-a-forklift`

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Inspect a Forklift (OSHA Pre-Use Checklist)",
  "description": "Complete OSHA-compliant forklift inspection checklist for warehouse operators. Covers visual inspection, functional tests, and safety checks.",
  "totalTime": "PT10M",
  "tool": [
    {
      "@type": "HowToTool",
      "name": "OSHA Inspection Checklist (printable)"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Visual Inspection (Exterior)",
      "text": "Check for visible damage: cracked welds, leaking fluids, damaged mast, worn tires, bent forks. Look for oil, coolant, or hydraulic fluid leaks under the forklift."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Check Safety Features",
      "text": "Test the horn, lights (headlights, tail lights, warning lights), backup alarm, and seatbelt. Ensure overhead guard is intact and secure."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Tire Inspection",
      "text": "Check tire pressure (pneumatic) or tread depth (solid). Look for cuts, gouges, or excessive wear. Replace if tread is below manufacturer spec."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Fluid Levels",
      "text": "Check engine oil, coolant, hydraulic fluid, and battery water (if applicable). Top off if low. Check for contamination."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Functional Test (Brakes)",
      "text": "Start the forklift. Test service brake (foot pedal) and parking brake. Brakes should engage smoothly without grinding or pulling to one side."
    },
    {
      "@type": "HowToStep",
      "position": 6,
      "name": "Functional Test (Steering)",
      "text": "Turn the steering wheel in both directions. Steering should be smooth without excessive play or binding."
    },
    {
      "@type": "HowToStep",
      "position": 7,
      "name": "Functional Test (Mast & Forks)",
      "text": "Raise and lower the forks. Tilt the mast forward and back. Check for smooth operation, unusual noises, or jerky movement. Inspect chains for wear."
    },
    {
      "@type": "HowToStep",
      "position": 8,
      "name": "Record Inspection",
      "text": "Log the inspection results (date, operator name, pass/fail). Report any defects to supervisor immediately. Do not operate if defects are found."
    }
  ]
}
</script>
```

---

## Template 5: Product Schema (Inventory Item)

### Page: `/inventory/toyota-7fbe15-electric-forklift`

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Toyota 7FBE15 Electric Forklift",
  "description": "Certified pre-owned Toyota 7FBE15 electric sit-down forklift. 3,000 lb capacity, 189-inch lift height. Low hours, excellent condition. OSHA safety certified.",
  "brand": {
    "@type": "Brand",
    "name": "Toyota"
  },
  "model": "7FBE15",
  "offers": {
    "@type": "Offer",
    "url": "https://materialsolutionsnj.com/inventory/toyota-7fbe15-electric-forklift",
    "priceCurrency": "USD",
    "price": "12500",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Material Solutions"
    }
  },
  "itemCondition": "https://schema.org/UsedCondition",
  "image": "https://materialsolutionsnj.com/inventory/toyota-7fbe15-main.jpg",
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Capacity",
      "value": "3000 lbs"
    },
    {
      "@type": "PropertyValue",
      "name": "Lift Height",
      "value": "189 inches"
    },
    {
      "@type": "PropertyValue",
      "name": "Power Type",
      "value": "Electric (36V battery)"
    },
    {
      "@type": "PropertyValue",
      "name": "Hours",
      "value": "2,850"
    },
    {
      "@type": "PropertyValue",
      "name": "Serial Number",
      "value": "7FBE15-XXXXXX"
    },
    {
      "@type": "PropertyValue",
      "name": "Year",
      "value": "2018"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "12"
  }
}
</script>
```

---

## Implementation Checklist

### Phase 1: Core Pages (Week 1)
- [ ] Homepage — LocalBusiness schema
- [ ] Forklift Sales page — FAQ schema + direct answer
- [ ] OSHA Training page — FAQ schema + direct answer
- [ ] Repair/Service page — FAQ schema + direct answer

### Phase 2: Inventory & Resources (Week 2)
- [ ] Inventory item template — Product schema
- [ ] How-to guides — HowTo schema (inspection, operation, safety)
- [ ] Blog posts — Article schema

### Phase 3: Optimization (Ongoing)
- [ ] Set up HubSpot AEO Grader (free audit)
- [ ] Monitor with Otterly AI ($29/mo)
- [ ] Track keyword rankings in AI engines
- [ ] A/B test direct-answer phrasing

---

## Content Writing Guidelines

### First 100 Words Formula
1. **Who** — Material Solutions + 27 years experience
2. **What** — Specific service/product
3. **Where** — New Jersey + service area
4. **Why** — Unique value (OSHA certified, warranty, free delivery)
5. **Contact** — Phone + email + CTA

### FAQ Question Types
- **Price** — "How much does X cost?"
- **Process** — "How long does X take?"
- **Requirements** — "Do I need X?"
- **Coverage** — "What areas do you serve?"
- **Comparison** — "What's the difference between X and Y?"

### E-E-A-T Signals to Include
- Years in business (27+)
- Certifications (OSHA, manufacturer partnerships)
- Customer testimonials
- Before/after photos
- Step-by-step guides
- Local community involvement

---

## Tracking & Measurement

### Key Metrics
1. **AI Visibility Score** (Otterly AI dashboard)
2. **Branded vs Non-Branded Traffic** (Google Search Console)
3. **Featured Snippet Wins** (track in Ahrefs/Semrush)
4. **Conversion Rate** from organic AI referrals

### Monthly Reports
- AI search citations (how often Material Solutions is cited)
- Query coverage (% of target queries we rank for)
- Traffic from AI referrals
- Lead quality from AI-driven traffic

---

*This structure feeds directly into Cipher's frontend build.*
