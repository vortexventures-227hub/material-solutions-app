import React from 'react';
import { HowToSchema } from '../components/SEO';
import { Layout, PageHeader } from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';

const Resources = () => {
  const inspectionSteps = [
    {
      name: "Visual Inspection (Exterior)",
      text: "Check for visible damage: cracked welds, leaking fluids, damaged mast, worn tires, bent forks. Look for oil, coolant, or hydraulic fluid leaks under the forklift."
    },
    {
      name: "Check Safety Features",
      text: "Test the horn, lights (headlights, tail lights, warning lights), backup alarm, and seatbelt. Ensure overhead guard is intact and secure."
    },
    {
      name: "Tire Inspection",
      text: "Check tire pressure (pneumatic) or tread depth (solid). Look for cuts, gouges, or excessive wear. Replace if tread is below manufacturer spec."
    },
    {
      name: "Fluid Levels",
      text: "Check engine oil, coolant, hydraulic fluid, and battery water (if applicable). Top off if low. Check for contamination."
    },
    {
      name: "Functional Test (Brakes)",
      text: "Start the forklift. Test service brake (foot pedal) and parking brake. Brakes should engage smoothly without grinding or pulling to one side."
    },
    {
      name: "Functional Test (Steering)",
      text: "Turn the steering wheel in both directions. Steering should be smooth without excessive play or binding."
    },
    {
      name: "Functional Test (Mast & Forks)",
      text: "Raise and lower the forks. Tilt the mast forward and back. Check for smooth operation, unusual noises, or jerky movement. Inspect chains for wear."
    },
    {
      name: "Record Inspection",
      text: "Log the inspection results (date, operator name, pass/fail). Report any defects to supervisor immediately. Do not operate if defects are found."
    }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Resources" 
        description="OSHA-compliant forklift inspection guide and checklist."
      />
      
      <div className="max-w-4xl mx-auto pb-12">
        <HowToSchema
          name="How to Inspect a Forklift (OSHA Pre-Use Checklist)"
          description="Complete OSHA-compliant forklift inspection checklist for warehouse operators. Covers visual inspection, functional tests, and safety checks."
          totalTime="PT10M"
          tools={["OSHA Inspection Checklist (printable)"]}
          steps={inspectionSteps}
        />
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center text-xl shadow-sm">
            🔍
          </div>
          <h2 className="text-2xl font-bold text-gray-900">How to Inspect a Forklift</h2>
        </div>

        <p className="text-lg text-gray-600 mb-10">
          A complete OSHA-compliant pre-use inspection checklist for forklift operators. 
          Regular inspections ensure equipment safety and regulatory compliance.
        </p>

        <div className="space-y-4">
          {inspectionSteps.map((step, i) => (
            <Card key={i} className="overflow-hidden border-l-4 border-l-brand-500 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <span className="w-8 h-8 shrink-0 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-0.5 shadow-sm">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Resources;

