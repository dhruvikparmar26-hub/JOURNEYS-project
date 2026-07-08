import Destination from '../models/Destination.js';
import Coupon from '../models/Coupon.js';

const mockDestinations = [
  {
    name: 'Jaipur',
    slug: 'jaipur',
    country: 'India',
    region: 'Rajasthan',
    continent: 'Asia',
    coordinates: { lat: 26.9124, lng: 75.7873 },
    shortDescription: 'The historic Pink City, famous for its magnificent forts, majestic palaces, and vibrant markets.',
    description: 'Jaipur, the capital of India’s Rajasthan state, is a flamboyant showcase of heritage, culture, and royal history. Evoking the splendour of a bygone era, the city’s heart beat pink under royal decree. It features magnificent architectural wonders like the honeycomb Hawa Mahal, the sprawling City Palace complex, and the hilltop Amber Fort. Renowned for its gemstone cutters, jewelry, local block-print textiles, and traditional Rajasthani cuisine (like dal baati churma), Jaipur offers an immersive royal experience.',
    highlights: ['Amber Fort Palace', 'Hawa Mahal (Palace of Winds)', 'City Palace Complex', 'Jantar Mantar Observatory', 'Chokhi Dhani Ethnic Resort'],
    bestTimeToVisit: {
      from: 'October',
      to: 'March',
      description: 'Cool and pleasant winters make it perfect for sightseeing.'
    },
    avgBudgetPerDay: {
      budget: 1500,
      midRange: 4500,
      luxury: 16000,
      currency: 'INR'
    },
    languages: ['Hindi', 'English', 'Rajasthani'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1477584308802-e9c3788ee12d?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1477584308802-e9c3788ee12d?w=400&h=300&fit=crop'
    },
    categories: ['heritage', 'city', 'backpacking'],
    weather: {
      summer: { avgTemp: 38, conditions: 'Hot and Dry' },
      winter: { avgTemp: 18, conditions: 'Cool and Pleasant' },
      monsoon: { avgTemp: 29, conditions: 'Warm with Light Showers' }
    },
    travelTips: [
      'Hire a licensed guide at Amber Fort to understand the historic context.',
      'Purchase composite tickets to save money on multi-attraction entry.',
      'Dress comfortably and wear closed shoes for fortress walks.'
    ],
    idealDuration: '3-4 days',
    safetyScore: 8.5,
    popularityScore: 92,
    isFeatured: true
  },
  {
    name: 'Alleppey',
    slug: 'alleppey',
    country: 'India',
    region: 'Kerala',
    continent: 'Asia',
    coordinates: { lat: 9.4981, lng: 76.3388 },
    shortDescription: 'The Venice of the East, famous for houseboats along peaceful palm-fringed backwaters.',
    description: 'Alleppey (Alappuzha) is a lush water-network city in Kerala, famous for its houseboat cruises that float along quiet canals and palm-bordered lagoons. Surrounded by endless green rice fields and coconut groves, Alleppey is an escape into raw tropical nature. Beyond backwater stays, it offers beautiful beaches, historic lighthouses, traditional snake boat races, and exquisite South Indian seafood cooked in authentic coconut oils.',
    highlights: ['Houseboat Backwater Cruise', 'Alappuzha Beach & Lighthouse', 'Punnamada Lake', 'Krishnapuram Palace'],
    bestTimeToVisit: {
      from: 'November',
      to: 'February',
      description: 'Pleasant winter weather with low humidity levels.'
    },
    avgBudgetPerDay: {
      budget: 2000,
      midRange: 6000,
      luxury: 22000,
      currency: 'INR'
    },
    languages: ['Malayalam', 'English', 'Hindi'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400&h=300&fit=crop'
    },
    categories: ['lake', 'beach', 'backpacking'],
    weather: {
      summer: { avgTemp: 33, conditions: 'Warm and Humid' },
      winter: { avgTemp: 26, conditions: 'Pleasant Coastal Breeze' },
      monsoon: { avgTemp: 28, conditions: 'Heavy Rains with Scenic Valleys' }
    },
    travelTips: [
      'Book houseboats in advance, especially during peak December weeks.',
      'Try Karimeen Pollichathu (pearl spot fish) in authentic local houseboats.',
      'Carry mosquito repellent as backwaters have dense insect activity.'
    ],
    idealDuration: '2-3 days',
    safetyScore: 9.0,
    popularityScore: 88,
    isFeatured: true
  },
  {
    name: 'Udaipur',
    slug: 'udaipur',
    country: 'India',
    region: 'Rajasthan',
    continent: 'Asia',
    coordinates: { lat: 24.5854, lng: 73.7125 },
    shortDescription: 'The romantic City of Lakes, decorated with majestic floating marble palaces.',
    description: 'Udaipur, the historic capital of Mewar kingdom, is a romantic oasis defined by its five primary lakes. Bordered by the high Aravalli Hills, the city features beautiful marble palaces floating on glassy waters, most notably the Lake Palace on Lake Pichola. Often called the "Venice of the East," Udaipur charms guests with narrow old streets, ancient temples, traditional puppet shows, and regal palaces.',
    highlights: ['Lake Pichola Palace', 'Udaipur City Palace', 'Sajjangarh Monsoon Palace', 'Jag Mandir', 'Fateh Sagar Lake'],
    bestTimeToVisit: {
      from: 'October',
      to: 'March',
      description: 'Ideal daytime temperatures for boat rides and walking tours.'
    },
    avgBudgetPerDay: {
      budget: 1800,
      midRange: 5500,
      luxury: 25000,
      currency: 'INR'
    },
    languages: ['Hindi', 'Mewari', 'English'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1599824410134-2839ce63681b?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1599824410134-2839ce63681b?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1599824410134-2839ce63681b?w=400&h=300&fit=crop'
    },
    categories: ['lake', 'heritage', 'hill-station'],
    weather: {
      summer: { avgTemp: 37, conditions: 'Hot and Dry' },
      winter: { avgTemp: 16, conditions: 'Chilly Nights, Warm Days' },
      monsoon: { avgTemp: 27, conditions: 'Moderate Showers, Lakes Overflow' }
    },
    travelTips: [
      'Take a sunset boat cruise on Lake Pichola for breathtaking photos.',
      'Visit the City Palace early in the morning to beat tourist crowds.',
      'Dine at lakeside rooftop restaurants to experience Udaipur nights.'
    ],
    idealDuration: '3 days',
    safetyScore: 8.8,
    popularityScore: 90,
    isFeatured: true
  },
  {
    name: 'Goa',
    slug: 'goa',
    country: 'India',
    region: 'Goa',
    continent: 'Asia',
    coordinates: { lat: 15.2993, lng: 74.1240 },
    shortDescription: 'Golden sun-kissed beaches, Portuguese-heritage churches, and vibrant party culture.',
    description: 'Goa is India\'s pocket-sized paradise, stretching along the beautiful Arabian Sea. Renowned for its spectacular beaches, vibrant nightlife, Portuguese colonial history, and seafood shacks along coastlines, it serves as a massive magnet for global backpackers, families, and luxury seekers alike. Northern Goa is famous for active water sports and party beaches, while Southern Goa offers serene, calm sandy escapes.',
    highlights: ['Baga & Calangute Beaches', 'Basilica of Bom Jesus', 'Dudhsagar Waterfalls', 'Anjuna Flea Market', 'Fontainhas Latin Quarter'],
    bestTimeToVisit: {
      from: 'November',
      to: 'February',
      description: 'Pleasant weather and peak party season.'
    },
    avgBudgetPerDay: {
      budget: 1500,
      midRange: 5000,
      luxury: 18000,
      currency: 'INR'
    },
    languages: ['Konkani', 'English', 'Marathi', 'Hindi'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop'
    },
    categories: ['beach', 'island', 'backpacking'],
    weather: {
      summer: { avgTemp: 34, conditions: 'Hot and Humid' },
      winter: { avgTemp: 24, conditions: 'Perfect Beach Temperature' },
      monsoon: { avgTemp: 27, conditions: 'Heavy Rains, Lush Greenery' }
    },
    travelTips: [
      'Rent a scooter or auto-gear bike to navigate narrow lanes easily.',
      'Explore Fontainhas on foot to admire colorful Portuguese houses.',
      'Carry cash, as beach shack vendors sometimes have poor card connectivity.'
    ],
    idealDuration: '4-5 days',
    safetyScore: 8.5,
    popularityScore: 95,
    isFeatured: true
  }
];

const mockCoupons = [
  {
    code: 'WELCOME10',
    description: 'Get 10% off on your very first booking with Journeys!',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 2000,
    maxDiscount: 1500,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2027-12-31'),
    usageLimit: 1000,
    perUserLimit: 1,
    applicableTo: ['all']
  },
  {
    code: 'JOURNEY15',
    description: 'Save 15% on flight and hotel package bundle itineraries.',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 8000,
    maxDiscount: 3000,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2027-12-31'),
    usageLimit: 500,
    perUserLimit: 1,
    applicableTo: ['hotel', 'flight', 'package']
  },
  {
    code: 'FLAT500',
    description: 'Flat ₹500 discount on booking activities or day trips.',
    discountType: 'fixed',
    discountValue: 500,
    minOrderValue: 1500,
    maxDiscount: 500,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2027-12-31'),
    usageLimit: 1000,
    perUserLimit: 2,
    applicableTo: ['activity', 'transport']
  }
];

/**
 * seedDB
 * Checks if Destination and Coupon tables are empty, and seeds them.
 */
export const seedDB = async () => {
  try {
    const destCount = await Destination.countDocuments();
    if (destCount === 0) {
      console.log('🌱 Seeding destinations data...');
      await Destination.insertMany(mockDestinations);
      console.log('✅ Destinations seeded successfully.');
    }

    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log('🌱 Seeding coupons data...');
      await Coupon.insertMany(mockCoupons);
      console.log('✅ Coupons seeded successfully.');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};
