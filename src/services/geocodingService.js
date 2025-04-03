// For a real app, you'd use an actual geocoding API
// This is a simplified version for the demo
export const geocodeAddress = async (address) => {
    // In a real app, you would call an API like Google Maps Geocoding
    // For now, return random coordinates near the actual location
    const baseCoordinates = {
      "New York": { lat: 40.7128, lng: -74.0060 },
      "Los Angeles": { lat: 34.0522, lng: -118.2437 },
      "Chicago": { lat: 41.8781, lng: -87.6298 },
      // Add more cities as needed
    };
    
    // Simple parsing to extract city
    const cityMatch = address.match(/(New York|Los Angeles|Chicago)/);
    const city = cityMatch ? cityMatch[0] : "New York"; // Default to NY if no match
    
    // Get base coordinates for the city
    const coordinates = baseCoordinates[city] || baseCoordinates["New York"];
    
    // Add slight randomness for different addresses
    return {
      lat: coordinates.lat + (Math.random() - 0.5) * 0.01,
      lng: coordinates.lng + (Math.random() - 0.5) * 0.01
    };
  };