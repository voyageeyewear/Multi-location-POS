# WhatsApp Template Message Guide

## 📱 Understanding WhatsApp Templates

### What are WhatsApp Templates?

WhatsApp Templates are **pre-approved message formats** that allow you to send messages to customers **anytime**, without the 24-hour messaging window restriction.

### Why Do You Need Templates?

**The Problem:**
- ❌ Free-form WhatsApp messages can only be sent within 24 hours of the customer's last message
- ❌ Your POS invoice messages are currently failing because of this restriction

**The Solution:**
- ✅ Templates can be sent anytime (no 24-hour restriction)
- ✅ Perfect for automated notifications like invoices, order confirmations, etc.
- ✅ Must be pre-approved by Meta/WhatsApp (takes 1-2 days)

---

## 🎯 Creating Your Invoice Template

### Step 1: Access Your Kwikengage Dashboard

1. Log in to [Kwikengage Dashboard](https://app.kwikengage.ai/)
2. Navigate to **WhatsApp** → **Templates**
3. Click **"Create New Template"**

### Step 2: Template Configuration

#### Basic Information:

| Field | Value |
|-------|-------|
| **Template Name** | `invoice_notification` |
| **Category** | TRANSACTIONAL |
| **Language** | English (en) |
| **Status** | Will be "Pending" until approved |

#### Template Structure:

WhatsApp templates have 3 sections:

1. **Header** (Optional) - Image, Document, or Text
2. **Body** (Required) - Main message content
3. **Footer** (Optional) - Small text at bottom
4. **Buttons** (Optional) - Call-to-action buttons

---

## 📝 Sample Invoice Template

### Option 1: Simple Invoice Template (Recommended)

#### Header:
```
📄 Invoice
```

#### Body:
```
Hi {{1}},

Thank you for your purchase!

*Invoice Details:*
Invoice No: {{2}}
Date: {{3}}
Total Amount: ₹{{4}}
Payment Method: {{5}}

Your invoice has been generated successfully.

For any queries, please contact us.
```

#### Footer:
```
Powered by POS System
```

#### Variables Explained:
- `{{1}}` = Customer Name
- `{{2}}` = Invoice Number
- `{{3}}` = Date
- `{{4}}` = Total Amount
- `{{5}}` = Payment Method

---

### Option 2: Detailed Invoice Template

#### Body:
```
🧾 *INVOICE CONFIRMATION*

Hi {{1}},

Your purchase at {{2}} has been completed!

📄 *Invoice:* {{3}}
📅 *Date:* {{4}}
💰 *Amount:* ₹{{5}}
💳 *Payment:* {{6}}

Thank you for shopping with us! Visit us again soon.

For support, contact: {{7}}
```

#### Variables:
- `{{1}}` = Customer Name
- `{{2}}` = Store Location
- `{{3}}` = Invoice Number
- `{{4}}` = Date & Time
- `{{5}}` = Total Amount
- `{{6}}` = Payment Method
- `{{7}}` = Support Phone/Email

---

## 🚀 Step-by-Step Template Creation

### 1. Create Template in Kwikengage

```
Template Name: invoice_notification
Category: TRANSACTIONAL
Language: English (en)
```

### 2. Add Template Content

**Body:**
```
Hi {{1}},

Thank you for your purchase!

*Invoice: {{2}}*
Date: {{3}}
Amount: ₹{{4}}
Payment: {{5}}

Your order has been confirmed.

For queries, contact us.
```

**Footer:**
```
Thank you for choosing us!
```

### 3. Submit for Approval

1. Review your template carefully
2. Click **"Submit for Approval"**
3. Wait for Meta/WhatsApp approval (usually 1-2 business days)
4. You'll receive an email when approved

---

## ⚙️ Integrating Templates into Your Code

Once your template is approved, update the WhatsApp service:

### Backend Update Required:

**File:** `backend/src/services/whatsappService.js`

**Current Code (Session Message):**
```javascript
const requestBody = {
  to: formattedPhone,
  channel: "whatsapp",
  type: "text",
  content: {
    type: "text",
    text: message
  }
};
```

**New Code (Template Message):**
```javascript
const requestBody = {
  to: formattedPhone,
  channel: "whatsapp",
  type: "template",
  content: {
    templateName: "invoice_notification",
    language: "en",
    parameters: [
      orderData.customerName,                    // {{1}}
      orderData.invoiceNumber,                   // {{2}}
      new Date(orderData.timestamp).toLocaleDateString('en-IN'), // {{3}}
      orderData.total.toFixed(2),                // {{4}}
      orderData.paymentMethod || 'Cash'          // {{5}}
    ]
  }
};
```

---

## 📋 Template Examples by Use Case

### 1. Simple Invoice Template
```
Hi {{1}},

Your invoice {{2}} for ₹{{3}} has been generated.

Payment: {{4}}
Date: {{5}}

Thank you!
```

### 2. Order Confirmation Template
```
🎉 Order Confirmed!

Hi {{1}},

Your order #{{2}} has been placed successfully.

Amount: ₹{{3}}
Location: {{4}}

We'll notify you when it's ready!
```

### 3. Payment Receipt Template
```
✅ Payment Received

Hi {{1}},

We've received your payment of ₹{{2}}.

Invoice: {{3}}
Method: {{4}}
Date: {{5}}

Receipt sent to your email.
```

---

## ✅ Template Approval Checklist

Before submitting your template, ensure:

- [ ] Template name is descriptive (e.g., `invoice_notification`)
- [ ] Category is correct (TRANSACTIONAL for invoices)
- [ ] Language is set correctly
- [ ] No promotional content in transactional templates
- [ ] Variables are clearly marked with `{{1}}`, `{{2}}`, etc.
- [ ] Message is clear and professional
- [ ] No spelling or grammar errors
- [ ] Complies with WhatsApp's guidelines

---

## 🚨 Common Rejection Reasons

Your template may be rejected if:

1. **Too vague** - Be specific about what the message is for
2. **Promotional content** - Transactional templates shouldn't have marketing
3. **Missing variables** - Dynamic content should use `{{1}}` format
4. **Grammar errors** - Check spelling and punctuation
5. **Misleading** - Don't promise what you can't deliver
6. **Too long** - Keep it concise (under 1024 characters)

---

## 📊 Template Message Limits

**WhatsApp Template Message Pricing:**
- Templates are charged per message sent
- Rates vary by country (India: ~₹0.50-2 per message)
- Check with Kwikengage for current pricing

**Rate Limits:**
- New numbers: Lower limits initially
- Verified business: Higher limits
- Quality rating affects limits

---

## 🔧 Testing Your Template

### Before Approval (Testing):
- Cannot test unapproved templates
- Must wait for approval first

### After Approval (Testing):
1. Send a message from your phone to your WhatsApp Business number
2. Complete a POS sale with your phone number
3. Template message should be delivered immediately! ✅

---

## 💡 Best Practices

### 1. Keep It Simple
- Use clear, concise language
- Don't overload with information
- Focus on essential details only

### 2. Use Variables Wisely
- Only use variables for dynamic content
- Don't use too many (5-10 is ideal)
- Order them logically

### 3. Professional Tone
- Use proper grammar
- Be courteous
- Match your brand voice

### 4. Test Thoroughly
- Test with different customer names
- Test with various amounts
- Verify formatting looks good

---

## 📱 WhatsApp Template Categories

Choose the right category for your template:

| Category | Use Case | Examples |
|----------|----------|----------|
| **TRANSACTIONAL** | Order updates, invoices, receipts | "Your invoice #123 for ₹500" |
| **MARKETING** | Promotions, offers, campaigns | "50% off this weekend!" |
| **AUTHENTICATION** | OTPs, verification codes | "Your OTP is 123456" |
| **UTILITY** | Reminders, updates, alerts | "Appointment tomorrow at 3pm" |

**For POS Invoices: Use TRANSACTIONAL** ✅

---

## 🎨 Template Formatting

WhatsApp supports basic formatting:

| Format | Syntax | Example |
|--------|--------|---------|
| **Bold** | `*text*` | *Important* |
| **Italic** | `_text_` | _Note_ |
| **Strikethrough** | `~text~` | ~Old Price~ |
| **Monospace** | `` `text` `` | `CODE123` |

---

## 🔄 Updating Templates

If you need to change your template:

1. You **CANNOT** edit approved templates
2. You must **create a new template**
3. Submit the new one for approval
4. Update your code to use the new template name
5. Delete the old template (optional)

---

## 📞 Support Resources

### Kwikengage Support:
- **Email**: support@kwikengage.ai
- **Documentation**: https://docs.kwikengage.ai/
- **Dashboard**: https://app.kwikengage.ai/

### WhatsApp Business API:
- **Guidelines**: https://business.whatsapp.com/policy
- **Template Guidelines**: https://developers.facebook.com/docs/whatsapp/message-templates
- **Help Center**: https://www.facebook.com/business/help

---

## 🎯 Quick Start Summary

1. ✅ Log in to Kwikengage dashboard
2. ✅ Create template named `invoice_notification`
3. ✅ Set category to TRANSACTIONAL
4. ✅ Add invoice message with variables `{{1}}`, `{{2}}`, etc.
5. ✅ Submit for approval
6. ✅ Wait 1-2 days for approval
7. ✅ Update your code to use template (see integration section)
8. ✅ Test by completing a POS sale
9. ✅ Receive WhatsApp invoice instantly! 🎉

---

## 🚀 Next Steps

After creating your template:

1. **Wait for approval** (check email notifications)
2. **Notify me** when approved, and I'll update the code
3. **Test thoroughly** with real transactions
4. **Monitor delivery rates** in Kwikengage dashboard
5. **Scale up** once everything works smoothly

---

## ❓ FAQ

### Q: How long does approval take?
**A:** Usually 1-2 business days, sometimes within hours.

### Q: Can I use emojis?
**A:** Yes! Emojis are supported and encouraged for better engagement.

### Q: How many variables can I use?
**A:** Up to 100 variables per template, but keep it reasonable (5-10).

### Q: What if my template is rejected?
**A:** Review the rejection reason, fix the issues, and resubmit.

### Q: Can I send without approval?
**A:** No, templates must be approved before they can be used.

### Q: Do templates expire?
**A:** No, once approved, templates don't expire.

### Q: Can I delete a template?
**A:** Yes, but make sure your code isn't using it first!

---

## 📝 Template Creation Checklist

Use this checklist when creating your template:

```markdown
Template Checklist:
- [ ] Template name is clear and descriptive
- [ ] Category set to TRANSACTIONAL
- [ ] Language set to English (en)
- [ ] Header added (optional but recommended)
- [ ] Body content is clear and professional
- [ ] Variables numbered correctly ({{1}}, {{2}}, etc.)
- [ ] Footer added (optional)
- [ ] No promotional content
- [ ] No spelling/grammar errors
- [ ] Tested variable order matches code
- [ ] Complies with WhatsApp policies
- [ ] Submitted for approval
- [ ] Approval email received
- [ ] Code updated with template name
- [ ] Tested with real transaction
```

---

**Good luck with your template creation! Once approved, your invoices will be delivered instantly via WhatsApp! 🚀**

