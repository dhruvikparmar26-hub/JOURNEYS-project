import React from 'react';
import LandingLayout from '../components/ui/LandingLayout.jsx';

const TermsPage = () => {
  return (
    <LandingLayout>
      <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-16 space-y-10">
        {/* Header Section */}
        <div className="space-y-4 text-center md:text-left border-b border-[#E5DED4] pb-8">
          <span className="material-symbols-outlined text-4xl text-primary animate-pulse">gavel</span>
          <h1 className="font-display-lg text-3xl md:text-4xl text-[#0B1226] font-bold">Terms of Service</h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold font-label-caps">
            Last Updated: July 8, 2026 • Journeys Travel Technology
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-[#0B1226] leading-relaxed text-sm">
          <section className="space-y-3">
            <h3 className="font-headline-md text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">assignment_ind</span>
              1. Acceptance of Terms
            </h3>
            <p>
              By accessing, registering for, or using the Journeys Trip Planner platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you must refrain from registering an account or making bookings on the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-headline-md text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">travel_explore</span>
              2. Trip Planner & Generation Limits
            </h3>
            <p>
              Journeys utilizes advanced routing heuristics, distance metrics, and APIs to provide custom transit itineraries. Users must acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Itinerary travel paths, timing summaries, and local checklists are generated for general planning purposes only.</li>
              <li>Estimated ticket prices, route distances, and booking totals are approximations and subject to weather or seasonal changes.</li>
              <li>Under international travel policy, cross-border or transcontinental transit defaults strictly to flight/plane mode.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-headline-md text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">credit_card</span>
              3. Mock Checkout & Payments
            </h3>
            <p>
              Payment modules on Journeys are fully simulated checkout pathways. No real currency is transferred during transaction simulations (UPI inputs or Card codes).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-headline-md text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">warning</span>
              4. Code of Conduct
            </h3>
            <p>
              Users agree to provide accurate destination priorities and origin inputs. Generating spam accounts, loading automated script loops, or abusing review submissions to bypass system safeguards is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-headline-md text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">contact_support</span>
              5. Governing Law and Contact
            </h3>
            <p>
              These terms shall be governed by local laws without regard to conflict of law principles. For questions, please reach out via our Help Center support ticket interface.
            </p>
          </section>
        </div>
      </div>
    </LandingLayout>
  );
};

export default TermsPage;
