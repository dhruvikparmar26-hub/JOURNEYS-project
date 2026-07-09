import React from 'react';
import LandingLayout from '../components/ui/LandingLayout.jsx';

const PrivacyPage = () => {
  return (
    <LandingLayout>
      <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-16 space-y-10">
        {/* Header Section */}
        <div className="space-y-4 text-center md:text-left border-b border-[#E5DED4] pb-8">
          <span className="material-symbols-outlined text-4xl text-primary animate-pulse">security</span>
          <h1 className="font-display-lg text-3xl md:text-4xl text-[#0B1226] font-bold">Privacy Policy</h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold font-label-caps">
            Last Updated: July 8, 2026 • Journeys Travel Technology
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-[#0B1226] leading-relaxed text-sm">
          <section className="space-y-3">
            <h3 className="font-headline-md text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">info</span>
              1. Introduction
            </h3>
            <p>
              Welcome to Journeys. We value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, handle, use, and store your travel plans, profile details, and transaction data when you visit our website, utilize our trip generation tools, or interact with our services.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-headline-md text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">cloud_download</span>
              2. Data We Collect
            </h3>
            <p>
              To offer automated travel plans, package booking services, and user dashboard stats, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Identity Details:</strong> Full name, email addresses, and account credentials.</li>
              <li><strong>Travel Plans:</strong> Search origins, destinations, vehicle preferences, distance outputs, day plans, and bookmarks.</li>
              <li><strong>Transaction Records:</strong> Billing aggregates, quantities, mock payments, and spent totals to populate travel charts.</li>
              <li><strong>Technical Metadata:</strong> IP addresses, browser types, and cookies to customize the user interface themes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-headline-md text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">settings_suggest</span>
              3. How We Use Your Data
            </h3>
            <p>
              Your data is analyzed and processed exclusively to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Generate custom travel plans, day-to-day packing checklists, and local routing vectors.</li>
              <li>Send email alerts, booking confirmations, and real-time trip reports directly to your notifications panel.</li>
              <li>Aggregate anonymous dashboard metrics like Top Destinations and Total Spend averages.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-headline-md text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">share</span>
              4. Data Sharing and Protection
            </h3>
            <p>
              Journeys does not sell your private search history to third-party advertisers. We employ enterprise SSL encryption layers to lock down account credentials and local databases from external attacks.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-headline-md text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">vpn_key</span>
              5. Your Choices and Rights
            </h3>
            <p>
              You can view, edit, or delete your entire profile and generated itineraries directly in your settings tab at any time. To request a permanent deletion of your account and booking history, please open a support ticket under the Help Center.
            </p>
          </section>
        </div>
      </div>
    </LandingLayout>
  );
};

export default PrivacyPage;
