const whatsappService = require('../services/whatsappService');

/**
 * Send invoice via WhatsApp
 */
exports.sendInvoice = async (req, res) => {
  try {
    const orderData = req.body;

    // Validate required fields
    if (!orderData.customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone number is required'
      });
    }

    if (!orderData.invoiceNumber || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order data: invoiceNumber and items are required'
      });
    }

    // Send invoice via WhatsApp
    const result = await whatsappService.sendInvoiceViaWhatsApp(orderData);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Invoice sent successfully via WhatsApp',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send invoice via WhatsApp',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in sendInvoice controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Send custom WhatsApp message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    const result = await whatsappService.sendWhatsAppMessage(phoneNumber, message);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in sendMessage controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

