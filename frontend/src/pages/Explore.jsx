import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/ui/AppShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Chip from '../components/ui/Chip.jsx';
import { MapPin, Compass, Sparkles, ChevronRight } from 'lucide-react';

const Explore = () => {
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5050/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitMessage('Success! You\'re on the waitlist.');
        setEmail('');
      } else {
        const data = await response.json();
        setSubmitMessage(data.error || 'Failed to join waitlist.');
      }
    } catch (error) {
      setSubmitMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Curated static destinations for India
  const destinations = [
    {
      id: 1,
      name: 'Golden Triangle',
      region: 'North India',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop',
      blurb: 'Experience the majestic trio of Delhi, Agra, and Jaipur - home to the Taj Mahal, Amber Fort, and vibrant bazaars.',
      destination: 'Delhi, Agra, Jaipur',
    },
    {
      id: 2,
      name: 'Kerala Backwaters',
      region: 'South India',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop',
      blurb: 'Drift through serene canals on a houseboat, surrounded by lush greenery and coconut groves in God\'s Own Country.',
      destination: 'Alleppey, Kerala',
    },
    {
      id: 3,
      name: 'Rajasthan Desert',
      region: 'West India',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop',
      blurb: 'Explore the golden sands of Jaisalmer, ancient forts of Jodhpur, and the romantic lakes of Udaipur.',
      destination: 'Jaisalmer, Jodhpur, Udaipur',
    },
    {
      id: 4,
      name: 'Himalayan Adventure',
      region: 'North India',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop',
      blurb: 'Trek through breathtaking mountain landscapes, visit ancient monasteries, and witness stunning sunrises in the Himalayas.',
      destination: 'Manali, Leh Ladakh',
    },
    {
      id: 5,
      name: 'Goa Beaches',
      region: 'West India',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
      blurb: 'Relax on pristine beaches, explore Portuguese heritage, and enjoy vibrant nightlife in India\'s beach paradise.',
      destination: 'Goa',
    },
    {
      id: 6,
      name: 'Varanasi Spiritual',
      region: 'East India',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop',
      blurb: 'Experience the spiritual heart of India on the banks of the sacred Ganges, with ancient temples and mesmerizing Ganga Aarti.',
      destination: 'Varanasi, Uttar Pradesh',
    },
    {
      id: 7,
      name: 'Northeast Paradise',
      region: 'Northeast India',
      image: 'https://images.unsplash.com/photo-1596392927859-9f89e9ce4750?w=800&h=600&fit=crop',
      blurb: 'Discover the unexplored beauty of the Seven Sisters - tea gardens, living root bridges, and diverse tribal cultures.',
      destination: 'Guwahati, Shillong, Meghalaya',
    },
    {
      id: 8,
      name: 'Mumbai & Ajanta',
      region: 'West India',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop',
      blurb: 'From the bustling city of Mumbai to the ancient Ajanta and Ellora caves - a journey through modern and ancient India.',
      destination: 'Mumbai, Aurangabad',
    },
  ];

  const handleDestinationClick = (destination) => {
    // Navigate to home and pre-fill the destination
    navigate('/', { state: { prefillDestination: destination.destination } });
  };

  return (
    <AppShell>
      <div className="w-full">
        {/* Hero Banner */}
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&h=900&fit=crop"
            alt="India landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:px-8 md:py-10">
            <Chip variant="gold" className="mb-4">EDITORIAL COLLECTIONS</Chip>
            <h1 className="display-lg text-[#e5e2e1] mb-4">
              Rediscover the Spirit of India
            </h1>
            <p className="body-lg text-[#c4c7c7] max-w-2xl mb-6">
              Curated journeys through ancient temples, vibrant cities, and breathtaking landscapes. Let AI craft your perfect adventure.
            </p>
            <Button onClick={() => navigate('/')}>
              Plan Custom Trip
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e9192]" />
              <input
                type="text"
                placeholder="Where do you want to go?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0e0e0e] border border-[#4d4635] rounded pl-12 pr-4 py-3 text-sm text-[#e5e2e1] placeholder:text-[#8e9192]/70 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:outline-none focus:border-[#eac249] focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05),0_0_0_2px_rgba(234,194,73,0.2)]"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-[#0e0e0e] border border-[#4d4635] rounded px-4 py-3 text-sm text-[#e5e2e1] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:outline-none focus:border-[#eac249]"
              >
                <option value="all">REGION</option>
                <option value="north">North India</option>
                <option value="south">South India</option>
                <option value="west">West India</option>
                <option value="east">East India</option>
                <option value="northeast">Northeast India</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-[#0e0e0e] border border-[#4d4635] rounded px-4 py-3 text-sm text-[#e5e2e1] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:outline-none focus:border-[#eac249]"
              >
                <option value="all">TYPE</option>
                <option value="luxury">Luxury</option>
                <option value="adventure">Adventure</option>
                <option value="wellness">Wellness</option>
                <option value="cultural">Cultural</option>
              </select>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="bg-[#0e0e0e] border border-[#4d4635] rounded px-4 py-3 text-sm text-[#e5e2e1] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:outline-none focus:border-[#eac249]"
              >
                <option value="all">DURATION</option>
                <option value="short">3-5 Days</option>
                <option value="medium">6-10 Days</option>
                <option value="long">11+ Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="headline-md text-[#e5e2e1]">Popular Destinations</h2>
            <a href="#" className="text-sm font-semibold text-[#eac249] hover:underline cursor-pointer">View all →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <Card
                key={dest.id}
                className="overflow-hidden cursor-pointer hover-lift"
                onClick={() => handleDestinationClick(dest)}
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-[#1b1b1c]">
                  {imageErrors[dest.id] ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#eac249]/20 to-[#eac249]/5 flex items-center justify-center">
                      <div className="text-center">
                        <Compass className="w-12 h-12 text-[#eac249]/50 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-[#e5e2e1]">{dest.name}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(dest.id)}
                      />
                      <Chip variant="blue" className="absolute top-3 right-3">{dest.region.toUpperCase()}</Chip>
                    </>
                  )}
                </div>
                <div className="p-4">
                  <Chip variant="gold" className="mb-2">AI OPTIMIZED</Chip>
                  <h3 className="text-lg font-bold text-[#eac249] mb-2">
                    {dest.name}
                  </h3>
                  <p className="text-sm text-[#c4c7c7] line-clamp-2 mb-4">
                    {dest.blurb}
                  </p>
                  <div className="border-t border-[#444748] pt-3 flex items-center justify-between">
                    <span className="label-system text-[#8e9192]">4 DAYS · LUXURY</span>
                    <ChevronRight className="w-4 h-4 text-[#8e9192]" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Email Capture CTA */}
        <div className="bg-gradient-to-b from-[#202020] to-[#1b1b1c] border-t border-[#444748] py-16">
          <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
            <Sparkles className="w-12 h-12 text-[#eac249] mx-auto mb-4" />
            <h2 className="display-lg text-[#e5e2e1] mb-4">
              Let AI weave your next story.
            </h2>
            <p className="body-lg text-[#c4c7c7] mb-8">
              Be the first to experience our AI-powered travel planning. Join the waitlist for early access.
            </p>
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-[#0e0e0e] border border-[#4d4635] rounded px-4 py-3 text-sm text-[#e5e2e1] placeholder:text-[#8e9192]/70 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:outline-none focus:border-[#eac249] focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05),0_0_0_2px_rgba(234,194,73,0.2)]"
                disabled={isSubmitting}
              />
              <Button variant="ai" type="submit" disabled={isSubmitting} className="whitespace-nowrap">
                {isSubmitting ? 'Joining...' : 'Notify Me'}
              </Button>
            </form>
            {submitMessage && (
              <p className={`text-sm mt-4 ${submitMessage.includes('Success') ? 'text-[#3BC48A]' : 'text-[#ffb4ab]'}`}>
                {submitMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Explore;
