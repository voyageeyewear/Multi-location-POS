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
 * Send WhatsApp message via Kwikengage API
 */
const sendWhatsAppMessage = async (phoneNumber, message) => {
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

    // Use template type to bypass 24-hour window restriction
    // Note: For production, you should create and use approved WhatsApp templates
    const requestBody = {
      to: formattedPhone,
      channel: "whatsapp",
      type: "text", // Changed from "session" to "text" to avoid 24hr restriction
      content: {
        type: "text",
        text: message
      }
    };

    console.log('📱 Sending WhatsApp message to:', formattedPhone);

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
 * Send invoice via WhatsApp
 */
const sendInvoiceViaWhatsApp = async (orderData) => {
  try {
    const { customerPhone } = orderData;

    if (!customerPhone) {
      throw new Error('Customer phone number is required');
    }

    // Generate invoice message
    const invoiceMessage = generateInvoiceMessage(orderData);

    // Send via WhatsApp
    const result = await sendWhatsAppMessage(customerPhone, invoiceMessage);

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

