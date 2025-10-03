const whatsappService = require('../services/whatsappService');
const pdfInvoiceService = require('../services/pdfInvoiceServiceHTML');

/**
 * Send invoice via WhatsApp (Template Message + PDF Document)
 */
exports.sendInvoice = async (req, res) => {
  try {
    const orderData = req.body;

    // Validate required fields
    if (!orderData.customerPhone) {
      console.log('⚠️ WhatsApp invoice: Missing customer phone number');
      return res.status(200).json({
        success: false,
        message: 'Customer phone number is required',
        skipped: true
      });
    }

    if (!orderData.invoiceNumber || !orderData.items || orderData.items.length === 0) {
      console.log('⚠️ WhatsApp invoice: Missing invoice number or items');
      return res.status(200).json({
        success: false,
        message: 'Invalid order data: invoiceNumber and items are required',
        skipped: true
      });
    }

    console.log(`📱 Attempting to send WhatsApp invoice ${orderData.invoiceNumber} to ${orderData.customerPhone}`);

    // Step 1: Send template message
    const templateResult = await whatsappService.sendInvoiceViaWhatsApp(orderData);

    if (templateResult.success) {
      console.log('✅ WhatsApp template sent successfully!', templateResult.messageId);
    } else {
      console.error('❌ WhatsApp template failed:', templateResult.error);
    }

    // Step 2: Generate PDF invoice
    console.log('📄 Generating PDF invoice...');
    const pdfResult = await pdfInvoiceService.generateInvoicePDF(orderData);
    
    if (pdfResult && pdfResult.filePath) {
      console.log('✅ PDF generated successfully:', pdfResult.fileName);

      // Step 3: Send PDF document via WhatsApp
      const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8000}`;
      const pdfUrl = `${baseUrl}/api/invoices/${pdfResult.fileName}`;
      
      console.log('📎 Sending PDF via WhatsApp...');
      const documentResult = await whatsappService.sendDocumentViaWhatsApp(
        orderData.customerPhone,
        pdfUrl,
        pdfResult.fileName,
        `Invoice ${orderData.invoiceNumber}`
      );

      if (documentResult.success) {
        console.log('✅ PDF sent successfully!', documentResult.messageId);
        return res.status(200).json({
          success: true,
          message: 'Invoice sent successfully via WhatsApp (template + PDF)',
          templateMessageId: templateResult.messageId,
          documentMessageId: documentResult.messageId,
          pdfGenerated: true
        });
      } else {
        console.error('❌ PDF send failed:', documentResult.error);
        return res.status(200).json({
          success: templateResult.success,
          message: 'Template sent but PDF failed',
          templateMessageId: templateResult.messageId,
          pdfGenerated: true,
          documentError: documentResult.error
        });
      }
    } else {
      console.error('❌ PDF generation failed');
      return res.status(200).json({
        success: templateResult.success,
        message: 'Template sent but PDF generation failed',
        templateMessageId: templateResult.messageId,
        pdfGenerated: false
      });
    }

  } catch (error) {
    console.error('❌ Error in sendInvoice controller:', error.message);
    console.error('Full error:', error);
    // Return 200 with success: false so sale doesn't fail
    return res.status(200).json({
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

