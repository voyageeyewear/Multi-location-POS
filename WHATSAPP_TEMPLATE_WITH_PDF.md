# WhatsApp Template with PDF Header - Kwikengage Submission

## 📋 Template Specifications

### **Template Name:** `invoice_with_pdf_kiosk`

### **Category:** `UTILITY`

### **Language:** English (en)

---

## 🏗️ Template Structure

### **1. HEADER Component**
- **Type:** DOCUMENT
- **Format:** PDF
- **Purpose:** Attach invoice PDF file

### **2. BODY Component**
**Text:**
```
Hi {{1}},

Thank you for your purchase!

Invoice: {{2}}
Date: {{3}}
Amount: ₹{{4}}
Payment: {{5}}

Your order has been confirmed.

For queries, contact us.
```

**Parameters:**
1. `{{1}}` - Customer Name (Text)
2. `{{2}}` - Invoice Number (Text)
3. `{{3}}` - Invoice Date (Text)
4. `{{4}}` - Total Amount (Text)
5. `{{5}}` - Payment Method (Text)

### **3. FOOTER Component** (Optional)
**Text:**
```
Type STOP to Unsubscribe
```

---

## 📝 Complete Template Submission

### **For Kwikengage Dashboard:**

1. **Go to:** Kwikengage Dashboard → WhatsApp → Templates
2. **Click:** "Create New Template"
3. **Fill in:**

```
Template Name: invoice_with_pdf_kiosk
Category: UTILITY
Language: English
```

4. **Add Components:**

#### **Component 1 - HEADER:**
```
Type: DOCUMENT
Format: PDF
Sample Document: Upload a sample invoice PDF (any invoice will work)
```

#### **Component 2 - BODY:**
```
Hi {{1}},

Thank you for your purchase!

Invoice: {{2}}
Date: {{3}}
Amount: ₹{{4}}
Payment: {{5}}

Your order has been confirmed.

For queries, contact us.
```

**Parameters:**
- {{1}} = Customer Name
- {{2}} = Invoice Number
- {{3}} = Date
- {{4}} = Amount
- {{5}} = Payment Method

**Sample Values for Submission:**
- {{1}} = Dhruv
- {{2}} = MUMBVOYA-00001
- {{3}} = 06 Oct 2025
- {{4}} = 1532.82
- {{5}} = card

#### **Component 3 - FOOTER:**
```
Type STOP to Unsubscribe
```

5. **Submit for Approval**

---

## ⏱️ Approval Timeline

- **Meta/WhatsApp Review:** 1-3 business days
- **Approval Notification:** Via Kwikengage email
- **Template ID:** Will be provided after approval

---

## 🔧 Backend Code Update (After Approval)

Once approved, I'll need to:

1. Get the new template ID from Kwikengage
2. Update `backend/src/services/whatsappService.js`
3. Change template_id from `invoice_notification_kiosk` to `invoice_with_pdf_kiosk`
4. Deploy to Railway

---

## 📋 Alternative: Submit via WhatsApp Manager

If Kwikengage doesn't have template creation, use WhatsApp Manager:

1. **Go to:** https://business.facebook.com/wa/manage/message-templates/
2. **Select:** Your WhatsApp Business Account
3. **Click:** "Create Template"
4. **Fill in the same details as above**

---

## 🎯 Expected Result After Approval

When a customer completes a purchase:

1. **WhatsApp Message Received:**
   - 📄 **PDF Invoice** (at the top as header)
   - 📝 **Template Message** (with invoice details)
   - All in **ONE message** (bypasses 24-hour window!)

---

## 📞 Need Help?

If you face any issues during submission:
1. Screenshot the Kwikengage template creation form
2. Share the template ID after approval
3. I'll update the code immediately

---

## ⚡ Quick Submission Checklist

- [ ] Login to Kwikengage Dashboard
- [ ] Navigate to Templates section
- [ ] Create new template with name `invoice_with_pdf_kiosk`
- [ ] Add DOCUMENT header component
- [ ] Add BODY component with 5 parameters
- [ ] Add FOOTER component
- [ ] Upload sample PDF for header
- [ ] Submit for WhatsApp approval
- [ ] Wait for approval (1-3 days)
- [ ] Share template ID with me for code update

---

**Once you have the template approved, let me know the template ID and I'll update the code immediately!** 🚀
