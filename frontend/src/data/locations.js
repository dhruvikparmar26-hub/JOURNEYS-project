// ─── Searchable Autocomplete Locations & Helpers ───
export const LOCATIONS = [
  // India (25 options)
  { label: "Delhi, India", lat: 28.6139, lng: 77.2090, country: "India" },
  { label: "Mumbai, India", lat: 19.0760, lng: 72.8777, country: "India" },
  { label: "Bangalore, India", lat: 12.9716, lng: 77.5946, country: "India" },
  { label: "Kolkata, India", lat: 22.5726, lng: 88.3639, country: "India" },
  { label: "Chennai, India", lat: 13.0827, lng: 80.2707, country: "India" },
  { label: "Goa, India", lat: 15.2993, lng: 74.1240, country: "India" },
  { label: "Jaipur, India", lat: 26.9124, lng: 75.7873, country: "India" },
  { label: "Udaipur, India", lat: 24.5854, lng: 73.7125, country: "India" },
  { label: "Agra, India", lat: 27.1767, lng: 78.0081, country: "India" },
  { label: "Kochi, India", lat: 9.9312, lng: 76.2673, country: "India" },
  { label: "Manali, India", lat: 32.2396, lng: 77.1887, country: "India" },
  { label: "Shimla, India", lat: 31.1048, lng: 77.1734, country: "India" },
  { label: "Hyderabad, India", lat: 17.3850, lng: 78.4867, country: "India" },
  { label: "Pune, India", lat: 18.5204, lng: 73.8567, country: "India" },
  { label: "Ahmedabad, India", lat: 23.0225, lng: 72.5714, country: "India" },
  { label: "Srinagar, India", lat: 34.0837, lng: 74.7973, country: "India" },
  { label: "Leh, India", lat: 34.1526, lng: 77.5771, country: "India" },
  { label: "Darjeeling, India", lat: 27.0410, lng: 88.2627, country: "India" },
  { label: "Ooty, India", lat: 11.4102, lng: 76.6950, country: "India" },
  { label: "Varanasi, India", lat: 25.3176, lng: 82.9739, country: "India" },
  { label: "Amritsar, India", lat: 31.6340, lng: 74.8723, country: "India" },
  { label: "Jaisalmer, India", lat: 26.9157, lng: 70.9083, country: "India" },
  { label: "Rishikesh, India", lat: 30.0869, lng: 78.2676, country: "India" },
  { label: "Mysore, India", lat: 12.2958, lng: 76.6394, country: "India" },
  { label: "Pondicherry, India", lat: 11.9416, lng: 79.8083, country: "India" },

  // Asia (15 options)
  { label: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, country: "Japan" },
  { label: "Kyoto, Japan", lat: 35.0116, lng: 135.7681, country: "Japan" },
  { label: "Singapore", lat: 1.3521, lng: 103.8198, country: "Singapore" },
  { label: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018, country: "Thailand" },
  { label: "Phuket, Thailand", lat: 7.8804, lng: 98.3922, country: "Thailand" },
  { label: "Bali, Indonesia", lat: -8.4095, lng: 115.1889, country: "Indonesia" },
  { label: "Kuala Lumpur, Malaysia", lat: 3.1390, lng: 101.6869, country: "Malaysia" },
  { label: "Seoul, South Korea", lat: 37.5665, lng: 126.9780, country: "South Korea" },
  { label: "Hanoi, Vietnam", lat: 21.0285, lng: 105.8542, country: "Vietnam" },
  { label: "Ho Chi Minh City, Vietnam", lat: 10.8231, lng: 106.6297, country: "Vietnam" },
  { label: "Male, Maldives", lat: 4.1755, lng: 73.5093, country: "Maldives" },
  { label: "Colombo, Sri Lanka", lat: 6.9271, lng: 79.8612, country: "Sri Lanka" },
  { label: "Kathmandu, Nepal", lat: 27.7172, lng: 85.3240, country: "Nepal" },
  { label: "Dubai, UAE", lat: 25.2048, lng: 55.2708, country: "UAE" },
  { label: "Hong Kong", lat: 22.3193, lng: 114.1694, country: "Hong Kong" },

  // Europe & Rest of World (15 options)
  { label: "Amalfi Coast, Italy", lat: 40.6331, lng: 14.6029, country: "Italy" },
  { label: "Rome, Italy", lat: 41.9028, lng: 12.4964, country: "Italy" },
  { label: "Venice, Italy", lat: 45.4408, lng: 12.3155, country: "Italy" },
  { label: "Paris, France", lat: 48.8566, lng: 2.3522, country: "France" },
  { label: "London, UK", lat: 51.5074, lng: -0.1278, country: "UK" },
  { label: "Barcelona, Spain", lat: 41.3851, lng: 2.1734, country: "Spain" },
  { label: "Madrid, Spain", lat: 40.4168, lng: -3.7038, country: "Spain" },
  { label: "Amsterdam, Netherlands", lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  { label: "Zurich, Switzerland", lat: 47.3769, lng: 8.5417, country: "Switzerland" },
  { label: "Reykjavik, Iceland", lat: 64.1466, lng: -21.9426, country: "Iceland" },
  { label: "New York, USA", lat: 40.7128, lng: -74.0060, country: "USA" },
  { label: "San Francisco, USA", lat: 37.7749, lng: -122.4194, country: "USA" },
  { label: "Sydney, Australia", lat: -33.8688, lng: 151.2093, country: "Australia" },
  { label: "Cairo, Egypt", lat: 30.0444, lng: 31.2357, country: "Egypt" },
  { label: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241, country: "South Africa" }
];

export const findLocationInfo = (text) => {
  if (!text) return null;
  const t = text.toLowerCase().trim();
  const match = LOCATIONS.find(loc => loc.label.toLowerCase().includes(t) || t.includes(loc.label.toLowerCase()));
  if (match) return match;

  const countries = ["india", "japan", "usa", "italy", "france", "uk", "australia", "egypt", "south africa", "singapore", "thailand", "indonesia", "malaysia", "south korea", "vietnam", "maldives", "nepal", "uae"];
  const countryCoords = {
    "india": { lat: 20.5937, lng: 78.9629, country: "India" },
    "japan": { lat: 36.2048, lng: 138.2529, country: "Japan" },
    "usa": { lat: 37.0902, lng: -95.7129, country: "USA" },
    "italy": { lat: 41.8719, lng: 12.5674, country: "Italy" },
    "france": { lat: 46.2276, lng: 2.2137, country: "France" },
    "uk": { lat: 55.3781, lng: -3.4360, country: "UK" },
    "australia": { lat: -25.2744, lng: 133.7751, country: "Australia" },
    "egypt": { lat: 26.8206, lng: 30.8025, country: "Egypt" },
    "south africa": { lat: -30.5595, lng: 22.9375, country: "South Africa" },
    "singapore": { lat: 1.3521, lng: 103.8198, country: "Singapore" },
    "thailand": { lat: 15.8700, lng: 100.9925, country: "Thailand" },
    "indonesia": { lat: -0.7893, lng: 113.9213, country: "Indonesia" },
    "malaysia": { lat: 4.2105, lng: 101.9758, country: "Malaysia" },
    "south korea": { lat: 35.9078, lng: 127.7669, country: "South Korea" },
    "vietnam": { lat: 14.0583, lng: 108.2772, country: "Vietnam" },
    "maldives": { lat: 3.2028, lng: 73.2207, country: "Maldives" },
    "nepal": { lat: 28.3949, lng: 84.1240, country: "Nepal" },
    "uae": { lat: 23.4241, lng: 53.8478, country: "UAE" }
  };

  for (const c of countries) {
    if (t.includes(c)) {
      return countryCoords[c];
    }
  }
  return { lat: 20.5937, lng: 78.9629, country: "India" };
};
