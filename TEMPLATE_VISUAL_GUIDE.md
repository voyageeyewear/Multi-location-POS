# WhatsApp Template Visual Guide

## 📱 How the Message Will Look

```
┌─────────────────────────────────────────┐
│  WhatsApp - VoyageEyewear               │
├─────────────────────────────────────────┤
│                                         │
│  📄 MUMBVOYA-00012.pdf                  │
│  [3.2 kB • PDF Document]                │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Hi Dhruv,                              │
│                                         │
│  Thank you for your purchase!           │
│                                         │
│  Invoice: MUMBVOYA-00012                │
│  Date: 06 Oct 2025                      │
│  Amount: ₹1532.82                       │
│  Payment: card                          │
│                                         │
│  Your order has been confirmed.         │
│                                         │
│  For queries, contact us.               │
│                                         │
│  ─────────────────────────────────────  │
│  Type STOP to Unsubscribe               │
│                                         │
└─────────────────────────────────────────┘
```

## 🎨 Template Components Breakdown

### **HEADER (Document)**
```
📄 MUMBVOYA-00012.pdf
```
- This is the invoice PDF
- Customers can tap to open/download
- Professional invoice with all details

### **BODY (Message)**
```
Hi {{Customer Name}},

Thank you for your purchase!

Invoice: {{Invoice Number}}
Date: {{Date}}
Amount: ₹{{Total Amount}}
Payment: {{Payment Method}}

Your order has been confirmed.

For queries, contact us.
```

### **FOOTER**
```
Type STOP to Unsubscribe
```

---

## 🔄 Current vs New Template

### **Current Template (invoice_notification_kiosk)**
```
❌ No PDF attachment
✅ Text message only
❌ Blocked by 24-hour window for follow-up PDFs
```

### **New Template (invoice_with_pdf_kiosk)**
```
✅ PDF attached in header
✅ Text message included
✅ Bypasses 24-hour window
✅ Single message with everything
```

---

## 📋 Submission Screenshots Guide

When submitting in Kwikengage, you'll see something like:

```
┌─────────────────────────────────────────┐
│ Create WhatsApp Template                │
├─────────────────────────────────────────┤
│                                         │
│ Template Name:                          │
│ [invoice_with_pdf_kiosk           ]     │
│                                         │
│ Category:                               │
│ [▼ UTILITY                        ]     │
│                                         │
│ Language:                               │
│ [▼ English (en)                   ]     │
│                                         │
│ ──────────── Components ─────────────   │
│                                         │
│ [+ Add Header]  [+ Add Body]  [+ Add...│
│                                         │
└─────────────────────────────────────────┘
```

### **Step 1: Add Header**
```
┌─────────────────────────────────────────┐
│ Header Component                        │
├─────────────────────────────────────────┤
│ Type: [▼ DOCUMENT              ]        │
│                                         │
│ Upload Sample PDF:                      │
│ [📄 Upload File]                        │
│                                         │
│ ✅ Sample invoice PDF required          │
└─────────────────────────────────────────┘
```

### **Step 2: Add Body**
```
┌─────────────────────────────────────────┐
│ Body Component                          │
├─────────────────────────────────────────┤
│ Message Text:                           │
│ ┌─────────────────────────────────────┐ │
│ │ Hi {{1}},                           │ │
│ │                                     │ │
│ │ Thank you for your purchase!        │ │
│ │                                     │ │
│ │ Invoice: {{2}}                      │ │
│ │ Date: {{3}}                         │ │
│ │ Amount: ₹{{4}}                      │ │
│ │ Payment: {{5}}                      │ │
│ │                                     │ │
│ │ Your order has been confirmed.      │ │
│ │                                     │ │
│ │ For queries, contact us.            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Sample Values:                          │
│ {{1}} = Dhruv                           │
│ {{2}} = MUMBVOYA-00001                  │
│ {{3}} = 06 Oct 2025                     │
│ {{4}} = 1532.82                         │
│ {{5}} = card                            │
└─────────────────────────────────────────┘
```

### **Step 3: Add Footer**
```
┌─────────────────────────────────────────┐
│ Footer Component                        │
├─────────────────────────────────────────┤
│ Footer Text:                            │
│ ┌─────────────────────────────────────┐ │
│ │ Type STOP to Unsubscribe            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## ✅ Final Checklist

Before submitting:
- [ ] Template name: `invoice_with_pdf_kiosk`
- [ ] Category: UTILITY
- [ ] Language: English
- [ ] Header: DOCUMENT type
- [ ] Body: 5 parameters ({{1}} to {{5}})
- [ ] Footer: Unsubscribe text
- [ ] Sample PDF uploaded
- [ ] Sample values provided for each parameter

---

## 🎯 After Approval

You'll receive:
- ✅ Approval email from WhatsApp/Kwikengage
- ✅ Template ID (e.g., `invoice_with_pdf_kiosk` or a numeric ID)
- ✅ Template status: APPROVED

**Then:**
1. Share the template ID with me
2. I'll update the code (takes 5 minutes)
3. Deploy to Railway
4. Test with a sale
5. PDF will be delivered! 🎉
