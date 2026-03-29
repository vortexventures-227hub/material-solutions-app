import React from 'react';
import { FAQSchema } from '../components/SEO';
import { Layout, PageHeader } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const Services = () => {
  const forkliftSalesFAQ = [
    {
      question: "How much does a forklift cost in New Jersey?",
      answer: "New forklifts range from $20,000 to $50,000 depending on capacity and features. Certified pre-owned forklifts start at $8,000. Vortex Forklift offers financing options and free quotes. Call (800) 555-0199 for current inventory pricing."
    },
    {
      question: "What brands of forklifts do you sell?",
      answer: "We sell Toyota, Hyster, Yale, Crown, and other major brands. Our inventory includes electric, propane, and diesel forklifts. All brands undergo the same rigorous safety inspection process."
    },
    {
      question: "Do you offer forklift financing?",
      answer: "Yes. Vortex Forklift partners with equipment financing providers. We offer lease-to-own, rental purchase, and traditional financing options. Approval typically takes 24-48 hours."
    },
    {
      question: "What areas do you serve?",
      answer: "We serve all of New Jersey, Eastern Pennsylvania, and the greater New York metro area. Free delivery within 50 miles of our location. Extended delivery available for a fee."
    },
    {
      question: "Are used forklifts safe to buy?",
      answer: "Yes, when certified. Every Vortex Forklift pre-owned forklift undergoes a 50-point OSHA safety inspection covering brakes, mast, hydraulics, tires, lights, and load capacity. We replace worn components before sale and include a warranty."
    }
  ];

  const oshaTrainingFAQ = [
    {
      question: "How long does OSHA forklift training take?",
      answer: "OSHA forklift training takes 4-8 hours total. This includes classroom instruction (safety rules, load handling, OSHA regulations) and hands-on operation practice. Certification is issued upon completion and is valid for 3 years."
    },
    {
      question: "How much does OSHA forklift certification cost in NJ?",
      answer: "Individual training costs $150-250 per operator. Group discounts available for 5+ employees. On-site training at your facility may have additional travel fees. Contact Vortex Forklift for a custom quote: (800) 555-0199."
    },
    {
      question: "Is forklift certification required in New Jersey?",
      answer: "Yes. OSHA requires all forklift operators to be trained and evaluated. New Jersey follows federal OSHA standards (29 CFR 1910.178). Employers must provide training, and operators must be re-certified every 3 years."
    },
    {
      question: "What topics are covered in OSHA forklift training?",
      answer: "Training covers: vehicle inspection, safe operation, load capacity and stability, pedestrian safety, refueling/recharging, ramp operation, and OSHA compliance. Hands-on practice includes maneuvering, stacking, and pickup/delivery."
    },
    {
      question: "Do you offer Spanish-language training?",
      answer: "Yes. Vortex Forklift offers OSHA forklift training in English and Spanish. Bilingual instructors are available for on-site training sessions."
    }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Services" 
        description="Forklift sales and OSHA-compliant operator training."
      />
      
      <div className="space-y-12 pb-12">
        {/* Sales Section */}
        <section>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center text-xl shadow-sm">
              🚜
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Forklift Sales</h2>
          </div>
          
          <FAQSchema questions={forkliftSalesFAQ} />
          <p className="text-lg text-gray-600 mb-8 max-w-4xl">
            Vortex Forklift has been New Jersey's trusted forklift dealer since 1999. We sell new and certified pre-owned forklifts from Toyota, Hyster, Yale, and Crown. Serving warehouse, distribution, and manufacturing facilities throughout NJ, PA, and NY.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forkliftSalesFAQ.map((faq, i) => (
              <Card key={i} className="bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base text-gray-900 leading-tight">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Training Section */}
        <section>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-xl shadow-sm">
              📋
            </div>
            <h2 className="text-2xl font-bold text-gray-900">OSHA Forklift Training</h2>
          </div>
          
          <FAQSchema questions={oshaTrainingFAQ} />
          <p className="text-lg text-gray-600 mb-8 max-w-4xl">
            OSHA-compliant forklift operator training in New Jersey. Classroom and hands-on instruction meeting OSHA 1910.178 requirements. Certification valid for 3 years.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {oshaTrainingFAQ.map((faq, i) => (
              <Card key={i} className="bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base text-gray-900 leading-tight">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Services;

