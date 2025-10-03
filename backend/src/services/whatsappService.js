const axios = require('axios');

const KWIKENGAGE_API_URL = 'https://api.kwikengage.ai/send-message/v2';
const API_KEY = process.env.KWIKENGAGE_API_KEY || 'tjMB1OJa48acNEkUBjmU1QLzbOs215sY6oNTH5KpHCOVunDzpf45XaYqLuJ1';

/**
 * Generate invoice text message
 */
const generateInvoiceMessage = (orderData) => {
  const { 
    invoiceNumber, 
    customerName, 
    items, 
    subtotal, 
    tax, 
    total, 
    paymentMethod,
    location,
    timestamp,
    gstBreakdown
  } = orderData;

  const date = new Date(timestamp).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  let message = `🧾 *INVOICE - ${invoiceNumber}*\n\n`;
  message += `📅 Date: ${date}\n`;
  message += `👤 Customer: ${customerName}\n`;
  message += `📍 Location: ${location?.name || 'N/A'}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  message += `📦 *ITEMS:*\n`;
  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    const discount = item.discount || 0;
    const discountedTotal = itemTotal - (itemTotal * discount / 100);
    
    message += `${index + 1}. ${item.title}\n`;
    message += `   Qty: ${item.quantity} × ₹${item.price.toFixed(2)}`;
    if (discount > 0) {
      message += ` (-${discount}%)`;
    }
    message += ` = ₹${discountedTotal.toFixed(2)}\n`;
  });
  
  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *PAYMENT SUMMARY:*\n`;
  message += `Subtotal: ₹${subtotal.toFixed(2)}\n`;
  
  if (gstBreakdown && (gstBreakdown.cgst > 0 || gstBreakdown.sgst > 0 || gstBreakdown.igst > 0)) {
    message += `\n📊 *GST Breakdown:*\n`;
    if (gstBreakdown.cgst > 0) message += `CGST (${gstBreakdown.cgstRate}%): ₹${gstBreakdown.cgst.toFixed(2)}\n`;
    if (gstBreakdown.sgst > 0) message += `SGST (${gstBreakdown.sgstRate}%): ₹${gstBreakdown.sgst.toFixed(2)}\n`;
    if (gstBreakdown.igst > 0) message += `IGST (${gstBreakdown.igstRate}%): ₹${gstBreakdown.igst.toFixed(2)}\n`;
    message += `Total GST: ₹${tax.toFixed(2)}\n`;
  } else {
    message += `Tax/GST: ₹${tax.toFixed(2)}\n`;
  }
  
  message += `\n✨ *TOTAL: ₹${total.toFixed(2)}*\n`;
  message += `💳 Payment Method: ${paymentMethod || 'N/A'}\n`;
  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `\nThank you for your purchase! 🙏\n`;
  message += `For any queries, please contact us.\n`;

  return message;
};

/**
 * Send WhatsApp message via Kwikengage API using Template
 */
const sendWhatsAppMessage = async (phoneNumber, message, orderData = null) => {
  try {
    // Ensure phone number is in correct format (remove spaces, add country code if needed)
    let formattedPhone = phoneNumber.replace(/\s+/g, '');
    
    // If phone doesn't start with country code, assume India (+91)
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91')) {
        formattedPhone = '+' + formattedPhone;
      } else if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    let requestBody;

    // If orderData is provided, use the approved template
    if (orderData) {
      console.log('📱 Using WhatsApp template: invoice_notification_kiosk');
      
      // Prepare template parameters
      const parameters = [
        orderData.customerName || 'Customer',                           // {{1}}
        orderData.invoiceNumber || 'N/A',                              // {{2}}
        new Date(orderData.timestamp).toLocaleDateString('en-IN', {    // {{3}}
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        String(orderData.total?.toFixed(2) || '0.00'),                // {{4}}
        orderData.paymentMethod || 'Cash'                              // {{5}}
      ];

      requestBody = {
        to: formattedPhone,
        channel: "whatsapp",
        type: "template",
        templateID: "invoice_notification_kiosk",
        bodyValues: parameters
      };
    } else {
      // Fallback to text message (for non-invoice messages)
      requestBody = {
        to: formattedPhone,
        channel: "whatsapp",
        type: "text",
        content: {
          type: "text",
          text: message
        }
      };
    }

    console.log('📱 Sending WhatsApp message to:', formattedPhone);
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(KWIKENGAGE_API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY
      }
    });

    console.log('✅ WhatsApp message sent successfully:', response.data);
    return {
      success: true,
      messageId: response.data.messageId,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Send invoice via WhatsApp using Template
 */
const sendInvoiceViaWhatsApp = async (orderData) => {
  try {
    const { customerPhone } = orderData;

    if (!customerPhone) {
      throw new Error('Customer phone number is required');
    }

    // Send via WhatsApp using template
    // Pass orderData as third parameter to trigger template usage
    const result = await sendWhatsAppMessage(customerPhone, null, orderData);

    return result;
  } catch (error) {
    console.error('Error sending invoice via WhatsApp:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendWhatsAppMessage,
  sendInvoiceViaWhatsApp,
  generateInvoiceMessage
};

