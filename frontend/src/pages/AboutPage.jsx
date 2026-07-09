import React from 'react';
import LandingLayout from '../components/ui/LandingLayout.jsx';

const AboutPage = () => {
  const features = [
    {
      icon: 'map',
      title: 'AI Trip Planner',
      desc: 'Create highly personalized day-by-day travel plans including transit maps, stays, activities, and ratings.'
    },
    {
      icon: 'travel_explore',
      title: 'Autocomplete Search',
      desc: 'Explore 50+ locations with smart Haversine distance computations and automatic flight rules for cross-country routes.'
    },
    {
      icon: 'confirmation_number',
      title: 'Boarding Passes & Wallet',
      desc: 'Simulate secure UPI/Card checkouts and receive official passenger boarding passes stored in your digital wallet.'
    },
    {
      icon: 'monitoring',
      title: 'Travel Analytics',
      desc: 'Keep track of your total money spent, count trips completed, and review top destinations on visual insight dashboards.'
    },
    {
      icon: 'backpack',
      title: 'Day-by-Day Packing Lists',
      desc: 'Generate granular checklists for clothes, toiletries, and essentials based on trip duration and destination weather.'
    },
    {
      icon: 'notifications_active',
      title: 'Real-Time Price Alerts',
      desc: 'Track pricing updates and receive instant alerts when travel costs drop for your bookmarked destinations.'
    },
    {
      icon: 'groups',
      title: 'Group Trip Collaboration',
      desc: 'Plan, share, and edit itineraries together with your friends and family members in collaborative group rooms.'
    },
    {
      icon: 'rate_review',
      title: 'Travel Reviews & Logs',
      desc: 'Submit ratings, share tips, and upload travel logs to help the global explorer community discover new spots.'
    }
  ];

  return (
    <LandingLayout>
      <div className="max-w-[1000px] mx-auto px-margin-mobile md:px-margin-desktop py-16 space-y-16">
        
        {/* Hero Section */}
        <div className="space-y-6 text-center max-w-2xl mx-auto">
          <span className="material-symbols-outlined text-5xl text-primary animate-bounce">explore</span>
          <h1 className="font-display-lg text-4xl md:text-5xl text-[#0B1226] font-bold">About Journeys</h1>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Journeys is a modern, next-generation travel platform built to replace tedious itinerary planning with smart, beautiful, and feature-rich digital boarding experiences.
          </p>
        </div>

        {/* What We Are Doing Section */}
        <div className="bg-white border border-[#E5DED4] rounded-3xl p-8 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="font-label-caps text-[10px] text-primary uppercase font-bold tracking-wider">Our Mission</span>
            <h2 className="font-display-md text-2xl md:text-3xl text-[#0B1226] font-bold">Redefining How You Explore The World</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              We believe that planning a trip should be as exciting as the journey itself. Our platform brings together smart transit calculations, budget predictions, collaborative group boards, and automated checklists into a single, cohesive boarding dashboard.
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              By simulating actual checkouts, booking tickets, and monitoring price shifts, we give you the tools to explore without limits.
            </p>
          </div>
          <div className="bg-[#FAF6F0] p-6 rounded-2xl border border-[#E5DED4] space-y-4 text-center">
            <span className="material-symbols-outlined text-4xl text-[#006d35]">verified</span>
            <div className="text-2xl font-bold text-[#0B1226]">100% Simulated</div>
            <p className="text-xs text-on-surface-variant">
              Every feature is built with mock checkout layers, enabling sandboxed experimentation with Zero financial risk.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="font-label-caps text-[10px] text-primary uppercase font-bold tracking-wider">Features Overview</span>
            <h3 className="font-display-md text-2xl text-[#0B1226] font-bold">Packaged with Explorer Tools</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <div key={idx} className="bg-white border border-[#E5DED4] p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">{feat.icon}</span>
                </div>
                <h4 className="font-bold text-sm text-[#0B1226]">{feat.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </LandingLayout>
  );
};

export default AboutPage;
