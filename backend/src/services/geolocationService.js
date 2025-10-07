const axios = require('axios');

class GeolocationService {
  /**
   * Detect customer location from IP address
   * Uses ipapi.co free API (1000 requests/day)
   */
  static async detectLocationFromIP(ipAddress) {
    try {
      // Handle localhost/development
      if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('::ffff:127')) {
        console.log('🌍 Local IP detected, returning default location');
        return {
          success: true,
          location: {
            ip: ipAddress,
            city: 'Local',
            region: 'Development',
            country: 'IN',
            latitude: 28.6139, // Delhi coordinates as default
            longitude: 77.2090,
            timezone: 'Asia/Kolkata'
          },
          source: 'default'
        };
      }

      console.log(`🌍 Detecting location for IP: ${ipAddress}`);

      const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`, {
        timeout: 5000
      });

      if (response.data && response.data.city) {
        console.log(`✅ Location detected: ${response.data.city}, ${response.data.region}`);
        return {
          success: true,
          location: {
            ip: response.data.ip,
            city: response.data.city,
            region: response.data.region,
            country: response.data.country_code,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            timezone: response.data.timezone
          },
          source: 'ipapi'
        };
      } else {
        throw new Error('Invalid response from geolocation service');
      }
    } catch (error) {
      console.error('❌ Error detecting location:', error.message);
      
      // Return default location (Delhi) on error
      return {
        success: false,
        location: {
          ip: ipAddress,
          city: 'Delhi',
          region: 'Delhi',
          country: 'IN',
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: 'Asia/Kolkata'
        },
        source: 'fallback',
        error: error.message
      };
    }
  }

  /**
   * Match detected city to Shopify location
   * Returns the closest matching Shopify location ID
   */
  static matchCityToShopifyLocation(detectedCity, shopifyLocations) {
    if (!shopifyLocations || shopifyLocations.length === 0) {
      return null;
    }

    // Normalize city name for comparison
    const normalizedCity = detectedCity.toLowerCase().trim();

    // Try exact match first
    const exactMatch = shopifyLocations.find(
      loc => loc.city && loc.city.toLowerCase() === normalizedCity
    );

    if (exactMatch) {
      console.log(`✅ Exact location match: ${exactMatch.name} (${exactMatch.city})`);
      return exactMatch.id;
    }

    // Try partial match (e.g., "New Delhi" matches "Delhi")
    const partialMatch = shopifyLocations.find(
      loc => loc.city && 
        (loc.city.toLowerCase().includes(normalizedCity) || 
         normalizedCity.includes(loc.city.toLowerCase()))
    );

    if (partialMatch) {
      console.log(`✅ Partial location match: ${partialMatch.name} (${partialMatch.city})`);
      return partialMatch.id;
    }

    // No match found, return first location as default
    console.log(`⚠️  No location match for "${detectedCity}", using default: ${shopifyLocations[0].name}`);
    return shopifyLocations[0].id;
  }
}

module.exports = GeolocationService;
