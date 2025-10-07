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
        
        // Create PDF document
        const doc = new PDFDocument({ 
          margin: 40,
          size: 'A4'
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
    
    // Company name - CENTERED and BOLD
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('SS ENTERPRISES', 0, 45, { 
        align: 'center',
        width: pageWidth
      });

    // Company details (left aligned, below company name)
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('C-7/31, Sector-7, Rohini Delhi-110085', leftMargin, 75, { align: 'left' })
      .text('GSTIN/UIN: 08AGFPK7804C1ZQ', leftMargin, 88, { align: 'left' })
      .text('E-Mail: ssenterprise255@gmail.com', leftMargin, 101, { align: 'left' });

    // Invoice details box (right side) - BORDERED
    const boxX = 340;
    const boxY = 40;
    const boxWidth = 215;
    const boxHeight = 155;
    
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .rect(boxX, boxY, boxWidth, boxHeight)
      .stroke();
    
    // Invoice details with proper alignment
    const labelX = boxX + 8;
    const valueX = boxX + 95;
    let currentY = boxY + 10;
    const lineHeight = 13;
    
    doc.fontSize(8).font('Helvetica');
    
    // Invoice No
    doc.font('Helvetica-Bold').text('Invoice No.:', labelX, currentY, { width: 85 });
    doc.font('Helvetica').text(orderData.invoiceNumber || 'MUMBVOYA-00030', valueX, currentY, { width: 110 });
    currentY += lineHeight;
    
    // e-Way Bill No
    doc.font('Helvetica-Bold').text('e-Way Bill No.:', labelX, currentY, { width: 85 });
    doc.font('Helvetica').text('TT1866418', valueX, currentY, { width: 110 });
    currentY += lineHeight;
    
    // Dated
    doc.font('Helvetica-Bold').text('Dated:', labelX, currentY, { width: 85 });
    doc.font('Helvetica').text(new Date(orderData.timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }), valueX, currentY, { width: 110 });
    currentY += lineHeight;
    
    // Delivery Note
    doc.font('Helvetica-Bold').text('Delivery Note:', labelX, currentY, { width: 85 });
    doc.font('Helvetica').text('Mode/Terms of Payment', valueX, currentY, { width: 110 });
    currentY += lineHeight;
    
    // Reference No & Date
    doc.font('Helvetica-Bold').text('Reference No. & Date:', labelX, currentY, { width: 85 });
    doc.font('Helvetica').text('Other References', valueX, currentY, { width: 110 });
    currentY += lineHeight;
    
    // Buyer's Order No
    doc.font('Helvetica-Bold').text('Buyer\'s Order No.:', labelX, currentY, { width: 85 });
    currentY += lineHeight;
    
    // Dated (blank)
    doc.font('Helvetica-Bold').text('Dated:', labelX, currentY, { width: 85 });
    currentY += lineHeight;
    
    // Dispatch Doc No
    doc.font('Helvetica-Bold').text('Dispatch Doc No.:', labelX, currentY, { width: 85 });
    doc.font('Helvetica').text('Delivery Note Date', valueX, currentY, { width: 110 });
    currentY += lineHeight;
    
    // Dispatched through
    doc.font('Helvetica-Bold').text('Dispatched through:', labelX, currentY, { width: 85 });
    doc.font('Helvetica').text('Destination', valueX, currentY, { width: 110 });
    currentY += lineHeight;
    
    // Terms of Delivery
    doc.font('Helvetica-Bold').text('Terms of Delivery:', labelX, currentY, { width: 85 });
  }

  generateCustomerInformation(doc, orderData) {
    const startY = 210;
    const leftBoxX = 40;
    const rightBoxX = 305;
    const boxWidth = 255;
    const boxHeight = 95;
    
    // Draw boxes
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .rect(leftBoxX, startY, boxWidth, boxHeight)
      .stroke()
      .rect(rightBoxX, startY, boxWidth, boxHeight)
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
      .text(orderData.customerName || 'Dhruv', leftBoxX + padding, leftY);
    leftY += lineHeight;
    
    doc.text(orderData.location?.city || 'Mumbai', leftBoxX + padding, leftY);
    leftY += lineHeight;
    
    doc.text(orderData.location?.state || 'Maharashtra', leftBoxX + padding, leftY);
    leftY += lineHeight;
    
    doc.text(`GSTIN/UIN: ${orderData.location?.gstNumber || '08AGFPK7804C1ZQ'}`, leftBoxX + padding, leftY);
    leftY += lineHeight;
    
    doc.text(`State Name: ${orderData.location?.state || 'Maharashtra'}, Code: 08`, leftBoxX + padding, leftY);

    // Buyer (Bill to) - Right side
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Buyer (Bill to)', rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    doc
      .fontSize(8)
      .font('Helvetica')
      .text(orderData.customerName || 'Dhruv', rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    doc.text(orderData.location?.city || 'Mumbai', rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    doc.text(orderData.location?.state || 'Maharashtra', rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    doc.text('Buyer\'s Order No.:', rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    doc.text('Dated:', rightBoxX + padding, rightY);
  }

  generateInvoiceTable(doc, orderData) {
    const tableTop = 320;
    const leftMargin = 40;
    const rightMargin = 560;
    
    // Column positions
    const colSl = leftMargin;
    const colDesc = 70;
    const colHSN = 310;
    const colQty = 370;
    const colRate = 420;
    const colPer = 470;
    const colAmount = rightMargin - 70;
    
    // Draw table border
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .rect(leftMargin, tableTop, rightMargin - leftMargin, 20)
      .stroke();
    
    // Table Header
    doc
      .fontSize(8)
      .font('Helvetica-Bold');
    
    let headerY = tableTop + 6;
    doc.text('Sl No.', colSl + 3, headerY, { width: 35 });
    doc.text('Description of Goods', colDesc, headerY, { width: 230 });
    doc.text('HSN/SAC', colHSN, headerY, { width: 50 });
    doc.text('Quantity', colQty, headerY, { width: 45 });
    doc.text('Rate', colRate, headerY, { width: 40 });
    doc.text('per', colPer, headerY, { width: 30 });
    doc.text('Amount', colAmount, headerY, { width: 60, align: 'right' });

    // Table Rows
    doc.fontSize(8).font('Helvetica');
    let currentY = tableTop + 25;
    const rowHeight = 18;

    let totalBeforeDiscount = 0;
    let totalDiscount = 0;

    orderData.items.forEach((item, index) => {
      const productName = item.title || item.name || 'Product';
      const hsnCode = item.hsnCode || '90041000';
      const quantity = item.quantity || 1;
      const rate = item.price || 0;
      const itemTotal = (rate * quantity).toFixed(2);
      
      totalBeforeDiscount += parseFloat(itemTotal);
      
      const discountAmount = item.discountAmount || 0;
      totalDiscount += discountAmount * quantity;

      // Draw row border
      doc
        .strokeColor('#000000')
        .lineWidth(0.5)
        .rect(leftMargin, currentY - 5, rightMargin - leftMargin, rowHeight)
        .stroke();
      
      // Row data
      doc.text((index + 1).toString(), colSl + 3, currentY, { width: 35 });
      doc.text(productName, colDesc, currentY, { width: 230 });
      doc.text(hsnCode, colHSN, currentY, { width: 50 });
      doc.text(`${quantity} pcs`, colQty, currentY, { width: 45 });
      doc.text(rate.toFixed(2), colRate, currentY, { width: 40 });
      doc.text('pcs', colPer, currentY, { width: 30 });
      doc.text(itemTotal, colAmount, currentY, { width: 60, align: 'right' });
      
      currentY += rowHeight;
    });

    // Calculate IGST by product type (group by GST rate)
    const igstBreakdown = {};
    let totalIGST = 0;
    
    orderData.items.forEach(item => {
      const itemTotal = (item.price * item.quantity);
      const discountAmount = item.discountAmount || 0;
      const discountedTotal = itemTotal - (discountAmount * item.quantity);
      const igstRate = item.gstRate || item.igstRate || 18; // Default to 18% for sunglasses
      const igstAmount = discountedTotal * (igstRate / 100);
      
      if (!igstBreakdown[igstRate]) {
        igstBreakdown[igstRate] = 0;
      }
      igstBreakdown[igstRate] += igstAmount;
      totalIGST += igstAmount;
    });

    const subtotalAfterDiscount = totalBeforeDiscount - totalDiscount;
    const gstAmount = orderData.tax || totalIGST;
    const totalBeforeRounding = subtotalAfterDiscount + gstAmount;
    const roundedTotal = Math.round(totalBeforeRounding);
    const roundingAdjustment = roundedTotal - totalBeforeRounding;

    // Deductions & Total Section
    currentY += 10;
    const deductionX = 350;
    const valueX = rightMargin - 70;

    doc.fontSize(9).font('Helvetica');
    
    // Discount
    if (totalDiscount > 0) {
      doc.text('DISCOUNT ALLOWED:', deductionX, currentY);
      doc.font('Helvetica-Bold').text(`(−) ${totalDiscount.toFixed(2)}`, valueX, currentY, { width: 60, align: 'right' });
      doc.font('Helvetica');
      currentY += 15;
    }

    // Show IGST breakdown by rate (e.g., IGST 18%, IGST 5%)
    Object.keys(igstBreakdown).sort((a, b) => b - a).forEach(rate => {
      const amount = igstBreakdown[rate];
      doc.text(`IGST ${rate}%:`, deductionX, currentY);
      doc.font('Helvetica-Bold').text(amount.toFixed(2), valueX, currentY, { width: 60, align: 'right' });
      doc.font('Helvetica');
      currentY += 15;
    });

    // Rounded OFF
    if (Math.abs(roundingAdjustment) > 0.01) {
      doc.text('Rounded OFF:', deductionX, currentY);
      doc.font('Helvetica-Bold').text(
        roundingAdjustment >= 0 ? roundingAdjustment.toFixed(2) : `(−) ${Math.abs(roundingAdjustment).toFixed(2)}`, 
        valueX, 
        currentY, 
        { width: 60, align: 'right' }
      );
      doc.font('Helvetica');
      currentY += 15;
    }

    // Draw line before total
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .moveTo(leftMargin, currentY)
      .lineTo(rightMargin, currentY)
      .stroke();

    // Grand Total
    currentY += 10;
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Total:', deductionX, currentY);
    doc.text(`₹ ${roundedTotal.toFixed(2)}`, valueX, currentY, { width: 60, align: 'right' });

    // Amount in words
    currentY += 20;
    doc.fontSize(9).font('Helvetica');
    doc.text(`Total (in words): INR ${this.numberToWords(roundedTotal)} Only`, leftMargin, currentY, { width: 500 });

    return currentY + 25;
  }

  generateTaxSummaryTable(doc, orderData, startY) {
    const leftMargin = 40;
    const rightMargin = 560;
    
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Tax Summary', leftMargin, startY);
    
    startY += 20;
    
    // Column positions
    const colHSN = leftMargin;
    const colTaxable = 120;
    const colIGST = 240;
    const colTotalTax = rightMargin - 80;
    
    // Draw table border
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .rect(leftMargin, startY, rightMargin - leftMargin, 20)
      .stroke();
    
    // Table Header
    doc.fontSize(8).font('Helvetica-Bold');
    let headerY = startY + 6;
    doc.text('HSN/SAC', colHSN + 5, headerY);
    doc.text('Taxable Value', colTaxable, headerY);
    doc.text('IGST (Rate & Amount)', colIGST, headerY);
    doc.text('Total Tax Amount', colTotalTax, headerY);

    // Table Rows
    doc.fontSize(8).font('Helvetica');
    let currentY = startY + 25;
    const rowHeight = 15;
    
    let totalTaxableValue = 0;
    let totalIGST = 0;

    // Group items by HSN code (with proper discount calculation)
    const hsnGroups = {};
    orderData.items.forEach(item => {
      const hsnCode = item.hsnCode || '90041000';
      const itemTotal = (item.price * item.quantity);
      const discountAmount = (item.discountAmount || 0) * item.quantity;
      const taxableValue = itemTotal - discountAmount; // Apply discount before tax
      const gstRate = item.gstRate || 18;
      const gstAmount = taxableValue * (gstRate / 100); // Calculate IGST on discounted amount
      
      if (!hsnGroups[hsnCode]) {
        hsnGroups[hsnCode] = {
          taxableValue: 0,
          gstAmount: 0,
          gstRate: gstRate
        };
      }
      
      hsnGroups[hsnCode].taxableValue += taxableValue;
      hsnGroups[hsnCode].gstAmount += gstAmount;
    });

    // Render HSN rows
    Object.keys(hsnGroups).forEach((hsnCode) => {
      const group = hsnGroups[hsnCode];
      
      // Draw row border
      doc
        .strokeColor('#000000')
        .lineWidth(0.5)
        .rect(leftMargin, currentY - 5, rightMargin - leftMargin, rowHeight)
        .stroke();
      
      doc.text(hsnCode, colHSN + 5, currentY);
      doc.text(group.taxableValue.toFixed(2), colTaxable, currentY);
      doc.text(`${group.gstRate}% - ${group.gstAmount.toFixed(2)}`, colIGST, currentY);
      doc.text(group.gstAmount.toFixed(2), colTotalTax, currentY);
      
      totalTaxableValue += group.taxableValue;
      totalIGST += group.gstAmount;
      
      currentY += rowHeight;
    });

    // Total row
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .rect(leftMargin, currentY - 5, rightMargin - leftMargin, rowHeight)
      .stroke();
    
    doc.font('Helvetica-Bold');
    doc.text('Total:', colHSN + 5, currentY);
    doc.text(totalTaxableValue.toFixed(2), colTaxable, currentY);
    doc.text(`IGST: ${totalIGST.toFixed(2)}`, colIGST, currentY);
    doc.text(totalIGST.toFixed(2), colTotalTax, currentY);

    // Tax amount in words
    currentY += 20;
    doc.fontSize(9).font('Helvetica');
    doc.text(`Tax Amount (in words): INR ${this.numberToWords(totalIGST)} Only`, leftMargin, currentY, { width: 500 });

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
    
    // Declaration (starts at same Y as bank details)
    let declarationY = 680;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Declaration:', 300, declarationY);
    
    declarationY += 15;
    doc
      .fontSize(8)
      .font('Helvetica')
      .text('We declare that this invoice shows the actual price of the goods', 300, declarationY, { width: 250 })
      .text('described and that all particulars are true and correct.', 300, declarationY + 10, { width: 250 });
    
    // Company signature (right side)
    position += 20;
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('for SS ENTERPRISES', 420, position);
    
    doc
      .fontSize(9)
      .text('Authorised Signatory', 420, position + 40);
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