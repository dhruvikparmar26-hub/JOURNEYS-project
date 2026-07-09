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
      hero: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1477584322902-471a53b9d133?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&h=300&fit=crop'
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
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400&h=300&fit=crop'
    },
    categories: ['lake', 'beach', 'backpacking', 'wildlife'],
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
      hero: 'https://images.unsplash.com/photo-1562280963-8a5475740a10?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1562280963-8a5475740a10?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1562280963-8a5475740a10?w=400&h=300&fit=crop'
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
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop'
    },
    categories: ['beach', 'island', 'backpacking', 'adventure'],
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
  },
  {
    name: 'Manali',
    slug: 'manali',
    country: 'India',
    region: 'Himachal Pradesh',
    continent: 'Asia',
    coordinates: { lat: 32.2396, lng: 77.1887 },
    shortDescription: 'High Himalayan peaks, lush pine forests, snowy valleys, and thrilling winter activities.',
    description: 'Manali is a high-altitude Himalayan resort town in India’s northern Himachal Pradesh state. It has a reputation as a backpacking center and honeymoon destination. Set on the Beas River, it’s a gateway for skiing in the Solang Valley and trekking in Parvati Valley. It’s also a jumping-off point for paragliding, rafting and mountaineering in the Pir Panjal mountains, home to the 4,000m-high Rohtang Pass.',
    highlights: ['Solang Valley', 'Rohtang Pass', 'Hadimba Temple', 'Jogini Waterfalls', 'Old Manali Cafes'],
    bestTimeToVisit: {
      from: 'October',
      to: 'June',
      description: 'Perfect for snow in winters and cool pleasant weather in summer months.'
    },
    avgBudgetPerDay: {
      budget: 1200,
      midRange: 4000,
      luxury: 15000,
      currency: 'INR'
    },
    languages: ['Hindi', 'Pahari', 'English'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1573140132338-765f04b2b1ff?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&h=300&fit=crop'
    },
    categories: ['mountain', 'hill-station', 'adventure'],
    weather: {
      summer: { avgTemp: 22, conditions: 'Pleasant and Cool' },
      winter: { avgTemp: 2, conditions: 'Heavy Snowfall, Cold' },
      monsoon: { avgTemp: 18, conditions: 'Landslides risk, heavy rain' }
    },
    travelTips: [
      'Carry heavy woolens if traveling between December and February.',
      'Book Solang Valley sports early to avoid long queues.',
      'Check Rohtang Pass permission guidelines online in advance.'
    ],
    idealDuration: '3-4 days',
    safetyScore: 8.7,
    popularityScore: 94,
    isFeatured: true
  },
  {
    name: 'Rishikesh',
    slug: 'rishikesh',
    country: 'India',
    region: 'Uttarakhand',
    continent: 'Asia',
    coordinates: { lat: 30.0869, lng: 78.2676 },
    shortDescription: 'The Yoga Capital of the World, offering white-water rafting, spiritual ghats, and bridges.',
    description: 'Rishikesh, located in the foothills of the Himalayas in northern India, is known as the "Yoga Capital of the World". It is a holy city nestled along the sacred Ganges river. It serves as a major hub for rafting, bungee jumping, and trekking, alongside spiritual studies and yoga retreats at the foothills of the Himalayas.',
    highlights: ['Lakshman Jhula', 'Triveni Ghat Aarti', 'Beatles Ashram', 'Shivpuri Rafting Camp', 'Neer Garh Waterfall'],
    bestTimeToVisit: {
      from: 'September',
      to: 'May',
      description: 'Ideal temperatures for river activities and yoga retreats.'
    },
    avgBudgetPerDay: {
      budget: 1000,
      midRange: 3000,
      luxury: 12000,
      currency: 'INR'
    },
    languages: ['Hindi', 'Garhwali', 'English'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1598977123418-45f04b0a2088?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1561361062-856753549c63?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop'
    },
    categories: ['adventure', 'spiritual', 'backpacking'],
    weather: {
      summer: { avgTemp: 35, conditions: 'Hot' },
      winter: { avgTemp: 15, conditions: 'Cool and Fresh' },
      monsoon: { avgTemp: 26, conditions: 'River overflows, high rain' }
    },
    travelTips: [
      'The city is vegetarian and alcohol-free by local law.',
      'Be careful of monkeys when walking on Laxman Jhula bridges.',
      'Attend the evening ganga aarti at Triveni Ghat at sunset.'
    ],
    idealDuration: '2-3 days',
    safetyScore: 9.1,
    popularityScore: 89,
    isFeatured: true
  },
  {
    name: 'Varanasi',
    slug: 'varanasi',
    country: 'India',
    region: 'Uttar Pradesh',
    continent: 'Asia',
    coordinates: { lat: 25.3176, lng: 82.9739 },
    shortDescription: 'One of the oldest continuously inhabited cities, famous for spiritual Ganga rituals.',
    description: 'Varanasi is a city on the banks of the Ganges in Uttar Pradesh, India. A major religious hub in India, it is the holiest of the seven sacred cities in Hinduism and Jainism. It is renowned for its endless ghats, ancient temples, narrow spiritual alleys, and sunset river ceremonies.',
    highlights: ['Kashi Vishwanath Temple', 'Dashashwamedh Ghat Aarti', 'Assi Ghat Sunrise', 'Sarnath Buddhist Site', 'Banarasi Silk Weaving'],
    bestTimeToVisit: {
      from: 'October',
      to: 'March',
      description: 'Pleasant winter weather is perfect for visiting ghats.'
    },
    avgBudgetPerDay: {
      budget: 900,
      midRange: 2500,
      luxury: 10000,
      currency: 'INR'
    },
    languages: ['Hindi', 'Bhojpuri', 'English'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1561361062-856753549c63?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1561361062-856753549c63?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1598977123418-45f04b0a2088?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1561361062-856753549c63?w=400&h=300&fit=crop'
    },
    categories: ['spiritual', 'heritage', 'backpacking'],
    weather: {
      summer: { avgTemp: 40, conditions: 'Extremely Hot' },
      winter: { avgTemp: 17, conditions: 'Cool and Comfortable' },
      monsoon: { avgTemp: 29, conditions: 'Humid, heavy monsoon flows' }
    },
    travelTips: [
      'Take a boat ride at sunrise to witness rituals on the ghats.',
      'Explore the ancient narrow lanes behind ghats with a guide.',
      'Try the local Banarasi Lassi and street chaat food.'
    ],
    idealDuration: '2-3 days',
    safetyScore: 8.4,
    popularityScore: 87,
    isFeatured: true
  },
  {
    name: 'Ranthambore',
    slug: 'ranthambore',
    country: 'India',
    region: 'Rajasthan',
    continent: 'Asia',
    coordinates: { lat: 25.8667, lng: 76.3000 },
    shortDescription: 'National park home to Bengal tigers, ancient fortress ruins, and dry valleys.',
    description: 'Ranthambore National Park is a vast wildlife reserve near the town of Sawai Madhopur in Rajasthan, northern India. It is a former royal hunting ground and home to Bengal tigers, leopards and marsh crocodiles. Its landmarks include the imposing 10th-century Ranthambore Fort, hilltop temples, and lake valleys.',
    highlights: ['Tiger Safari Zone 1-5', 'Ranthambore Fort Ruins', 'Padam Talao Lake', 'Raj Bagh Ruins', 'Trinetra Ganesh Temple'],
    bestTimeToVisit: {
      from: 'October',
      to: 'June',
      description: 'Forest is open. Tiger sightings peak in hot dry summer months.'
    },
    avgBudgetPerDay: {
      budget: 2000,
      midRange: 6500,
      luxury: 25000,
      currency: 'INR'
    },
    languages: ['Hindi', 'English', 'Rajasthani'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1581888227599-779811939961?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1562280963-8a5475740a10?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=400&h=300&fit=crop'
    },
    categories: ['wildlife', 'nature', 'heritage'],
    weather: {
      summer: { avgTemp: 42, conditions: 'Very Hot, sparse leaves' },
      winter: { avgTemp: 14, conditions: 'Cold Mornings, Sunny Days' },
      monsoon: { avgTemp: 28, conditions: 'Park closed during monsoon' }
    },
    travelTips: [
      'Book forest safaris 3-4 months in advance as slots are strictly limited.',
      'Carry sunglasses, sunblock, and a dust scarf for open gypsy rides.',
      'Mornings are cold in winter; dress in multiple warm layers.'
    ],
    idealDuration: '2 days',
    safetyScore: 9.0,
    popularityScore: 91,
    isFeatured: true
  },
  {
    name: 'Leh',
    slug: 'leh',
    country: 'India',
    region: 'Ladakh',
    continent: 'Asia',
    coordinates: { lat: 34.1526, lng: 77.5771 },
    shortDescription: 'Stunning high-altitude cold desert, ancient monasteries, and trekking trails.',
    description: 'Leh, the capital of Ladakh, is located in the Indian state of Jammu and Kashmir. It is a high-altitude cold desert valley situated at 3,500m. It is renowned for its Buddhist monasteries, scenic lakes like Pangong Tso, passes like Khardung La, and adventure road trips.',
    highlights: ['Pangong Tso Lake', 'Khardung La Pass', 'Thiksey Monastery', 'Magnetic Hill', 'Leh Palace'],
    bestTimeToVisit: { from: 'May', to: 'September', description: 'Warm sunny months and roads are fully open.' },
    avgBudgetPerDay: { budget: 1500, midRange: 4500, luxury: 18000, currency: 'INR' },
    languages: ['Ladakhi', 'Tibetan', 'Hindi', 'English'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1573140132338-765f04b2b1ff?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop'
    },
    categories: ['mountain', 'adventure', 'backpacking'],
    weather: {
      summer: { avgTemp: 22, conditions: 'Sunny, pleasant' },
      winter: { avgTemp: -10, conditions: 'Freezing, heavy snow' },
      monsoon: { avgTemp: 18, conditions: 'Minimal rainfall' }
    },
    travelTips: ['Spend the first 36 hours acclimatizing to the high altitude.', 'Drink plenty of water and carry pocket oxygen if needed.', 'Inner Line Permits are required to visit Pangong Tso and Nubra Valley.'],
    idealDuration: '5-6 days',
    safetyScore: 9.3,
    popularityScore: 92,
    isFeatured: true
  },
  {
    name: 'Shimla',
    slug: 'shimla',
    country: 'India',
    region: 'Himachal Pradesh',
    continent: 'Asia',
    coordinates: { lat: 31.1048, lng: 77.1734 },
    shortDescription: 'The summer capital of British India, featuring colonial heritage buildings and Mall Road.',
    description: 'Shimla is the capital of the northern Indian state of Himachal Pradesh, in the Himalayan foothills. Once the summer capital of British India, it remains the most popular hill station. It is known for its toy train, colonial architecture, and snow-filled winters.',
    highlights: ['The Ridge & Mall Road', 'Jakhoo Temple', 'Kalka-Shimla Toy Train', 'Viceregal Lodge', 'Kufri Snow Viewpoint'],
    bestTimeToVisit: { from: 'March', to: 'June', description: 'Escape the plain summer heat or enjoy snow in winter.' },
    avgBudgetPerDay: { budget: 1400, midRange: 4200, luxury: 16000, currency: 'INR' },
    languages: ['Hindi', 'Pahari', 'English'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1573140132338-765f04b2b1ff?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1573140132338-765f04b2b1ff?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1573140132338-765f04b2b1ff?w=400&h=300&fit=crop'
    },
    categories: ['mountain', 'hill-station'],
    weather: {
      summer: { avgTemp: 24, conditions: 'Mild and pleasant' },
      winter: { avgTemp: 5, conditions: 'Cold, occasional snow' },
      monsoon: { avgTemp: 19, conditions: 'High rainfall, misty green valleys' }
    },
    travelTips: ['Walk is the primary mode of transit on Mall Road; vehicles are banned.', 'Book the toy train in advance as it has high demand.', 'Keep bags zipped to prevent local monkeys from grabbing belongings.'],
    idealDuration: '3 days',
    safetyScore: 8.9,
    popularityScore: 90,
    isFeatured: true
  },
  {
    name: 'Darjeeling',
    slug: 'darjeeling',
    country: 'India',
    region: 'West Bengal',
    continent: 'Asia',
    coordinates: { lat: 27.0410, lng: 88.2627 },
    shortDescription: 'Famous for organic tea gardens, views of Mt. Kanchenjunga, and Himalayan parks.',
    description: 'Darjeeling is a town in India’s West Bengal state, in the Himalayan foothills. Once a summer resort for the British Raj elite, it remains the premier tea-growing region. It is famous for its Toy Train, views of Kanchenjunga, and rich wildlife sanctuaries.',
    highlights: ['Tiger Hill Sunrise', 'Batasia Loop', 'Padmaja Naidu Himalayan Zoo', 'Happy Valley Tea Estate', 'Ghoom Monastery'],
    bestTimeToVisit: { from: 'October', to: 'May', description: 'Clear skies for mountain views and pleasant tea harvests.' },
    avgBudgetPerDay: { budget: 1300, midRange: 3800, luxury: 15000, currency: 'INR' },
    languages: ['Nepali', 'Hindi', 'Bengali', 'English'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1573140132338-765f04b2b1ff?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop'
    },
    categories: ['mountain', 'hill-station', 'wildlife'],
    weather: {
      summer: { avgTemp: 20, conditions: 'Cool' },
      winter: { avgTemp: 6, conditions: 'Chilly' },
      monsoon: { avgTemp: 17, conditions: 'Heavy monsoon clouds, misty' }
    },
    travelTips: ['Wake up at 3:30 AM to see the sunrise over Mt. Kanchenjunga from Tiger Hill.', 'Visit the Himalayan Mountaineering Institute to see vintage gear.', 'Try authentic Tibetan momos and local organic tea.'],
    idealDuration: '3 days',
    safetyScore: 9.2,
    popularityScore: 88,
    isFeatured: true
  },
  {
    name: 'Ooty',
    slug: 'ooty',
    country: 'India',
    region: 'Tamil Nadu',
    continent: 'Asia',
    coordinates: { lat: 11.4102, lng: 76.6950 },
    shortDescription: 'The Queen of Hill Stations, featuring beautiful botanical gardens and Nilgiri toy train.',
    description: 'Ooty (Udhagamandalam) is a resort town in the Western Ghats mountains, in southern India’s Tamil Nadu state. Founded as a British Raj summer resort, it features scenic lakes, botanical gardens, and sprawling tea estates.',
    highlights: ['Ooty Lake & Boating', 'Government Botanical Garden', 'Doddabetta Peak View', 'Nilgiri Mountain Toy Train', 'Rose Garden'],
    bestTimeToVisit: { from: 'October', to: 'June', description: 'Cool refreshing mountain weather.' },
    avgBudgetPerDay: { budget: 1200, midRange: 4000, luxury: 16000, currency: 'INR' },
    languages: ['Tamil', 'Kannada', 'English', 'Hindi'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400&h=300&fit=crop'
    },
    categories: ['mountain', 'hill-station'],
    weather: {
      summer: { avgTemp: 22, conditions: 'Pleasant' },
      winter: { avgTemp: 10, conditions: 'Cold, misty' },
      monsoon: { avgTemp: 16, conditions: 'Moderate rainfall' }
    },
    travelTips: ['Take the Nilgiri Toy train ride for incredible forest scenery.', 'Shop for local homemade chocolates and eucalyptus oils.', 'Carry a light sweater even in summer months.'],
    idealDuration: '3 days',
    safetyScore: 9.3,
    popularityScore: 89,
    isFeatured: true
  },
  {
    name: 'Amritsar',
    slug: 'amritsar',
    country: 'India',
    region: 'Punjab',
    continent: 'Asia',
    coordinates: { lat: 31.6340, lng: 74.8723 },
    shortDescription: 'Home to the magnificent Golden Temple, rich cultural history, and Punjabi cuisine.',
    description: 'Amritsar is a holy city in the northwestern Indian state of Punjab, near the border with Pakistan. It is the spiritual and cultural center of the Sikh religion, famous for the gilded Harmandir Sahib (Golden Temple), Jallianwala Bagh garden, and Wagah Border ceremony.',
    highlights: ['Golden Temple (Harmandir Sahib)', 'Wagah Border Ceremony', 'Jallianwala Bagh', 'Partition Museum', 'Kesar Da Dhaba'],
    bestTimeToVisit: { from: 'October', to: 'March', description: 'Cool and pleasant winters.' },
    avgBudgetPerDay: { budget: 1100, midRange: 3500, luxury: 12000, currency: 'INR' },
    languages: ['Punjabi', 'Hindi', 'English'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=400&h=300&fit=crop'
    },
    categories: ['spiritual', 'heritage', 'city'],
    weather: {
      summer: { avgTemp: 39, conditions: 'Extremely hot' },
      winter: { avgTemp: 13, conditions: 'Cold and foggy nights, sunny days' },
      monsoon: { avgTemp: 28, conditions: 'Moderate showers' }
    },
    travelTips: ['Cover your head and remove shoes before entering the Golden Temple.', 'Enjoy the free community kitchen (Langar) that serves 100,000+ guests daily.', 'Reach Wagah Border early to secure good seats in the stands.'],
    idealDuration: '2 days',
    safetyScore: 9.0,
    popularityScore: 91,
    isFeatured: true
  },
  {
    name: 'Bali',
    slug: 'bali',
    country: 'Indonesia',
    region: 'Bali Province',
    continent: 'Asia',
    coordinates: { lat: -8.4095, lng: 115.1889 },
    shortDescription: 'Tropical paradise featuring pristine beaches, terraced rice fields, and temples.',
    description: 'Bali is a province of Indonesia and the westernmost of the Lesser Sunda Islands. Renowned for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs, the island is home to religious sites such as cliffside Uluwatu Temple.',
    highlights: ['Ubud Monkey Forest', 'Uluwatu Cliff Temple', 'Tegallalang Rice Terraces', 'Seminyak Beach', 'Mount Batur Sunrise Trek'],
    bestTimeToVisit: { from: 'April', to: 'October', description: 'Dry season with cool breezes, perfect for beaches and hiking.' },
    avgBudgetPerDay: { budget: 1800, midRange: 6000, luxury: 25000, currency: 'INR' },
    languages: ['Indonesian', 'Balinese', 'English'],
    currency: 'IDR',
    timezone: 'Asia/Makassar',
    images: {
      hero: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop'
    },
    categories: ['beach', 'adventure', 'wildlife', 'spiritual'],
    weather: {
      summer: { avgTemp: 29, conditions: 'Warm, dry and breezy' },
      winter: { avgTemp: 26, conditions: 'Tropical showers, humid' },
      monsoon: { avgTemp: 27, conditions: 'Wet season' }
    },
    travelTips: ['Dress respectfully with a sarong when entering any Balinese temple.', 'Rent a scooter to bypass busy tourist traffic in Seminyak and Ubud.', 'Try local dishes like Nasi Goreng, Babi Guling, and fresh young coconuts.'],
    idealDuration: '5-7 days',
    safetyScore: 8.8,
    popularityScore: 96,
    isFeatured: true
  },
  {
    name: 'Phuket',
    slug: 'phuket',
    country: 'Thailand',
    region: 'Phuket Province',
    continent: 'Asia',
    coordinates: { lat: 7.8804, lng: 98.3922 },
    shortDescription: 'Thailand\'s largest island, boasting white sandy beaches, limestone cliffs, and nightlife.',
    description: 'Phuket, a rainforested, mountainous island in the Andaman Sea, has some of Thailand’s most popular beaches, mostly situated along the clear waters of the western shore. The island is home to many high-end seaside resorts, spas and restaurants.',
    highlights: ['Patong Beach Nightlife', 'Phi Phi Islands Day Trip', 'Big Buddha Statue', 'Phuket Old Town', 'Karon Viewpoint'],
    bestTimeToVisit: { from: 'November', to: 'April', description: 'Dry season, calm seas, ideal for swimming and snorkeling.' },
    avgBudgetPerDay: { budget: 1600, midRange: 5500, luxury: 22000, currency: 'INR' },
    languages: ['Thai', 'English'],
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    images: {
      hero: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400&h=300&fit=crop'
    },
    categories: ['beach', 'adventure', 'island'],
    weather: {
      summer: { avgTemp: 32, conditions: 'Hot and sunny' },
      winter: { avgTemp: 28, conditions: 'Warm, pleasant sea breeze' },
      monsoon: { avgTemp: 29, conditions: 'Monsoon rainfall, high waves' }
    },
    travelTips: ['Take longtail boats or speedboats to explore the surrounding islands.', 'Negotiate taxi and tuk-tuk rates beforehand to avoid overpaying.', 'Try local southern Thai food and fresh grilled seafood at night markets.'],
    idealDuration: '4 days',
    safetyScore: 8.6,
    popularityScore: 94,
    isFeatured: true
  },
  {
    name: 'Amalfi Coast',
    slug: 'amalfi-coast',
    country: 'Italy',
    region: 'Campancy',
    continent: 'Europe',
    coordinates: { lat: 40.6331, lng: 14.6029 },
    shortDescription: 'Magnificent vertical towns, turquoise waters, and terraced lemon groves along cliffs.',
    description: 'The Amalfi Coast is a 50-kilometer stretch of coastline along the southern edge of Italy’s Sorrentine Peninsula. It is a highly popular holiday destination, famous for its sheer cliffs, rugged shoreline dotted with small beaches, and pastel-colored fishing villages.',
    highlights: ['Positano Vertical Town', 'Amalfi Cathedral', 'Ravello Hilltop Gardens', 'Path of the Gods Trek', 'Grotta dello Smeraldo'],
    bestTimeToVisit: { from: 'May', to: 'September', description: 'Excellent weather for swimming and dining on outdoor terraces.' },
    avgBudgetPerDay: { budget: 4000, midRange: 12000, luxury: 45000, currency: 'EUR' },
    languages: ['Italian', 'English'],
    currency: 'EUR',
    timezone: 'Europe/Rome',
    images: {
      hero: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&h=300&fit=crop'
    },
    categories: ['beach', 'island', 'heritage'],
    weather: {
      summer: { avgTemp: 28, conditions: 'Hot, dry and sunny' },
      winter: { avgTemp: 12, conditions: 'Cool and rainy' },
      monsoon: { avgTemp: 18, conditions: 'Misty autumn days' }
    },
    travelTips: ['Use local SITA buses or ferries to travel between villages; parking is rare.', 'Wear good walking shoes, Positano is composed of steep steps.', 'Try local Limoncello and fresh hand-made seafood pasta.'],
    idealDuration: '4 days',
    safetyScore: 9.4,
    popularityScore: 95,
    isFeatured: true
  },
  {
    name: 'Maldives',
    slug: 'maldives',
    country: 'Maldives',
    region: 'Maldives',
    continent: 'Asia',
    coordinates: { lat: 3.2028, lng: 73.2207 },
    shortDescription: 'Ultimate luxury island retreat, featuring overwater villas, crystal lagoons, and reefs.',
    description: 'The Maldives is a tropical nation in the Indian Ocean composed of 26 ring-shaped atolls, which are made up of more than 1,000 coral islands. It’s known for its beaches, blue lagoons and extensive reefs.',
    highlights: ['Overwater Bungalow Stay', 'Coral Reef Snorkeling', 'Sunset Dolphin Cruise', 'Private Sandbank Dining', 'Male Old Friday Mosque'],
    bestTimeToVisit: { from: 'November', to: 'April', description: 'Sunny days, low humidity, perfect for water activities.' },
    avgBudgetPerDay: { budget: 4500, midRange: 15000, luxury: 60000, currency: 'USD' },
    languages: ['Dhivehi', 'English'],
    currency: 'MVR',
    timezone: 'Indian/Maldives',
    images: {
      hero: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop'
    },
    categories: ['beach', 'island'],
    weather: {
      summer: { avgTemp: 31, conditions: 'Sunny and warm' },
      winter: { avgTemp: 28, conditions: 'Pleasant tropical warmth' },
      monsoon: { avgTemp: 29, conditions: 'Wet season showers, humid' }
    },
    travelTips: ['Pack light, lightweight cotton fabrics are best for the climate.', 'Alcohol import is illegal; it is only served at private resort islands.', 'Bring reef-safe sunscreen to help protect the fragile marine ecosystem.'],
    idealDuration: '4-5 days',
    safetyScore: 9.6,
    popularityScore: 93,
    isFeatured: true
  },
  {
    name: 'Kyoto',
    slug: 'kyoto',
    country: 'Japan',
    region: 'Kansai',
    continent: 'Asia',
    coordinates: { lat: 35.0116, lng: 135.7681 },
    shortDescription: 'Historic center of Japan, boasting thousands of classical temples, gardens, and shrines.',
    description: 'Kyoto, once the capital of Japan, is a city on the island of Honshu. It is famous for its numerous classical Buddhist temples, gardens, imperial palaces, Shinto shrines and traditional wooden houses.',
    highlights: ['Fushimi Inari Torii Gates', 'Kinkaku-ji (Golden Pavilion)', 'Arashiyama Bamboo Grove', 'Gion Geisha District', 'Kiyomizu-dera Temple'],
    bestTimeToVisit: { from: 'October', to: 'May', description: 'Incredible autumn leaves and cherry blossom (Sakura) season.' },
    avgBudgetPerDay: { budget: 2000, midRange: 6000, luxury: 22000, currency: 'JPY' },
    languages: ['Japanese', 'English'],
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    images: {
      hero: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1490761902485-a7f51f2a0f8e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop'
    },
    categories: ['heritage', 'spiritual', 'city'],
    weather: {
      summer: { avgTemp: 31, conditions: 'Hot and humid' },
      winter: { avgTemp: 6, conditions: 'Cold, occasional light snow' },
      monsoon: { avgTemp: 22, conditions: 'Rainy season in June/July' }
    },
    travelTips: ['Rent a bicycle to explore the flat streets and temples easily.', 'Purchase a ICOCA card for seamless travel on local subways and buses.', 'Reserve popular temple visits and geisha walking tours in advance.'],
    idealDuration: '3-4 days',
    safetyScore: 9.8,
    popularityScore: 95,
    isFeatured: true
  },
  {
    name: 'Rome',
    slug: 'rome',
    country: 'Italy',
    region: 'Lazio',
    continent: 'Europe',
    coordinates: { lat: 41.9028, lng: 12.4964 },
    shortDescription: 'The Eternal City, home to ancient Colosseum ruins, Vatican City, and fountains.',
    description: 'Rome, Italy’s capital, is a sprawling, cosmopolitan city with nearly 3,000 years of globally influential art, architecture and culture on display. Ancient ruins such as the Forum and the Colosseum evoke the power of the former Roman Empire.',
    highlights: ['The Colosseum & Forum', 'Vatican Museums & Sistine Chapel', 'Trevi Fountain', 'Pantheon Temple', 'Piazza Navona'],
    bestTimeToVisit: { from: 'April', to: 'October', description: 'Excellent sightseeing weather, sunny days.' },
    avgBudgetPerDay: { budget: 3000, midRange: 8000, luxury: 30000, currency: 'EUR' },
    languages: ['Italian', 'English'],
    currency: 'EUR',
    timezone: 'Europe/Rome',
    images: {
      hero: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1529260839382-3f772f26fe75?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop'
    },
    categories: ['heritage', 'city'],
    weather: {
      summer: { avgTemp: 31, conditions: 'Hot and dry' },
      winter: { avgTemp: 10, conditions: 'Cool, light showers' },
      monsoon: { avgTemp: 16, conditions: 'Misty autumn days' }
    },
    travelTips: ['Purchase tickets for Vatican and Colosseum online weeks in advance.', 'Drink free, cold water from the historic public street fountains (Nasoni).', 'Dress code is strictly enforced at Vatican: cover shoulders and knees.'],
    idealDuration: '3-4 days',
    safetyScore: 8.8,
    popularityScore: 96,
    isFeatured: true
  },
  {
    name: 'Zurich',
    slug: 'zurich',
    country: 'Switzerland',
    region: 'Zurich Canton',
    continent: 'Europe',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    shortDescription: 'Premium lakeside city offering scenic Alpine train rides and chocolate boutiques.',
    description: 'The city of Zurich, a global center for banking and finance, lies at the north end of Lake Zurich in northern Switzerland. The picturesque lanes of the central Altstadt (Old Town), on either side of the Limmat River, reflect its pre-medieval history.',
    highlights: ['Lake Zurich Boat Cruise', 'Altstadt (Old Town)', 'Uetliberg Mountain Viewpoint', 'Bahnhofstrasse Shopping', 'Swiss National Museum'],
    bestTimeToVisit: { from: 'June', to: 'September', description: 'Sunny warm weather, ideal for lake swimming and Alpine trekking.' },
    avgBudgetPerDay: { budget: 4500, midRange: 15000, luxury: 50000, currency: 'CHF' },
    languages: ['German', 'Swiss German', 'English', 'French'],
    currency: 'CHF',
    timezone: 'Europe/Zurich',
    images: {
      hero: 'https://images.unsplash.com/photo-1515488042222-779811939961?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1515488042222-779811939961?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1527668752968-14dc70a27453?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1489447068241-b3490214e879?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1515488042222-779811939961?w=400&h=300&fit=crop'
    },
    categories: ['mountain', 'city'],
    weather: {
      summer: { avgTemp: 24, conditions: 'Warm and sunny' },
      winter: { avgTemp: 1, conditions: 'Cold, frequent snow' },
      monsoon: { avgTemp: 14, conditions: 'Wet spring days' }
    },
    travelTips: ['Purchase a Swiss Travel Pass for unlimited rides on trains, buses, and boats.', 'Zurich public transport is 100% punctual; do not be late.', 'Try traditional cheese fondue and Swiss chocolates.'],
    idealDuration: '2-3 days',
    safetyScore: 9.9,
    popularityScore: 90,
    isFeatured: true
  },
  {
    name: 'Kaziranga',
    slug: 'kaziranga',
    country: 'India',
    region: 'Assam',
    continent: 'Asia',
    coordinates: { lat: 26.5800, lng: 93.1700 },
    shortDescription: 'World Heritage park home to the magnificent one-horned rhinoceros.',
    description: 'Kaziranga National Park is a protected area in the northeast Indian state of Assam. Spread across the floodplains of the Brahmaputra River, its forests, wetlands and grasslands are home to two-thirds of the world\'s great one-horned rhinoceroses.',
    highlights: ['Elephant Safari Ride', 'Jeep Forest Tour', 'Orchid Biodiversity Park', 'Brahmaputra River Dolphin Sightings'],
    bestTimeToVisit: { from: 'November', to: 'April', description: 'Park is open, dry season, excellent for spotting rhinos.' },
    avgBudgetPerDay: { budget: 1500, midRange: 4500, luxury: 18000, currency: 'INR' },
    languages: ['Assamese', 'Bengali', 'Hindi', 'English'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1581888227599-779811939961?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=400&h=300&fit=crop'
    },
    categories: ['wildlife', 'nature'],
    weather: {
      summer: { avgTemp: 32, conditions: 'Hot and humid' },
      winter: { avgTemp: 16, conditions: 'Cool, misty mornings' },
      monsoon: { avgTemp: 28, conditions: 'Park closed due to heavy floods' }
    },
    travelTips: ['Take the early morning elephant safari for the closest view of rhinos in the mist.', 'Wear neutral olive or brown colors during safaris to blend with nature.', 'Observe migratory birds at the wetlands.'],
    idealDuration: '2 days',
    safetyScore: 9.2,
    popularityScore: 89,
    isFeatured: true
  },
  {
    name: 'Jim Corbett',
    slug: 'jim-corbett',
    country: 'India',
    region: 'Uttarakhand',
    continent: 'Asia',
    coordinates: { lat: 29.5300, lng: 78.7747 },
    shortDescription: 'India\'s oldest national park, offering tiger safaris, river rafting, and dense forest camp stays.',
    description: 'Jim Corbett National Park is a forested wildlife sanctuary in northern India’s Uttarakhand State. Rich in flora and fauna, it’s known for its Bengal tigers. Wildlife, including tigers, leopards and wild elephants, roam the Dhikala zone. It also offers river rafting and jungle trekking.',
    highlights: ['Dhikala Zone Safari', 'Corbett Waterfall', 'Garjiya Devi Temple', 'Kosi River Rafting', 'Jungle Lodge Camp'],
    bestTimeToVisit: { from: 'November', to: 'May', description: 'Dhikala zone is open, dry winter days.' },
    avgBudgetPerDay: { budget: 1600, midRange: 5000, luxury: 20000, currency: 'INR' },
    languages: ['Hindi', 'Kumaoni', 'English'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1581888227599-779811939961?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1598977123418-45f04b0a2088?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1561361062-856753549c63?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=400&h=300&fit=crop'
    },
    categories: ['wildlife', 'nature', 'adventure'],
    weather: {
      summer: { avgTemp: 38, conditions: 'Hot' },
      winter: { avgTemp: 14, conditions: 'Cold nights, warm days' },
      monsoon: { avgTemp: 28, conditions: 'High rainfall, zones closed' }
    },
    travelTips: ['Book your safari stay in Dhikala forest rest house months in advance.', 'Keep a flashlight and wear insect repellents during forest stays.', 'Avoid taking food items near the open jeep zones.'],
    idealDuration: '2 days',
    safetyScore: 9.0,
    popularityScore: 90,
    isFeatured: true
  },
  // --- NEW LAKE & ISLAND PLACES ADDED TO GUARANTEE 5+ PER CATEGORY ---
  {
    name: 'Srinagar',
    slug: 'srinagar',
    country: 'India',
    region: 'Jammu & Kashmir',
    continent: 'Asia',
    coordinates: { lat: 34.0837, lng: 74.7973 },
    shortDescription: 'The beautiful summer capital of Kashmir, famous for classic houseboats and serene Dal Lake.',
    description: 'Srinagar is the summer capital of Jammu and Kashmir, India. Lying in the Kashmir Valley on the banks of the Jhelum River, it is famous for its serene houseboats, stunning Mughal gardens, pristine lakes (like Dal Lake and Nigeen Lake), and traditional Kashmiri handicrafts like Pashmina shawls and hand-woven carpets.',
    highlights: ['Dal Lake Houseboat Stay', 'Shalimar Bagh Mughal Garden', 'Shikara Ride at Sunrise', 'Nishat Bagh Garden', 'Shankaracharya Temple'],
    bestTimeToVisit: {
      from: 'April',
      to: 'October',
      description: 'Pleasant spring and summer weather is perfect for shikaras.'
    },
    avgBudgetPerDay: {
      budget: 1200,
      midRange: 3500,
      luxury: 14000,
      currency: 'INR'
    },
    languages: ['Kashmiri', 'Hindi', 'Urdu', 'English'],
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    images: {
      hero: 'https://images.unsplash.com/photo-1598977123418-45f04b0a2088?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1598977123418-45f04b0a2088?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1561361062-856753549c63?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1598977123418-45f04b0a2088?w=400&h=300&fit=crop'
    },
    categories: ['lake', 'hill-station', 'backpacking'],
    weather: {
      summer: { avgTemp: 28, conditions: 'Warm and sunny' },
      winter: { avgTemp: 4, conditions: 'Cold, snowy' },
      monsoon: { avgTemp: 21, conditions: 'Light showers' }
    },
    travelTips: [
      'Stay at least one night in a classic wooden houseboat on Dal Lake.',
      'Take a Shikara boat ride early in the morning to see the floating vegetable market.',
      'Always purchase authentic Pashmina wool with a government-authorized stamp.'
    ],
    idealDuration: '3-4 days',
    safetyScore: 8.2,
    popularityScore: 89,
    isFeatured: true
  },
  {
    name: 'Lake Como',
    slug: 'lake-como',
    country: 'Italy',
    region: 'Lombardy',
    continent: 'Europe',
    coordinates: { lat: 46.0160, lng: 9.2662 },
    shortDescription: 'Glamorous and scenic Italian lake retreat at the foot of the Alps, surrounded by historic villas.',
    description: 'Lake Como, in Northern Italy’s Lombardy region, is an upscale resort area known for its dramatic alpine scenery and pristine waters. The lake is shaped like an inverted "Y", with picturesque villages like Bellagio, Varenna, and Menaggio dotted along its shores. It is famous for its grand Renaissance villas, beautiful botanical gardens, and scenic boat tours.',
    highlights: ['Villa del Balbianello', 'Bellagio Waterfront Promenade', 'Varenna Old Town Alleys', 'Villa Carlotta Gardens', 'Como Cathedral'],
    bestTimeToVisit: {
      from: 'April',
      to: 'October',
      description: 'Lush spring gardens and warm summer breezes make it perfect.'
    },
    avgBudgetPerDay: {
      budget: 3500,
      midRange: 9000,
      luxury: 35000,
      currency: 'EUR'
    },
    languages: ['Italian', 'English'],
    currency: 'EUR',
    timezone: 'Europe/Rome',
    images: {
      hero: 'https://images.unsplash.com/photo-1527668752968-14dc70a27453?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1527668752968-14dc70a27453?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1489447068241-b3490214e879?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1515488042222-779811939961?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1527668752968-14dc70a27453?w=400&h=300&fit=crop'
    },
    categories: ['lake', 'heritage', 'mountain'],
    weather: {
      summer: { avgTemp: 26, conditions: 'Warm, sunny' },
      winter: { avgTemp: 6, conditions: 'Cold, foggy' },
      monsoon: { avgTemp: 14, conditions: 'Misty autumn showers' }
    },
    travelTips: [
      'Use the passenger ferries to hop between villages easily.',
      'Book Villa del Balbianello garden entry tickets weeks in advance.',
      'Dine on the lakeside terrace in Varenna at sunset.'
    ],
    idealDuration: '3 days',
    safetyScore: 9.5,
    popularityScore: 92,
    isFeatured: true
  },
  {
    name: 'Queenstown',
    slug: 'queenstown',
    country: 'New Zealand',
    region: 'Otago',
    continent: 'Oceania',
    coordinates: { lat: -45.0312, lng: 168.6626 },
    shortDescription: 'The adventure capital on Lake Wakatipu, backed by the dramatic Remarkables mountain range.',
    description: 'Queenstown, New Zealand, sits on the shores of Lake Wakatipu, framed by the rugged Remarkables mountains. Renowned as the "Adventure Capital of the World," it is the birthplace of commercial bungy jumping and offers jet boating, white-water rafting, skydiving, and world-class skiing. The town also features cozy lakefront dining, local Pinot Noir wines, and alpine hikes.',
    highlights: ['Shotover Jet Boat Ride', 'Skyline Gondola & Luge', 'TSS Earnslaw Lake Wakatipu Cruise', 'Bungy Jump at Kawarau Bridge', 'Remarkables Ski Fields'],
    bestTimeToVisit: {
      from: 'December',
      to: 'August',
      description: 'December-Feb is warm for lakes, June-August is peak ski season.'
    },
    avgBudgetPerDay: {
      budget: 4000,
      midRange: 12000,
      luxury: 40000,
      currency: 'NZD'
    },
    languages: ['English', 'Maori'],
    currency: 'NZD',
    timezone: 'Pacific/Auckland',
    images: {
      hero: 'https://images.unsplash.com/photo-1489447068241-b3490214e879?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1489447068241-b3490214e879?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1527668752968-14dc70a27453?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1515488042222-779811939961?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1489447068241-b3490214e879?w=400&h=300&fit=crop'
    },
    categories: ['lake', 'mountain', 'adventure'],
    weather: {
      summer: { avgTemp: 22, conditions: 'Mild, warm' },
      winter: { avgTemp: 4, conditions: 'Cold, snowy peaks' },
      monsoon: { avgTemp: 12, conditions: 'Cool, crisp days' }
    },
    travelTips: [
      'Order a Fergburger online beforehand to bypass the long queues.',
      'Acquire a rental car to explore the beautiful scenic road to Glenorchy.',
      'Carry layers, as alpine weather can shift rapidly.'
    ],
    idealDuration: '4-5 days',
    safetyScore: 9.8,
    popularityScore: 93,
    isFeatured: true
  },
  {
    name: 'Santorini',
    slug: 'santorini',
    country: 'Greece',
    region: 'Cyclades',
    continent: 'Europe',
    coordinates: { lat: 36.3932, lng: 25.4615 },
    shortDescription: 'Iconic volcanic island, famous for whitewashed Oia cliff houses and blue-domed churches.',
    description: 'Santorini is one of the Cyclades islands in the Aegean Sea. Formed by a massive volcanic eruption, the island is famous for its dramatic caldera, cliff-clinging whitewashed villages like Oia and Fira, volcanic sand beaches (red and black), and spectacular sunset vistas.',
    highlights: ['Oia Sunset Castle View', 'Caldera Cliff Walk (Fira to Oia)', 'Volcanic Red Beach', 'Akrotiri Prehistoric City', 'Aegean Sunset Cruise'],
    bestTimeToVisit: {
      from: 'May', to: 'October', description: 'Warm and sunny months perfect for cruises and beach exploration.'
    },
    avgBudgetPerDay: {
      budget: 3500,
      midRange: 11000,
      luxury: 45000,
      currency: 'EUR'
    },
    languages: ['Greek', 'English'],
    currency: 'EUR',
    timezone: 'Europe/Athens',
    images: {
      hero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop'
    },
    categories: ['island', 'beach', 'heritage'],
    weather: {
      summer: { avgTemp: 29, conditions: 'Hot, dry and sunny' },
      winter: { avgTemp: 12, conditions: 'Cool, mild' },
      monsoon: { avgTemp: 17, conditions: 'Breezy autumn days' }
    },
    travelTips: [
      'Arrive in Oia 2 hours early to get a sunset spot without crowds.',
      'Rent a quad bike/scooter to explore the black sand beaches of Perissa and Kamari.',
      'Try local volcanic white wines like Assyrtiko.'
    ],
    idealDuration: '3-4 days',
    safetyScore: 9.3,
    popularityScore: 96,
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
    const couponCount = await Coupon.countDocuments();

    if (process.env.NODE_ENV === 'production' && destCount > 0 && couponCount > 0) {
      console.log('🌱 Database already seeded. Skipping collections cleanup.');
      return;
    }

    // Drop existing destinations and coupons to ensure all category entries exist
    console.log('🌱 Cleaning and seeding database collections...');
    await Destination.deleteMany({});
    await Destination.insertMany(mockDestinations);
    console.log('✅ Destinations seeded successfully.');

    await Coupon.deleteMany({});
    await Coupon.insertMany(mockCoupons);
    console.log('✅ Coupons seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};
