import React, { useState } from 'react';
import { Layout, PageHeader } from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Truck, MapPin, Battery, Zap, Clock, Shield, ChevronDown, ChevronUp, Mail, Phone, User, MessageSquare } from 'lucide-react';

const FORKLOT = {
  title: 'Lot of 10 — Raymond Electric Order Pickers',
  price: 25000,
  location: 'Baltimore, Maryland',
  fob: 'Baltimore, MD',
  units: [
    { model: 'Raymond EASI OPC30TT', serial: 'EASI-00-AT26847', year: 'Circa 2000' },
    { model: 'Raymond 5600 PC30TT', serial: '560-12-34111', year: '2012' },
    { model: 'Raymond 5600 PC30TT', serial: '560-11-B11479', year: '2011' },
    { model: 'Raymond 5600 PC30TT', serial: '560-11-B11477', year: '2011' },
    { model: 'Raymond 5600 PC30TT', serial: '560-12-34229', year: '2012' },
    { model: 'Raymond 5600 PC30TT', serial: '560-11-B11478', year: '2011' },
    { model: 'Raymond 5600 PC30TT', serial: '560-12-B14238', year: '2012' },
    { model: 'Raymond 5600 PC30TT', serial: '560-11-B11481', year: '2011' },
    { model: 'Raymond 5600 PC30TT', serial: '560-11-B11480', year: '2011' },
    { model: 'Raymond 5600 PC30TT', serial: '560-12-B14230', year: '2012' },
  ],
  specs: {
    type: 'Electric Stand-Up Order Picker / Reach Truck',
    fuel: 'Electric',
    mast: '153" Collapsed / 366" Extended',
    guided: 'Wire-Guided',
    batteryCharger: 'Battery + Charger Included (Each Unit)',
    batteryHours: '~24,000 Hours Average',
    condition: 'Used — Running — Normal Warehouse Wear',
    quantity: '10 Units',
  },
  description: `Bulk lot of 10 Raymond electric stand-up order picker / reach trucks. All units wire-guided with 153" collapsed / 366" extended mast height. Each unit comes equipped with a battery and charger.

Models represented: Raymond EASI OPC30TT and Raymond 5600 PC30TT. Mix of 2011 and 2012 model years with (1) circa 2000 unit.

Condition: All units currently running with batteries. Normal cosmetic wear consistent with warehouse use — scuffs, paint wear on forks and body panels. No major structural damage observed. Fork tips, mast chains, and hydraulics appear intact.

Ideal for warehouse operators, distribution centers, and logistics companies looking to add narrow-aisle picking capacity at a bulk price.

Inspection welcome — contact David to schedule viewing in Baltimore, MD.`,
};

const Forklifts = () => {
  const [showAllUnits, setShowAllUnits] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const visibleUnits = showAllUnits ? FORKLOT.units : FORKLOT.units.slice(0, 5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission — wire to backend lead API
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <Layout>
      <PageHeader
        title={FORKLOT.title}
        description={`${FORKLOT.units.length} units available • ${FORKLOT.location}`}
      />

      <div className="max-w-5xl mx-auto space-y-8">

        {/* Price + Location Banner */}
        <Card className="bg-gradient-to-r from-brand-500 to-brand-600 border-0 text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-brand-100 text-sm font-medium uppercase tracking-wider mb-1">Asking Price</p>
                <p className="text-5xl font-black tracking-tight">${FORKLOT.price.toLocaleString()}</p>
                <p className="text-brand-100 text-sm mt-1">Entire lot of {FORKLOT.units.length} units</p>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-6 py-4">
                <MapPin size={24} className="text-brand-200" />
                <div>
                  <p className="text-sm font-semibold text-white">{FORKLOT.location}</p>
                  <p className="text-xs text-brand-200">FOB: {FORKLOT.fob}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: Truck, label: 'Type', value: FORKLOT.specs.type },
            { icon: Zap, label: 'Fuel', value: FORKLOT.specs.fuel },
            { icon: Clock, label: 'Mast', value: FORKLOT.specs.mast },
            { icon: Shield, label: 'Guidance', value: FORKLOT.specs.guided },
            { icon: Battery, label: 'Battery', value: FORKLOT.specs.batteryCharger },
            { icon: Clock, label: 'Battery Hours', value: FORKLOT.specs.batteryHours },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="bg-card border border-border/50">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-brand-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{label}</p>
                  <p className="text-sm font-semibold text-foreground leading-snug">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Description */}
        <Card className="bg-card border border-border/50">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4">About This Lot</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
              {FORKLOT.description}
            </div>
          </CardContent>
        </Card>

        {/* Unit Table */}
        <Card className="bg-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Unit Roster ({FORKLOT.units.length} Units)</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllUnits((v) => !v)}
                className="text-brand-500 gap-1"
              >
                {showAllUnits ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showAllUnits ? 'Show Less' : `Show All ${FORKLOT.units.length} Units`}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Model</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Serial</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUnits.map((unit, i) => (
                    <tr key={unit.serial} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-4 font-medium">{unit.model}</td>
                      <td className="py-3 px-4 font-mono text-xs">{unit.serial}</td>
                      <td className="py-3 px-4">{unit.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="bg-card border border-border/50" id="contact">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
                <Mail size={20} className="text-brand-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Contact About This Lot</h2>
                <p className="text-sm text-muted-foreground">Interested? Reach out to schedule an inspection or make an offer.</p>
              </div>
            </div>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground">David will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      required
                      type="text"
                      placeholder="Your Name"
                      className="pl-10"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      required
                      type="email"
                      placeholder="Email Address"
                      className="pl-10"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Phone Number (optional)"
                    className="pl-10"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3 top-4 text-muted-foreground" />
                  <textarea
                    required
                    placeholder="I'm interested in the lot of 10 Raymonds. I'd like to schedule an inspection / I'd like more info..."
                    className="pl-10 min-h-[120px]"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  />
                </div>
                <Button
                  type="submit"
                  variant="brand"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Or email David directly at Material Solutions, Inc. — Hamilton, New Jersey
                </p>
              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
};

export default Forklifts;
