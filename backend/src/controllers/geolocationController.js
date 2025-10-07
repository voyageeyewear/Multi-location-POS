const GeolocationService = require('../services/geolocationService');
const shopifyService = require('../services/shopifyService');

class GeolocationController {
  /**
   * Detect customer location from their IP address
   * and return matching Shopify location ID
   */
  static async detectLocation(req, res, next) {
    try {
      // Get client IP address
      const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.headers['x-real-ip'] || 
                      req.connection.remoteAddress ||
                      req.socket.remoteAddress;

      console.log(`🌍 Detecting location for IP: ${clientIP}`);

      // Detect location from IP
      const locationResult = await GeolocationService.detectLocationFromIP(clientIP);

      // Fetch Shopify locations
      const shopifyResult = await shopifyService.getLocations();

      if (!shopifyResult.success || !shopifyResult.locations) {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch Shopify locations',
          error: shopifyResult.error
        });
      }

      // Match detected city to Shopify location
      const matchedLocationId = GeolocationService.matchCityToShopifyLocation(
        locationResult.location.city,
        shopifyResult.locations
      );

      const matchedLocation = shopifyResult.locations.find(
        loc => loc.id === matchedLocationId
      );

      res.json({
        success: true,
        data: {
          detectedLocation: locationResult.location,
          shopifyLocations: shopifyResult.locations,
          matchedLocation: matchedLocation,
          matchedLocationId: matchedLocationId
        }
      });
    } catch (error) {
      console.error('❌ Error in detectLocation:', error);
      next(error);
    }
  }
}

module.exports = GeolocationController;
