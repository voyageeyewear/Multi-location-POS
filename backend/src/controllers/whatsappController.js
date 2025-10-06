const whatsappService = require('../services/whatsappService');
// Using PDFKit (simpler, no Chromium needed) instead of HTML-to-PDF
const pdfInvoiceService = require('../services/pdfInvoiceService');

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

    // Step 1: Generate PDF invoice FIRST
    console.log('📄 Step 1: Generating PDF invoice...');
    const pdfResult = await pdfInvoiceService.generateInvoicePDF(orderData);
    
    let pdfUrl = null;
    if (pdfResult && pdfResult.filePath) {
      console.log('✅ PDF generated successfully:', pdfResult.fileName);
      const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8000}`;
      pdfUrl = `${baseUrl}/api/invoices/${pdfResult.fileName}`;
      console.log('📎 PDF URL:', pdfUrl);
    } else {
      console.error('❌ PDF generation failed, sending template without PDF');
    }

    // Step 2: Send template message
    console.log('📱 Step 2: Sending WhatsApp template message...');
    const templateResult = await whatsappService.sendInvoiceViaWhatsApp(orderData, pdfUrl);

    if (!templateResult.success) {
      console.error('❌ Template message failed:', templateResult.error);
      return res.status(200).json({
        success: false,
        message: 'Failed to send WhatsApp template',
        error: templateResult.error,
        pdfGenerated: !!pdfUrl
      });
    }

    console.log('✅ Template message sent successfully!', templateResult.messageId);

    // Step 3: Send PDF as separate document
    let pdfSent = false;
    if (pdfUrl) {
      try {
        console.log('📎 Step 3: Sending PDF document...');
        // Wait 1 second before sending PDF
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const documentResult = await whatsappService.sendDocumentViaWhatsApp(
          orderData.customerPhone,
          pdfUrl,
          `${orderData.invoiceNumber}.pdf`,
          `Invoice ${orderData.invoiceNumber} - Thank you for your purchase!`
        );

        if (documentResult.success) {
          console.log('✅ PDF document sent successfully!', documentResult.messageId);
          pdfSent = true;
        } else {
          console.error('⚠️ PDF send failed (but template was sent):', documentResult.error);
        }
      } catch (pdfError) {
        console.error('⚠️ PDF send error (but template was sent):', pdfError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: pdfSent 
        ? 'Invoice sent successfully via WhatsApp (template + PDF in 2 messages)'
        : 'Template sent, PDF delivery failed (check logs)',
      templateMessageId: templateResult.messageId,
      pdfGenerated: !!pdfUrl,
      pdfSent: pdfSent,
      pdfUrl: pdfUrl
    });

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

