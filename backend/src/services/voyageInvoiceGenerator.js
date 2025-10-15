const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceGenerator {
  constructor(products, customers, addresses) {
    this.products = products;
    this.customers = customers;
    this.addresses = addresses;
  }

  // Get random item from array
  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Get random date between two dates
  getRandomDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime);
  }

  // Format date as DD MMM YYYY
  formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  // Format currency
  formatCurrency(amount) {
    return amount.toFixed(2);
  }

  // Number to words conversion
  numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    let words = '';
    
    // Crores
    if (num >= 10000000) {
      words += this.numberToWords(Math.floor(num / 10000000)) + ' Crore ';
      num %= 10000000;
    }
    
    // Lakhs
    if (num >= 100000) {
      words += this.numberToWords(Math.floor(num / 100000)) + ' Lakh ';
      num %= 100000;
    }
    
    // Thousands
    if (num >= 1000) {
      words += this.numberToWords(Math.floor(num / 1000)) + ' Thousand ';
      num %= 1000;
    }
    
    // Hundreds
    if (num >= 100) {
      words += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
    // Tens and ones
    if (num >= 20) {
      words += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      words += teens[num - 10] + ' ';
      return words.trim();
    }
    
    if (num > 0) {
      words += ones[num] + ' ';
    }
    
    return words.trim();
  }

  // Determine tax rate based on product type
  getTaxRateForProduct(productTitle) {
    const titleLower = productTitle.toLowerCase();
    
    // 18% tax for sunglasses
    if (titleLower.includes('sunglass') || titleLower.includes('sun glass')) {
      return 18;
    }
    
    // 5% tax for frames, eyewear, glasses, spectacles
    return 5;
  }

  // Determine HSN/SAC code based on product type
  getHSNCode(productTitle) {
    const titleLower = productTitle.toLowerCase();
    
    // 90041000 for sunglasses
    if (titleLower.includes('sunglass') || titleLower.includes('sun glass')) {
      return '90041000';
    }
    
    // 90031900 for frames, eyewear, glasses, spectacles
    return '90031900';
  }

  // Generate random products with real prices for invoice
  generateInvoiceItems(totalQuantity) {
    const items = [];
    const availableProducts = [...this.products].filter(p => p.price > 0);
    
    // Determine number of different product types (1 to min(totalQuantity, 5))
    const maxTypes = Math.min(totalQuantity, 5);
    const numberOfTypes = Math.floor(Math.random() * maxTypes) + 1;
    
    // Distribute quantity across product types
    const quantities = [];
    let remainingQty = totalQuantity;
    
    for (let i = 0; i < numberOfTypes - 1; i++) {
      const minQty = 1;
      const maxQty = remainingQty - (numberOfTypes - i - 1);
      const qty = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;
      quantities.push(qty);
      remainingQty -= qty;
    }
    quantities.push(remainingQty);
    
    // Build items with real prices from Shopify
    for (let i = 0; i < numberOfTypes; i++) {
      const product = this.getRandomItem(availableProducts);
      const quantity = quantities[i];
      const realPrice = parseFloat(product.price);
      const itemAmount = realPrice * quantity;
      
      // Determine tax rate and HSN code based on product type
      const totalTaxRate = this.getTaxRateForProduct(product.fullTitle);
      const sgstRate = totalTaxRate / 2;  // Split 50-50 between SGST and CGST
      const cgstRate = totalTaxRate / 2;
      const sgstAmount = Math.round((itemAmount * sgstRate / 100) * 100) / 100;
      const cgstAmount = Math.round((itemAmount * cgstRate / 100) * 100) / 100;
      const hsnCode = this.getHSNCode(product.fullTitle);
      
      items.push({
        name: product.fullTitle || product.title || `Product ${product.id || ''}`,
        sku: product.sku || '',
        hsn: hsnCode,
        quantity: quantity,
        rate: realPrice,
        amount: Math.round(itemAmount * 100) / 100,
        sgstRate: sgstRate,
        sgstAmount: sgstAmount,
        cgstRate: cgstRate,
        cgstAmount: cgstAmount,
        igstRate: 0,
        igstAmount: 0
      });
    }
    
    return items;
  }

  // Generate invoice items that match exact target amount using discount
  generateInvoiceItemsWithTarget(totalQuantity, targetGrandTotal) {
    console.log(`      🎯 generateInvoiceItemsWithTarget called: Target = ₹${targetGrandTotal.toFixed(2)}, Qty = ${totalQuantity}`);
    const items = [];
    const availableProducts = [...this.products].filter(p => p.price > 0);
    
    // Determine number of different product types
    const maxTypes = Math.min(totalQuantity, 5);
    const numberOfTypes = Math.floor(Math.random() * maxTypes) + 1;
    
    // Distribute quantity across product types
    const quantities = [];
    let remainingQty = totalQuantity;
    
    for (let i = 0; i < numberOfTypes - 1; i++) {
      const minQty = 1;
      const maxQty = remainingQty - (numberOfTypes - i - 1);
      const qty = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;
      quantities.push(qty);
      remainingQty -= qty;
    }
    quantities.push(remainingQty);
    
    // Build items with REAL prices for ALL items
    for (let i = 0; i < numberOfTypes; i++) {
      const product = this.getRandomItem(availableProducts);
      const quantity = quantities[i];
      const realPrice = parseFloat(product.price);
      const itemAmount = realPrice * quantity;
      
      const totalTaxRate = this.getTaxRateForProduct(product.fullTitle);
      const sgstRate = totalTaxRate / 2;
      const cgstRate = totalTaxRate / 2;
      const sgstAmount = Math.round((itemAmount * sgstRate / 100) * 100) / 100;
      const cgstAmount = Math.round((itemAmount * cgstRate / 100) * 100) / 100;
      const hsnCode = this.getHSNCode(product.fullTitle);
      
      items.push({
        name: product.fullTitle || product.title || `Product ${product.id || ''}`,
        sku: product.sku || '',
        hsn: hsnCode,
        quantity: quantity,
        rate: realPrice,  // REAL PRICE
        originalAmount: Math.round(itemAmount * 100) / 100,  // REAL AMOUNT
        amount: Math.round(itemAmount * 100) / 100,
        sgstRate: sgstRate,
        sgstAmount: sgstAmount,
        cgstRate: cgstRate,
        cgstAmount: cgstAmount,
        igstRate: 0,
        igstAmount: 0
      });
    }
    
    // Calculate total with real prices
    const realGrandTotal = items.reduce((sum, item) => sum + item.amount + item.sgstAmount + item.cgstAmount, 0);
    const difference = realGrandTotal - targetGrandTotal;
    
    console.log(`      💰 Total with real prices: ₹${realGrandTotal.toFixed(2)}`);
    console.log(`      📊 Target: ₹${targetGrandTotal.toFixed(2)}`);
    
    if (difference > 0) {
      // Need to apply discount
      console.log(`      💎 Discount needed: ₹${difference.toFixed(2)}`);
      return {
        items: items,
        discount: difference,
        targetTotal: targetGrandTotal,
        adjustedUnitPrice: null  // No adjustment needed
      };
    } else if (difference < 0) {
      // Need to increase price - adjust the unit price up instead of showing negative discount
      const adjustment = Math.abs(difference);
      console.log(`      💎 Adjustment needed (increase): ₹${adjustment.toFixed(2)}`);
      
      // Return adjusted unit price (target) and zero discount
      return {
        items: items,
        discount: 0,  // Show zero discount
        targetTotal: targetGrandTotal,
        adjustedUnitPrice: targetGrandTotal  // Unit price = target amount
      };
    } else {
      // Perfect match
      console.log(`      ✅ Perfect match!`);
      return {
        items: items,
        discount: 0,
        targetTotal: targetGrandTotal,
        adjustedUnitPrice: null
      };
    }
  }

  // Get GST number based on location
  getGSTNumber(location) {
    const gstNumbers = {
      'udaipur': '08ASPPA9662F1ZF',
      'dehradun': '05ASPPA9662F1ZL'
    };
    return gstNumbers[location] || gstNumbers['udaipur'];
  }


  // Helper function to parse DD-MM-YYYY format
  parseDDMMYYYY(dateString) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateString); // Fallback to default parsing
  }

  // Generate a single invoice PDF - Simplified format
  async generateInvoice(invoiceNumber, paymentMethod, totalQuantity, startDate, endDate, location, targetAmount = null) {
    const customer = this.getRandomItem(this.customers);
    const address = this.getRandomItem(this.addresses);
    
    // Use start date for all invoices - properly parse DD-MM-YYYY format
    const parsedStartDate = this.parseDDMMYYYY(startDate);
    const date = this.formatDate(parsedStartDate);
    
    // Set output directory
    const outputDir = path.join(__dirname, '../../invoices');
    
    let items, discount = 0, targetTotal = null, adjustedUnitPrice = null;
    if (targetAmount) {
      // This is the last invoice - use discount to match exact target amount
      const result = this.generateInvoiceItemsWithTarget(totalQuantity || 2, targetAmount);
      items = result.items;
      discount = result.discount;
      targetTotal = result.targetTotal;
      adjustedUnitPrice = result.adjustedUnitPrice;
    } else {
      // Regular invoice with 100% real prices
      items = this.generateInvoiceItems(totalQuantity || 2);
    }

    // INCLUSIVE TAX Calculation (like your image):
    // 1. Unit Price (MRP) = item.amount (tax-inclusive price)
    // 2. Discount = amount to subtract
    // 3. Amount = Unit Price - Discount (tax-inclusive after discount)
    // 4. Taxable value = Amount / (1 + tax rate)
    // 5. CGST = Taxable value × 9%
    // 6. SGST = Taxable value × 9%
    
    // If we have an adjusted unit price (when target > real price), use that
    const unitPriceTotal = adjustedUnitPrice !== null ? adjustedUnitPrice : items.reduce((sum, item) => sum + item.amount, 0);
    
    // Get tax rate from first item
    const totalTaxRate = items.length > 0 ? (items[0].sgstRate + items[0].cgstRate) / 100 : 0.18;
    const halfTaxRate = totalTaxRate / 2;
    
    let amountAfterDiscount, taxableValue, cgstTotal, sgstTotal, finalTotal;
    
    if (targetAmount && targetTotal) {
      // Use the exact target amount for final total
      amountAfterDiscount = targetTotal;
      finalTotal = targetTotal;
      
      // Discount is already calculated in generateInvoiceItemsWithTarget
      // Don't recalculate it here - just round it
      discount = Math.round(discount * 100) / 100;
      
      // Extract taxable value from final amount (reverse calculation)
      taxableValue = finalTotal / (1 + totalTaxRate);
      taxableValue = Math.round(taxableValue * 100) / 100;
      
      // Calculate taxes on taxable value
      cgstTotal = Math.round(taxableValue * halfTaxRate * 100) / 100;
      sgstTotal = Math.round(taxableValue * halfTaxRate * 100) / 100;
    } else {
      // No target: Amount = Unit Price
      amountAfterDiscount = unitPriceTotal;
      discount = 0;
      
      // Extract taxable value from amount
      taxableValue = amountAfterDiscount / (1 + totalTaxRate);
      taxableValue = Math.round(taxableValue * 100) / 100;
      
      // Calculate taxes on taxable value
      cgstTotal = Math.round(taxableValue * halfTaxRate * 100) / 100;
      sgstTotal = Math.round(taxableValue * halfTaxRate * 100) / 100;
      
      // Final total is the amount (already includes taxes)
      finalTotal = amountAfterDiscount;
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4',
          layout: 'landscape',
          margin: 30
        });

        // Sanitize invoice number for filename (replace slashes with underscores)
        const safeInvoiceNumber = invoiceNumber.replace(/\//g, '_');
        const fileName = `Invoice_${safeInvoiceNumber}_${date.replace(/\s/g, '-')}.pdf`;
        const filePath = path.join(outputDir, fileName);
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        const pageWidth = 841.89;  // Landscape width
        const pageHeight = 595.28; // Landscape height
        let currentY = 40;

        // Border
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40).stroke();

        // Title - "Tax Invoice" centered
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('Tax Invoice', 0, currentY, { align: 'center', width: pageWidth });

        currentY += 28;

        // Company details (left side)
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Voyage Eyewear', 40, currentY);
        currentY += 12;
        
        doc.fontSize(8).font('Helvetica');
        doc.text('SS Enterprises', 40, currentY);
        currentY += 10;
        doc.text('KKGF05, Voyage Eyewear, Nexus Celebration Mall,', 40, currentY, { width: 400 });
        currentY += 9;
        doc.text('Devendra Dham, Udaipur, Rajasthan, 313001', 40, currentY, { width: 400 });
        currentY += 10;
        
        const gstNumber = this.getGSTNumber(location);
        doc.text(`GSTIN: ${gstNumber}`, 40, currentY);
        currentY += 9;
        doc.text('Phone: +91 97167 85038', 40, currentY);
        currentY += 9;
        doc.text('Email: info@voyageeyewear.com', 40, currentY);

        // Invoice details (right side)
        const rightX = 660;
        currentY = 68;

        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Invoice No.', rightX, currentY, { width: 80, align: 'left' });
        doc.font('Helvetica');
        doc.text(`VOY${invoiceNumber}`, rightX + 90, currentY, { width: 100, lineBreak: false });

        currentY += 11;
        doc.font('Helvetica-Bold');
        doc.text('Invoice Date', rightX, currentY, { width: 80, align: 'left' });
        doc.font('Helvetica');
        doc.text(date, rightX + 90, currentY, { width: 100, lineBreak: false });

        currentY += 11;
        doc.font('Helvetica-Bold');
        doc.text('Reference No.', rightX, currentY);

        // Line
        currentY = 138;
        doc.moveTo(20, currentY).lineTo(pageWidth - 20, currentY).stroke();

        // Bill To / Ship To
        currentY += 8;
        const leftX = 40;
        const midX = pageWidth / 2;

        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Bill To', leftX, currentY);
        doc.text('Ship To', midX + 20, currentY);

        // Vertical line
        doc.moveTo(midX, 138).lineTo(midX, currentY + 40).stroke();

        currentY += 12;
        doc.fontSize(8).font('Helvetica');
        doc.text(customer.name, leftX, currentY);
        doc.text(customer.name, midX + 20, currentY);

        currentY += 10;
        doc.text(address.city, leftX, currentY);
        doc.text(address.city, midX + 20, currentY);

        // Line
        currentY += 18;
        doc.moveTo(20, currentY).lineTo(pageWidth - 20, currentY).stroke();

        // Table header
        currentY += 8;

        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Sl', 40, currentY, { width: 35, align: 'center' });
        doc.text('Description of Goods', 85, currentY, { width: 180 });
        doc.text('HSN', 275, currentY, { width: 55, align: 'center' });
        doc.text('Qty', 340, currentY, { width: 40, align: 'center' });
        doc.text('Unit Price', 390, currentY, { width: 65, align: 'center' });
        doc.text('Discount', 465, currentY, { width: 60, align: 'center' });
        doc.text('Taxable', 535, currentY, { width: 65, align: 'center' });
        doc.text('CGST', 610, currentY, { width: 50, align: 'center' });
        doc.text('SGST', 670, currentY, { width: 50, align: 'center' });
        doc.text('IGST', 730, currentY, { width: 45, align: 'center' });
        doc.text('Amount', 770, currentY, { width: 50, align: 'center' });

        currentY += 10;
        doc.moveTo(20, currentY).lineTo(pageWidth - 20, currentY).stroke();

        // Items - showing Unit Price (MRP) which is tax-inclusive
        currentY += 8;
        items.forEach((item, idx) => {
          // For per-item display, we need to calculate individual item's values
          // Item amount is tax-inclusive (Unit Price MRP)
          const itemUnitPrice = item.amount;
          const itemDiscountRatio = discount > 0 ? (amountAfterDiscount / unitPriceTotal) : 1;
          const itemDiscount = itemUnitPrice * (1 - itemDiscountRatio);
          const itemAmountAfterDiscount = itemUnitPrice - itemDiscount;
          
          // Extract taxable value from item amount
          const itemTaxableValue = itemAmountAfterDiscount / (1 + totalTaxRate);
          const itemCGST = itemTaxableValue * halfTaxRate;
          const itemSGST = itemTaxableValue * halfTaxRate;
          
          doc.fontSize(8).font('Helvetica');
          doc.text(idx + 1, 40, currentY, { width: 35, align: 'center' });
          doc.text((item.name || 'Product').substring(0, 35), 85, currentY, { width: 180 });
          doc.text(item.hsn || '90031900', 275, currentY, { width: 55, align: 'center' });
          doc.text(item.quantity.toString(), 340, currentY, { width: 40, align: 'center' });
          doc.text(this.formatCurrency(itemUnitPrice), 390, currentY, { width: 65, align: 'center' });
          doc.text(this.formatCurrency(itemDiscount), 465, currentY, { width: 60, align: 'center' });
          doc.text(this.formatCurrency(itemTaxableValue), 535, currentY, { width: 65, align: 'center' });
          doc.text(this.formatCurrency(itemCGST), 610, currentY, { width: 50, align: 'center' });
          doc.text(this.formatCurrency(itemSGST), 670, currentY, { width: 50, align: 'center' });
          doc.text('0.00', 730, currentY, { width: 45, align: 'center' });
          doc.text(this.formatCurrency(itemAmountAfterDiscount), 770, currentY, { width: 50, align: 'center' });
          
          currentY += 12;
        });

        // Line before totals
        doc.moveTo(20, currentY).lineTo(pageWidth - 20, currentY).stroke();

        // Totals row - showing Unit Price totals, Discount, Taxable value, CGST, SGST, Amount
        currentY += 10;
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Total', 85, currentY);
        doc.text('', 275, currentY);
        doc.text(items.reduce((sum, i) => sum + i.quantity, 0).toString(), 340, currentY, { width: 40, align: 'center' });
        doc.text(this.formatCurrency(unitPriceTotal), 390, currentY, { width: 65, align: 'center' });
        doc.text(this.formatCurrency(discount), 465, currentY, { width: 60, align: 'center' });
        doc.text(this.formatCurrency(taxableValue), 535, currentY, { width: 65, align: 'center' });
        doc.text(this.formatCurrency(cgstTotal), 610, currentY, { width: 50, align: 'center' });
        doc.text(this.formatCurrency(sgstTotal), 670, currentY, { width: 50, align: 'center' });
        doc.text('0.00', 730, currentY, { width: 45, align: 'center' });
        doc.text(this.formatCurrency(amountAfterDiscount), 770, currentY, { width: 50, align: 'center' });

        currentY += 12;

        // Grand Total row with line above (inside table)
        doc.moveTo(20, currentY).lineTo(pageWidth - 20, currentY).stroke();
        currentY += 10;
        
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Grand Total', 85, currentY);
        doc.text('', 275, currentY);
        doc.text('', 340, currentY);
        doc.text('', 390, currentY);
        doc.text('', 465, currentY);
        doc.text('', 535, currentY);
        doc.text('', 610, currentY);
        doc.text('', 670, currentY);
        doc.text('', 730, currentY);
        doc.text(this.formatCurrency(finalTotal), 770, currentY, { width: 50, align: 'center' });

        // Close table immediately after Grand Total
        currentY += 10;
        doc.moveTo(20, currentY).lineTo(pageWidth - 20, currentY).stroke();

        currentY += 12;

        // Amount in words (using Final Total)
        const amountInWords = this.numberToWords(Math.floor(finalTotal)) + ' Rupees Only';
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Amount Chargeable :', 40, currentY);
        doc.fontSize(8).font('Helvetica');
        doc.text(amountInWords, 40, currentY + 11, { width: 500 });

        currentY += 30;

        // HSN/SAC table
        doc.moveTo(20, currentY).lineTo(pageWidth - 20, currentY).stroke();
        currentY += 8;

        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('HSN/SAC', 40, currentY, { width: 100, align: 'center' });
        doc.text('Taxable Value', 150, currentY, { width: 100, align: 'center' });
        doc.text('CGST', 250, currentY, { width: 80, align: 'center' });
        doc.text('SGST', 340, currentY, { width: 80, align: 'center' });
        doc.text('IGST', 430, currentY, { width: 80, align: 'center' });
        doc.text('Total Tax', 530, currentY, { width: 70, align: 'center' });

        currentY += 10;

        // Group by HSN - using taxable values (extracted from tax-inclusive amounts)
        const hsnGroups = {};
        
        items.forEach(item => {
          if (!hsnGroups[item.hsn]) {
            hsnGroups[item.hsn] = {
              taxable: 0,
              cgst: 0,
              sgst: 0,
              rate: item.cgstRate
            };
          }
          // Calculate per-item values
          const itemUnitPrice = item.amount;
          const itemDiscountRatio = discount > 0 ? (amountAfterDiscount / unitPriceTotal) : 1;
          const itemDiscount = itemUnitPrice * (1 - itemDiscountRatio);
          const itemAmountAfterDiscount = itemUnitPrice - itemDiscount;
          
          // Extract taxable value from amount
          const itemTaxableValue = itemAmountAfterDiscount / (1 + totalTaxRate);
          const itemCGST = itemTaxableValue * halfTaxRate;
          const itemSGST = itemTaxableValue * halfTaxRate;
          
          hsnGroups[item.hsn].taxable += itemTaxableValue;
          hsnGroups[item.hsn].cgst += itemCGST;
          hsnGroups[item.hsn].sgst += itemSGST;
        });

        Object.keys(hsnGroups).forEach(hsn => {
          const group = hsnGroups[hsn];
          const totalTax = group.cgst + group.sgst;
          
          doc.fontSize(8).font('Helvetica');
          doc.text(hsn, 40, currentY, { width: 100, align: 'center' });
          doc.text(this.formatCurrency(group.taxable), 150, currentY, { width: 100, align: 'center' });
          doc.text(`${group.rate}%`, 250, currentY, { width: 35, align: 'center' });
          doc.text(this.formatCurrency(group.cgst), 290, currentY, { width: 50, align: 'center' });
          doc.text(`${group.rate}%`, 340, currentY, { width: 35, align: 'center' });
          doc.text(this.formatCurrency(group.sgst), 380, currentY, { width: 50, align: 'center' });
          doc.text('0%', 430, currentY, { width: 35, align: 'center' });
          doc.text('0.00', 470, currentY, { width: 50, align: 'center' });
          doc.text(this.formatCurrency(totalTax), 530, currentY, { width: 70, align: 'center' });
          
          currentY += 10;
        });

        currentY += 10;

        // Tax Amount in words
        const taxInWords = this.numberToWords(Math.floor(sgstTotal + cgstTotal)) + ' Rupees Only';
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Tax Amount In Words', 40, currentY);
        doc.fontSize(8).font('Helvetica');
        doc.text(taxInWords, 40, currentY + 10);

        currentY += 28;

        // Bank Details
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text("Company's Bank Details", 40, currentY);
        currentY += 10;
        
        doc.fontSize(7).font('Helvetica');
        doc.text('Bank Name: Kotak Mahindra Bank', 40, currentY);
        currentY += 9;
        doc.text('A/c No.: 2645279599', 40, currentY);
        currentY += 9;
        doc.text('Branch & IFS Code: KKBK0004585', 40, currentY);

        // Authorized Signatory
        doc.fontSize(8).font('Helvetica');
        doc.text('Authorized Signatory', pageWidth - 130, currentY, { align: 'right' });

        // Declaration
        currentY += 22;
        doc.fontSize(7).font('Helvetica-Bold');
        doc.text('Declaration:', 40, currentY);
        currentY += 9;
        doc.fontSize(7).font('Helvetica');
        doc.text('We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.', 40, currentY, { width: 650 });

        doc.end();

        writeStream.on('finish', () => {
          resolve({
            invoiceNumber,
            fileName,
            filePath,
            customer: customer.name,
            customer_obj: {
              name: customer.name,
              address: address.street,
              city: address.city,
              state: address.state,
              pincode: address.zip
            },
            date,
            amount: finalTotal,
            quantity: totalQuantity,
            itemCount: items.length,
            items_array: items.map(item => ({
              name: item.name || item.fullTitle || 'Product',
              quantity: item.quantity,
              unitPrice: item.amount
            })),
            paymentMethod
          });
        });

        writeStream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate invoice with edited data
  async generateEditedInvoice(invoiceNumber, paymentMethod, totalQuantity, date, location, customer, items, targetAmount) {
    return new Promise((resolve, reject) => {
      try {
        const outputDir = path.join(__dirname, '../../invoices');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 30
        });

        // Sanitize invoice number for filename
        const safeInvoiceNumber = invoiceNumber.replace(/\//g, '_');
        const fileName = `Invoice_${safeInvoiceNumber}_${date.replace(/\s/g, '-')}.pdf`;
        const filePath = path.join(outputDir, fileName);
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        const pageWidth = 841.89;
        const pageHeight = 595.28;
        let currentY = 40;

        // Border
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40).stroke();

        // Title
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('Tax Invoice', 0, currentY, { align: 'center', width: pageWidth });
        currentY += 28;

        // Company details (left side)
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Voyage Eyewear', 40, currentY);
        currentY += 12;
        
        doc.fontSize(8).font('Helvetica');
        doc.text('SS Enterprises', 40, currentY);
        currentY += 10;
        doc.text('KKGF05, Voyage Eyewear, Nexus Celebration Mall,', 40, currentY, { width: 400 });
        currentY += 9;
        doc.text('Devendra Dham, Udaipur, Rajasthan, 313001', 40, currentY, { width: 400 });
        currentY += 10;
        
        const gstNumber = this.getGSTNumber(location);
        doc.text(`GSTIN: ${gstNumber}`, 40, currentY);
        currentY += 9;
        doc.text('Phone: +91 97167 85038', 40, currentY);
        currentY += 9;
        doc.text('Email: info@voyageeyewear.com', 40, currentY);

        // Invoice details (right side)
        const rightX = 660;
        currentY = 68;

        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Invoice No.', rightX, currentY, { width: 80, align: 'left' });
        doc.font('Helvetica');
        doc.text(`VOY${invoiceNumber}`, rightX + 90, currentY, { width: 100, lineBreak: false });

        currentY += 11;
        doc.font('Helvetica-Bold');
        doc.text('Invoice Date', rightX, currentY, { width: 80, align: 'left' });
        doc.font('Helvetica');
        doc.text(date, rightX + 90, currentY, { width: 100, lineBreak: false });

        currentY = 155;

        // Bill To and Ship To
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Bill To', 40, currentY);
        doc.text('Ship To', 400, currentY);
        currentY += 10;

        doc.fontSize(8).font('Helvetica');
        const billToText = `${customer.name}\n${customer.address}\n${customer.city}, ${customer.state}`;
        const shipToText = `${customer.name}\n${customer.address}\n${customer.city}, ${customer.state}`;

        doc.text(billToText, 40, currentY, { width: 330 });
        doc.text(shipToText, 400, currentY, { width: 330 });

        // Vertical separator line between Bill To and Ship To
        doc.moveTo(385, 155).lineTo(385, 205).stroke();

        currentY = 215;

        // Table headers
        doc.save();
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Sl. No.', 40, currentY, { width: 40, align: 'center' });
        doc.text('Description', 85, currentY, { width: 200, align: 'left' });
        doc.text('HSN', 290, currentY, { width: 50, align: 'center' });
        doc.text('Qty', 345, currentY, { width: 30, align: 'center' });
        doc.text('Unit Price', 380, currentY, { width: 60, align: 'center' });
        doc.text('Discount', 445, currentY, { width: 60, align: 'center' });
        doc.text('Taxable', 510, currentY, { width: 60, align: 'center' });
        doc.text('CGST', 575, currentY, { width: 50, align: 'center' });
        doc.text('SGST', 630, currentY, { width: 50, align: 'center' });
        doc.text('IGST', 685, currentY, { width: 50, align: 'center' });
        doc.text('Amount', 740, currentY, { width: 60, align: 'center' });
        doc.restore();

        currentY += 10;
        doc.moveTo(30, currentY).lineTo(pageWidth - 30, currentY).stroke();
        currentY += 2;

        // Calculate totals with edited data
        let unitPriceTotal = 0;
        const editedItems = items.map((item, index) => {
          // Handle different property names for product title
          const productName = item.name || item.fullTitle || item.title || `Product ${index + 1}`;
          console.log(`📝 Processing edited item ${index + 1}:`, { 
            item_name: item.name, 
            item_fullTitle: item.fullTitle,
            productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice 
          });
          
          const taxRate = this.getTaxRateForProduct(productName);
          const hsnCode = this.getHSNCode(productName);
          const totalTaxRate = taxRate / 100;
          const halfTaxRate = totalTaxRate / 2;

          const unitPrice = item.unitPrice * item.quantity;
          unitPriceTotal += unitPrice;

          return {
            fullTitle: productName,
            quantity: item.quantity,
            amount: unitPrice,
            hsnCode,
            sgstRate: halfTaxRate * 100,
            cgstRate: halfTaxRate * 100,
            totalTaxRate
          };
        });

        const totalTaxRate = editedItems[0]?.totalTaxRate || 0.18;
        const halfTaxRate = totalTaxRate / 2;

        let discount = 0;
        let amountAfterDiscount = unitPriceTotal;  // Use the sum of edited prices as-is
        let taxableValue = amountAfterDiscount / (1 + totalTaxRate);
        let cgstTotal = taxableValue * halfTaxRate;
        let sgstTotal = taxableValue * halfTaxRate;
        let finalTotal = amountAfterDiscount;

        // No discount calculation for edited invoices - use exact amounts from form

        // Render items
        editedItems.forEach((item, index) => {
          const itemUnitPrice = item.amount;
          const itemDiscountRatio = discount > 0 ? discount / unitPriceTotal : 0;
          const itemDiscount = itemUnitPrice * itemDiscountRatio;
          const itemAmountAfterDiscount = itemUnitPrice - itemDiscount;
          const itemTaxableValue = itemAmountAfterDiscount / (1 + item.totalTaxRate);
          const itemCGST = itemTaxableValue * (item.cgstRate / 100);
          const itemSGST = itemTaxableValue * (item.sgstRate / 100);

          doc.save();
          doc.fontSize(8).font('Helvetica');
          doc.text((index + 1).toString(), 40, currentY, { width: 40, align: 'center' });
          doc.text((item.fullTitle || 'Product').substring(0, 50), 85, currentY, { width: 200, align: 'left' });
          doc.text(item.hsnCode || '90031900', 290, currentY, { width: 50, align: 'center' });
          doc.text(item.quantity.toString(), 345, currentY, { width: 30, align: 'center' });
          doc.text(this.formatCurrency(itemUnitPrice), 380, currentY, { width: 60, align: 'center' });
          doc.text(this.formatCurrency(itemDiscount), 445, currentY, { width: 60, align: 'center' });
          doc.text(this.formatCurrency(itemTaxableValue), 510, currentY, { width: 60, align: 'center' });
          doc.text(this.formatCurrency(itemCGST), 575, currentY, { width: 50, align: 'center' });
          doc.text(this.formatCurrency(itemSGST), 630, currentY, { width: 50, align: 'center' });
          doc.text('0.00', 685, currentY, { width: 50, align: 'center' });
          doc.text(this.formatCurrency(itemAmountAfterDiscount), 740, currentY, { width: 60, align: 'center' });
          doc.restore();

          currentY += 12;
        });

        // Totals row
        currentY += 5;
        doc.moveTo(30, currentY).lineTo(pageWidth - 30, currentY).stroke();
        currentY += 2;

        doc.save();
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Total', 85, currentY, { width: 200, align: 'left' });
        doc.text(this.formatCurrency(unitPriceTotal), 380, currentY, { width: 60, align: 'center' });
        doc.text(this.formatCurrency(discount), 445, currentY, { width: 60, align: 'center' });
        doc.text(this.formatCurrency(taxableValue), 510, currentY, { width: 60, align: 'center' });
        doc.text(this.formatCurrency(cgstTotal), 575, currentY, { width: 50, align: 'center' });
        doc.text(this.formatCurrency(sgstTotal), 630, currentY, { width: 50, align: 'center' });
        doc.text('0.00', 685, currentY, { width: 50, align: 'center' });
        doc.text(this.formatCurrency(amountAfterDiscount), 740, currentY, { width: 60, align: 'center' });
        doc.restore();

        currentY += 10;
        doc.moveTo(30, currentY).lineTo(pageWidth - 30, currentY).stroke();
        currentY += 2;

        // Grand Total
        doc.save();
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Grand Total', 85, currentY, { width: 200, align: 'left' });
        doc.text(this.formatCurrency(finalTotal), 740, currentY, { width: 60, align: 'center' });
        doc.restore();

        currentY += 12;
        doc.moveTo(30, currentY).lineTo(pageWidth - 30, currentY).stroke();

        currentY += 30;

        // Amount in words
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Amount Chargeable (in words):', 40, currentY);
        currentY += 10;
        doc.font('Helvetica');
        doc.text(`INR ${this.numberToWords(Math.round(finalTotal))} Only`, 40, currentY);

        currentY += 22;

        // HSN/SAC Table
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('HSN/SAC', 40, currentY, { width: 100, align: 'center' });
        doc.text('Taxable Value', 150, currentY, { width: 100, align: 'center' });
        doc.text('CGST', 250, currentY, { width: 80, align: 'center' });
        doc.text('SGST', 340, currentY, { width: 80, align: 'center' });
        doc.text('IGST', 430, currentY, { width: 80, align: 'center' });
        doc.text('Total Tax', 530, currentY, { width: 70, align: 'center' });

        currentY += 10;

        // Group by HSN and render
        const hsnGroups = {};
        editedItems.forEach(item => {
          const itemTaxableValue = (item.amount * (1 - (discount / unitPriceTotal))) / (1 + item.totalTaxRate);
          const itemCGST = itemTaxableValue * (item.cgstRate / 100);
          const itemSGST = itemTaxableValue * (item.sgstRate / 100);

          if (!hsnGroups[item.hsnCode]) {
            hsnGroups[item.hsnCode] = {
              taxable: 0,
              cgst: 0,
              sgst: 0,
              rate: item.cgstRate
            };
          }
          hsnGroups[item.hsnCode].taxable += itemTaxableValue;
          hsnGroups[item.hsnCode].cgst += itemCGST;
          hsnGroups[item.hsnCode].sgst += itemSGST;
        });

        Object.keys(hsnGroups).forEach(hsn => {
          const group = hsnGroups[hsn];
          const totalTax = group.cgst + group.sgst;

          doc.save();
          doc.fontSize(7).font('Helvetica');
          doc.text(hsn, 40, currentY, { width: 100, align: 'center' });
          doc.text(this.formatCurrency(group.taxable), 150, currentY, { width: 100, align: 'center' });
          doc.text(`${group.rate}%`, 250, currentY, { width: 35, align: 'center' });
          doc.text(this.formatCurrency(group.cgst), 290, currentY, { width: 50, align: 'center' });
          doc.text(`${group.rate}%`, 340, currentY, { width: 35, align: 'center' });
          doc.text(this.formatCurrency(group.sgst), 380, currentY, { width: 50, align: 'center' });
          doc.text('0%', 430, currentY, { width: 35, align: 'center' });
          doc.text('0.00', 470, currentY, { width: 50, align: 'center' });
          doc.text(this.formatCurrency(totalTax), 530, currentY, { width: 70, align: 'center' });
          doc.restore();

          currentY += 10;
        });

        currentY += 2;

        // Tax Amount in Words
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Tax Amount (in words):', 40, currentY);
        currentY += 10;
        doc.font('Helvetica');
        const taxTotal = cgstTotal + sgstTotal;
        doc.text(`INR ${this.numberToWords(Math.round(taxTotal))} Only`, 40, currentY);

        currentY += 22;

        // Bank Details
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Bank Details:', 40, currentY);
        currentY += 10;
        doc.fontSize(7).font('Helvetica');
        doc.text('Bank Name: Kotak Mahindra Bank', 40, currentY);
        currentY += 9;
        doc.text('Account Number: 2645279599', 40, currentY);
        currentY += 9;
        doc.text('Branch & IFS Code: KKBK0004585', 40, currentY);

        // Authorized Signatory (right side)
        const authY = currentY - 27;
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('For Voyage Eyewear', pageWidth - 200, authY, { width: 160, align: 'right' });
        doc.fontSize(7).font('Helvetica');
        doc.text('Authorized Signatory', pageWidth - 200, authY + 40, { width: 160, align: 'right' });

        currentY += 22;

        // Declaration
        doc.fontSize(7).font('Helvetica-Bold');
        doc.text('Declaration:', 40, currentY);
        currentY += 9;
        doc.fontSize(7).font('Helvetica');
        doc.text('We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.', 40, currentY, { width: 650 });

        doc.end();

        writeStream.on('finish', () => {
          resolve({
            invoiceNumber,
            fileName,
            filePath,
            customer: customer.name,
            customer_obj: customer,
            date,
            amount: finalTotal,
            quantity: totalQuantity,
            itemCount: items.length,
            items_array: items,
            paymentMethod
          });
        });

        writeStream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = InvoiceGenerator;

