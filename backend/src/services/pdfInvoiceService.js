const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFInvoiceService {
  constructor() {
    // Create invoices directory if it doesn't exist
    this.invoicesDir = path.join(__dirname, '../../invoices');
    if (!fs.existsSync(this.invoicesDir)) {
      fs.mkdirSync(this.invoicesDir, { recursive: true });
    }
  }

  async generateInvoicePDF(orderData) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `${orderData.invoiceNumber}.pdf`;
        const filePath = path.join(this.invoicesDir, fileName);
        
        // Create PDF document with CUSTOM WIDER SIZE (portrait orientation)
        const doc = new PDFDocument({ 
          margin: 40,
          size: [750, 1000]  // Custom size: 750pt wide x 1000pt tall (wider than A4)
        });
        
        // Pipe to file
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add content
        this.generateHeader(doc, orderData);
        this.generateCustomerInformation(doc, orderData);
        const tableEndY = this.generateInvoiceTable(doc, orderData);
        this.generateTaxSummaryTable(doc, orderData, tableEndY);
        this.generateFooter(doc, orderData);

        // Finalize PDF
        doc.end();

        writeStream.on('finish', () => {
          console.log('✅ PDF generated successfully:', filePath);
          resolve({ filePath, fileName });
        });

        writeStream.on('error', (error) => {
          console.error('❌ Error writing PDF:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ Error generating PDF:', error);
        reject(error);
      }
    });
  }

  generateHeader(doc, orderData) {
    const pageWidth = doc.page.width;
    const leftMargin = 40;
    const rightMargin = pageWidth - 40;
    
    // Try to add logo if it exists
    const logoPath = path.join(__dirname, '../assets/logo.png');
    let logoAdded = false;
    
    console.log('🎨 Checking for logo at:', logoPath);
    console.log('🎨 Logo exists?', fs.existsSync(logoPath));
    
    try {
      if (fs.existsSync(logoPath)) {
        console.log('✅ Logo found! Adding to PDF...');
        // Add logo on the left side (maintaining aspect ratio)
        const logoWidth = 60;
        const logoY = 45;
        
        doc.image(logoPath, leftMargin, logoY, { 
          width: logoWidth,
          align: 'left'
        });
        logoAdded = true;
        console.log('✅ Logo added successfully to PDF');
        
        // Company name - aligned on same line as logo
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('SS ENTERPRISES', leftMargin + logoWidth + 10, logoY + 5, { 
            align: 'left'
          });
      } else {
        console.log('❌ Logo file not found at path');
      }
    } catch (error) {
      console.log('❌ Error adding logo:', error.message);
      console.error(error);
    }
    
    // Fallback: If no logo, show company name centered
    if (!logoAdded) {
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('SS ENTERPRISES', 0, 45, { 
          align: 'center',
          width: pageWidth
        });
    }

    // Company details (left aligned, below company name/logo)
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('C-7/31, Sector-7, Rohini Delhi-110085', leftMargin, 110, { align: 'left' })
      .text('GSTIN/UIN: 08AGFPK7804C1ZQ', leftMargin, 123, { align: 'left' })
      .text('E-Mail: ssenterprise255@gmail.com', leftMargin, 136, { align: 'left' });

    // Invoice details box (right side) - BORDERED (Simplified)
    const boxX = 490;
    const boxY = 40;
    const boxWidth = 220;
    const boxHeight = 50; // Reduced height for only 2 fields
    
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .rect(boxX, boxY, boxWidth, boxHeight)
      .stroke();
    
    // Invoice details with proper alignment
    const labelX = boxX + 8;
    const valueX = boxX + 95;
    let currentY = boxY + 10;
    const lineHeight = 15;
    
    doc.fontSize(9).font('Helvetica');
    
    // Invoice No
    doc.font('Helvetica-Bold').text('Invoice No.:', labelX, currentY, { width: 85 });
    doc.font('Helvetica').text(orderData.invoiceNumber || 'MUMBVOYA-00030', valueX, currentY, { width: 110 });
    currentY += lineHeight;
    
    // Dated
    doc.font('Helvetica-Bold').text('Dated:', labelX, currentY, { width: 85 });
    doc.font('Helvetica').text(new Date(orderData.timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }), valueX, currentY, { width: 110 });
  }

  generateCustomerInformation(doc, orderData) {
    const startY = 210;
    const leftBoxX = 40;
    const leftBoxWidth = 320;
    const rightBoxX = 370;
    const rightBoxWidth = 340;
    const boxHeight = 95;
    
    // Draw boxes
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .rect(leftBoxX, startY, leftBoxWidth, boxHeight)
      .stroke()
      .rect(rightBoxX, startY, rightBoxWidth, boxHeight)
      .stroke();

    const padding = 8;
    let leftY = startY + padding;
    let rightY = startY + padding;
    const lineHeight = 12;

    // Consignee (Ship to) - Left side
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Consignee (Ship to)', leftBoxX + padding, leftY);
    leftY += lineHeight;
    
    doc
      .fontSize(8)
      .font('Helvetica')
      .text(orderData.customerName || 'Customer', leftBoxX + padding, leftY);
    leftY += lineHeight;
    
    // Show customer address if provided, otherwise show location
    if (orderData.customerAddress) {
      doc.text(orderData.customerAddress, leftBoxX + padding, leftY, { width: leftBoxWidth - padding * 2 });
      leftY += lineHeight * 2; // Account for potential multiline address
    } else {
      doc.text(orderData.location?.city || 'Mumbai', leftBoxX + padding, leftY);
      leftY += lineHeight;
      doc.text(orderData.location?.state || 'Maharashtra', leftBoxX + padding, leftY);
      leftY += lineHeight;
    }
    
    // Show customer GST if provided, otherwise N/A
    const customerGst = orderData.customerGstNumber || 'N/A';
    doc.text(`GSTIN/UIN: ${customerGst}`, leftBoxX + padding, leftY);

    // Buyer (Bill to) - Right side
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Buyer (Bill to)', rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    doc
      .fontSize(8)
      .font('Helvetica')
      .text(orderData.customerName || 'Customer', rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    // Show customer address if provided, otherwise show location
    if (orderData.customerAddress) {
      doc.text(orderData.customerAddress, rightBoxX + padding, rightY, { width: rightBoxWidth - padding * 2 });
      rightY += lineHeight * 2; // Account for potential multiline address
    } else {
      doc.text(orderData.location?.city || 'Mumbai', rightBoxX + padding, rightY);
      rightY += lineHeight;
      doc.text(orderData.location?.state || 'Maharashtra', rightBoxX + padding, rightY);
      rightY += lineHeight;
    }
    
    // Show customer GST if provided, otherwise N/A
    doc.text(`GSTIN/UIN: ${customerGst}`, rightBoxX + padding, rightY);
  }

  generateInvoiceTable(doc, orderData) {
    const tableTop = 320;
    const leftMargin = 40;
    const rightMargin = 710; // Custom wider portrait size
    
    // Column positions for detailed view with generous spacing (wider portrait)
    const colSl = leftMargin + 5;
    const colDesc = 70;
    const colHSN = 220;
    const colQty = 280;
    const colUnitPrice = 335;
    const colDiscount = 395;
    const colTaxable = 455;
    const colCGST = 515;
    const colSGST = 565;
    const colIGST = 615;
    const colAmount = 660;
    
    // Draw table border
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .rect(leftMargin, tableTop, rightMargin - leftMargin, 20)
      .stroke();
    
    // Table Header
    doc
      .fontSize(7)
      .font('Helvetica-Bold');
    
    let headerY = tableTop + 6;
    doc.text('SI', colSl, headerY, { width: 20, align: 'center' });
    doc.text('Description of Goods', colDesc, headerY, { width: 145 });
    doc.text('HSN/SAC', colHSN, headerY, { width: 55, align: 'center' });
    doc.text('Qty', colQty, headerY, { width: 50, align: 'center' });
    doc.text('Unit Price', colUnitPrice, headerY, { width: 55, align: 'center' });
    doc.text('Discount', colDiscount, headerY, { width: 55, align: 'center' });
    doc.text('Taxable', colTaxable, headerY, { width: 55, align: 'center' });
    doc.text('CGST', colCGST, headerY, { width: 45, align: 'center' });
    doc.text('SGST', colSGST, headerY, { width: 45, align: 'center' });
    doc.text('IGST', colIGST, headerY, { width: 40, align: 'center' });
    doc.text('Amount', colAmount, headerY, { width: 48, align: 'center' });

    // Table Rows
    doc.fontSize(7).font('Helvetica');
    let currentY = tableTop + 25;
    const rowHeight = 18;

    let totalQty = 0;
    let totalUnitPrice = 0;
    let totalDiscount = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalAmount = 0;

    orderData.items.forEach((item, index) => {
      const productName = item.title || item.name || 'Product';
      const hsnCode = item.hsnCode || '90041000';
      const quantity = item.quantity || 1;
      const unitPrice = item.price || 0;
      const itemUnitPrice = unitPrice * quantity;
      
      // Get GST rate based on product type (18% for sunglasses, 5% for eyeglasses)
      const gstRate = item.gstRate || item.igstRate || 18;
      const cgstRate = gstRate / 2;
      const sgstRate = gstRate / 2;
      
      // Calculate discount
      const discountPerItem = item.discountAmount || 0;
      const discountTotal = discountPerItem * quantity;
      
      // Calculate taxable value (Unit Price - Discount)
      const taxableValue = itemUnitPrice - discountTotal;
      
      // Calculate CGST and SGST on taxable value
      const cgstAmount = (taxableValue * cgstRate) / 100;
      const sgstAmount = (taxableValue * sgstRate) / 100;
      const igstAmount = 0; // For intra-state, IGST is 0
      
      // Final amount = Taxable + CGST + SGST
      const finalAmount = taxableValue + cgstAmount + sgstAmount;
      
      // Accumulate totals
      totalQty += quantity;
      totalUnitPrice += itemUnitPrice;
      totalDiscount += discountTotal;
      totalTaxable += taxableValue;
      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
      totalIGST += igstAmount;
      totalAmount += finalAmount;

      // Draw row border
      doc
        .strokeColor('#000000')
        .lineWidth(0.5)
        .rect(leftMargin, currentY - 5, rightMargin - leftMargin, rowHeight)
        .stroke();
      
      // Row data
      doc.text((index + 1).toString(), colSl, currentY, { width: 20, align: 'center' });
      doc.text(productName.substring(0, 36), colDesc, currentY, { width: 145 });
      doc.text(hsnCode, colHSN, currentY, { width: 55, align: 'center' });
      doc.text(quantity.toString(), colQty, currentY, { width: 50, align: 'center' });
      doc.text(itemUnitPrice.toFixed(2), colUnitPrice, currentY, { width: 55, align: 'center' });
      doc.text(discountTotal > 0 ? discountTotal.toFixed(2) : '0.00', colDiscount, currentY, { width: 55, align: 'center' });
      doc.text(taxableValue.toFixed(2), colTaxable, currentY, { width: 55, align: 'center' });
      doc.text(cgstAmount.toFixed(2), colCGST, currentY, { width: 45, align: 'center' });
      doc.text(sgstAmount.toFixed(2), colSGST, currentY, { width: 45, align: 'center' });
      doc.text(igstAmount.toFixed(2), colIGST, currentY, { width: 40, align: 'center' });
      doc.text(finalAmount.toFixed(2), colAmount, currentY, { width: 48, align: 'center' });
      
      currentY += rowHeight;
    });

    // Draw line before total
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .moveTo(leftMargin, currentY - 5)
      .lineTo(rightMargin, currentY - 5)
      .stroke();

    // Total Row
    doc
      .strokeColor('#000000')
      .lineWidth(0.5)
      .rect(leftMargin, currentY - 5, rightMargin - leftMargin, rowHeight)
      .stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('Total', colDesc, currentY, { width: 145 });
    doc.text(totalQty.toString(), colQty, currentY, { width: 50, align: 'center' });
    doc.text(totalUnitPrice.toFixed(2), colUnitPrice, currentY, { width: 55, align: 'center' });
    doc.text(totalDiscount > 0 ? `-${totalDiscount.toFixed(2)}` : '0.00', colDiscount, currentY, { width: 55, align: 'center' });
    doc.text(totalTaxable.toFixed(2), colTaxable, currentY, { width: 55, align: 'center' });
    doc.text(totalCGST.toFixed(2), colCGST, currentY, { width: 45, align: 'center' });
    doc.text(totalSGST.toFixed(2), colSGST, currentY, { width: 45, align: 'center' });
    doc.text(totalIGST.toFixed(2), colIGST, currentY, { width: 40, align: 'center' });
    doc.text(totalAmount.toFixed(2), colAmount, currentY, { width: 48, align: 'center' });
    
    currentY += rowHeight;

    // Draw line after total
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .moveTo(leftMargin, currentY - 5)
      .lineTo(rightMargin, currentY - 5)
      .stroke();

    // Grand Total Row
    doc
      .strokeColor('#000000')
      .lineWidth(0.5)
      .rect(leftMargin, currentY - 5, rightMargin - leftMargin, rowHeight)
      .stroke();
    
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Grand Total', colDesc, currentY, { width: 145 });
    doc.text(Math.round(totalAmount).toFixed(2), colAmount, currentY, { width: 48, align: 'center' });
    
    currentY += rowHeight;

    // Draw line after grand total
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .moveTo(leftMargin, currentY - 5)
      .lineTo(rightMargin, currentY - 5)
      .stroke();

    // Amount in words
    currentY += 10;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Amount Chargeable (in words):', leftMargin, currentY);
    currentY += 12;
    doc.fontSize(9).font('Helvetica');
    doc.text(`INR ${this.numberToWords(Math.round(totalAmount))} Only`, leftMargin, currentY, { width: 500 });

    return currentY + 25;
  }

  generateTaxSummaryTable(doc, orderData, startY) {
    const leftMargin = 40;
    const rightMargin = 710; // Match wider portrait width
    
    startY += 5;
    
    // Column positions with sub-columns for Rate and Amount
    const colHSN = leftMargin + 15;
    const colTaxable = 145;
    
    // CGST columns
    const colCGSTRate = 240;
    const colCGSTAmount = 290;
    
    // SGST columns
    const colSGSTRate = 355;
    const colSGSTAmount = 405;
    
    // IGST columns
    const colIGSTRate = 470;
    const colIGSTAmount = 520;
    
    const colTotalTax = 600;
    
    // Draw main table border for first header row
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .rect(leftMargin, startY, rightMargin - leftMargin, 15)
      .stroke();
    
    // First Header Row - Main categories
    doc.fontSize(8).font('Helvetica-Bold');
    let headerY = startY + 4;
    doc.text('HSN/SAC', colHSN, headerY, { width: 90, align: 'center' });
    doc.text('Taxable Value', colTaxable, headerY, { width: 85, align: 'center' });
    doc.text('CGST', colCGSTRate + 15, headerY, { width: 80, align: 'center' });
    doc.text('SGST', colSGSTRate + 15, headerY, { width: 80, align: 'center' });
    doc.text('IGST', colIGSTRate + 15, headerY, { width: 80, align: 'center' });
    doc.text('Total Tax', colTotalTax, headerY, { width: 100, align: 'center' });
    
    // Draw vertical dividers in first header
    doc.moveTo(colTaxable - 5, startY).lineTo(colTaxable - 5, startY + 15).stroke();
    doc.moveTo(colCGSTRate - 5, startY).lineTo(colCGSTRate - 5, startY + 15).stroke();
    doc.moveTo(colSGSTRate - 5, startY).lineTo(colSGSTRate - 5, startY + 15).stroke();
    doc.moveTo(colIGSTRate - 5, startY).lineTo(colIGSTRate - 5, startY + 15).stroke();
    doc.moveTo(colTotalTax - 10, startY).lineTo(colTotalTax - 10, startY + 15).stroke();
    
    // Second Header Row - Sub-columns (Rate | Amount)
    startY += 15;
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .rect(leftMargin, startY, rightMargin - leftMargin, 12)
      .stroke();
    
    headerY = startY + 3;
    doc.fontSize(7).font('Helvetica-Bold');
    
    // Sub-headers for CGST
    doc.text('Rate', colCGSTRate, headerY, { width: 40, align: 'center' });
    doc.text('Amount', colCGSTAmount, headerY, { width: 50, align: 'center' });
    
    // Sub-headers for SGST
    doc.text('Rate', colSGSTRate, headerY, { width: 40, align: 'center' });
    doc.text('Amount', colSGSTAmount, headerY, { width: 50, align: 'center' });
    
    // Sub-headers for IGST
    doc.text('Rate', colIGSTRate, headerY, { width: 40, align: 'center' });
    doc.text('Amount', colIGSTAmount, headerY, { width: 50, align: 'center' });
    
    // Draw vertical dividers in second header (only main column separators)
    doc.moveTo(colTaxable - 5, startY).lineTo(colTaxable - 5, startY + 12).stroke();
    doc.moveTo(colCGSTRate - 5, startY).lineTo(colCGSTRate - 5, startY + 12).stroke();
    doc.moveTo(colSGSTRate - 5, startY).lineTo(colSGSTRate - 5, startY + 12).stroke();
    doc.moveTo(colIGSTRate - 5, startY).lineTo(colIGSTRate - 5, startY + 12).stroke();
    doc.moveTo(colTotalTax - 10, startY).lineTo(colTotalTax - 10, startY + 12).stroke();

    // Table Rows
    doc.fontSize(8).font('Helvetica');
    let currentY = startY + 17;
    const rowHeight = 15;
    
    let totalTaxableValue = 0;
    let totalCGSTAmount = 0;
    let totalSGSTAmount = 0;
    let totalIGSTAmount = 0;
    let totalTax = 0;

    // Group items by HSN code (with proper discount and CGST/SGST calculation)
    const hsnGroups = {};
    orderData.items.forEach(item => {
      const hsnCode = item.hsnCode || '90041000';
      const itemTotal = (item.price * item.quantity);
      const discountAmount = (item.discountAmount || 0) * item.quantity;
      const taxableValue = itemTotal - discountAmount; // Apply discount before tax
      const gstRate = item.gstRate || item.igstRate || 18;
      const cgstRate = gstRate / 2;
      const sgstRate = gstRate / 2;
      
      // Calculate CGST and SGST on taxable value
      const cgstAmount = taxableValue * (cgstRate / 100);
      const sgstAmount = taxableValue * (sgstRate / 100);
      const igstAmount = 0; // For intra-state transactions
      
      if (!hsnGroups[hsnCode]) {
        hsnGroups[hsnCode] = {
          taxableValue: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          cgstRate: cgstRate,
          sgstRate: sgstRate
        };
      }
      
      hsnGroups[hsnCode].taxableValue += taxableValue;
      hsnGroups[hsnCode].cgstAmount += cgstAmount;
      hsnGroups[hsnCode].sgstAmount += sgstAmount;
      hsnGroups[hsnCode].igstAmount += igstAmount;
    });

    // Render HSN rows
    Object.keys(hsnGroups).forEach((hsnCode) => {
      const group = hsnGroups[hsnCode];
      const rowTotalTax = group.cgstAmount + group.sgstAmount + group.igstAmount;
      
      // Draw row border
      doc
        .strokeColor('#000000')
        .lineWidth(0.5)
        .rect(leftMargin, currentY - 5, rightMargin - leftMargin, rowHeight)
        .stroke();
      
      doc.text(hsnCode, colHSN, currentY, { width: 90, align: 'center' });
      doc.text(group.taxableValue.toFixed(2), colTaxable, currentY, { width: 85, align: 'center' });
      
      // CGST - Rate and Amount in separate columns
      doc.fontSize(8);
      doc.text(`${group.cgstRate}%`, colCGSTRate, currentY, { width: 40, align: 'center' });
      doc.text(group.cgstAmount.toFixed(2), colCGSTAmount, currentY, { width: 50, align: 'center' });
      
      // SGST - Rate and Amount in separate columns
      doc.text(`${group.sgstRate}%`, colSGSTRate, currentY, { width: 40, align: 'center' });
      doc.text(group.sgstAmount.toFixed(2), colSGSTAmount, currentY, { width: 50, align: 'center' });
      
      // IGST - Rate and Amount in separate columns
      doc.text(`0%`, colIGSTRate, currentY, { width: 40, align: 'center' });
      doc.text(group.igstAmount.toFixed(2), colIGSTAmount, currentY, { width: 50, align: 'center' });
      
      doc.text(rowTotalTax.toFixed(2), colTotalTax, currentY, { width: 100, align: 'center' });
      
      // Draw vertical dividers in data row (only main column separators)
      doc.moveTo(colTaxable - 5, currentY - 5).lineTo(colTaxable - 5, currentY + 10).stroke();
      doc.moveTo(colCGSTRate - 5, currentY - 5).lineTo(colCGSTRate - 5, currentY + 10).stroke();
      doc.moveTo(colSGSTRate - 5, currentY - 5).lineTo(colSGSTRate - 5, currentY + 10).stroke();
      doc.moveTo(colIGSTRate - 5, currentY - 5).lineTo(colIGSTRate - 5, currentY + 10).stroke();
      doc.moveTo(colTotalTax - 10, currentY - 5).lineTo(colTotalTax - 10, currentY + 10).stroke();
      
      totalTaxableValue += group.taxableValue;
      totalCGSTAmount += group.cgstAmount;
      totalSGSTAmount += group.sgstAmount;
      totalIGSTAmount += group.igstAmount;
      totalTax += rowTotalTax;
      
      currentY += rowHeight;
    });

    // Total row
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .rect(leftMargin, currentY - 5, rightMargin - leftMargin, rowHeight)
      .stroke();
    
    doc.font('Helvetica-Bold');
    doc.text('Total', colHSN, currentY, { width: 90, align: 'center' });
    doc.text(totalTaxableValue.toFixed(2), colTaxable, currentY, { width: 85, align: 'center' });
    
    // Total amounts only (no rates in total row)
    doc.text(totalCGSTAmount.toFixed(2), colCGSTAmount, currentY, { width: 50, align: 'center' });
    doc.text(totalSGSTAmount.toFixed(2), colSGSTAmount, currentY, { width: 50, align: 'center' });
    doc.text(totalIGSTAmount.toFixed(2), colIGSTAmount, currentY, { width: 50, align: 'center' });
    doc.text(totalTax.toFixed(2), colTotalTax, currentY, { width: 100, align: 'center' });
    
    // Draw vertical dividers in total row (only main column separators)
    doc.moveTo(colTaxable - 5, currentY - 5).lineTo(colTaxable - 5, currentY + 10).stroke();
    doc.moveTo(colCGSTRate - 5, currentY - 5).lineTo(colCGSTRate - 5, currentY + 10).stroke();
    doc.moveTo(colSGSTRate - 5, currentY - 5).lineTo(colSGSTRate - 5, currentY + 10).stroke();
    doc.moveTo(colIGSTRate - 5, currentY - 5).lineTo(colIGSTRate - 5, currentY + 10).stroke();
    doc.moveTo(colTotalTax - 10, currentY - 5).lineTo(colTotalTax - 10, currentY + 10).stroke();

    // Tax amount in words
    currentY += 20;
    doc.fontSize(9).font('Helvetica');
    doc.text(`Tax Amount (in words): INR ${this.numberToWords(Math.round(totalTax))} Only`, leftMargin, currentY, { width: 500 });

    return currentY + 20;
  }

  generateFooter(doc, orderData) {
    const leftMargin = 40;
    const rightMargin = 560;
    let position = 680;
    
    // Bank Details (Left side)
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Company\'s Bank Details', leftMargin, position);
    
    position += 15;
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('Bank Name: Kotak Mahindra Bank', leftMargin, position);
    
    position += 12;
    doc.text('A/c No.: 2512756649', leftMargin, position);
    
    position += 12;
    doc.text('Branch & IFSC Code: KKBK0004485', leftMargin, position);
    
    // Declaration (right side aligned)
    let declarationY = 680;
    const declarationX = 420;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Declaration:', declarationX, declarationY);
    
    declarationY += 15;
    doc
      .fontSize(8)
      .font('Helvetica')
      .text('We declare that this invoice shows the actual price of the goods', declarationX, declarationY, { width: 280 })
      .text('described and that all particulars are true and correct.', declarationX, declarationY + 10, { width: 280 });
    
    // Company signature (right side)
    position += 20;
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('for SS ENTERPRISES', declarationX + 130, position, { align: 'center' });
    
    doc
      .fontSize(9)
      .text('Authorised Signatory', declarationX + 130, position + 40, { align: 'center' });
  }

  numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    let integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let words = '';

    // Thousands
    if (integerPart >= 1000) {
      words += this.convertHundreds(Math.floor(integerPart / 1000)) + ' Thousand ';
      integerPart %= 1000;
    }

    // Hundreds
    if (integerPart >= 100) {
      words += ones[Math.floor(integerPart / 100)] + ' Hundred ';
      integerPart %= 100;
    }

    // Tens and ones
    if (integerPart >= 20) {
      words += tens[Math.floor(integerPart / 10)] + ' ';
      integerPart %= 10;
    } else if (integerPart >= 10) {
      words += teens[integerPart - 10] + ' ';
      integerPart = 0;
    }

    if (integerPart > 0) {
      words += ones[integerPart] + ' ';
    }

    words += 'Rupees';

    // Add paise if present
    if (decimalPart > 0) {
      words += ' and ' + this.convertHundreds(decimalPart) + ' Paise';
    }

    return words.trim();
  }

  convertHundreds(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    let words = '';

    if (num >= 100) {
      words += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }

    if (num >= 20) {
      words += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      words += teens[num - 10] + ' ';
      return words.trim();
    }

    if (num > 0) {
      words += ones[num];
    }

    return words.trim();
  }

  // Clean up old PDF files (optional - call periodically)
  cleanupOldFiles(daysOld = 7) {
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;

    fs.readdir(this.invoicesDir, (err, files) => {
      if (err) {
        console.error('Error reading invoices directory:', err);
        return;
      }

      files.forEach(file => {
        const filePath = path.join(this.invoicesDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;
          
          if (now - stats.mtimeMs > maxAge) {
            fs.unlink(filePath, err => {
              if (err) console.error('Error deleting old file:', err);
              else console.log('Deleted old invoice:', file);
            });
          }
        });
      });
    });
  }
}

module.exports = new PDFInvoiceService();