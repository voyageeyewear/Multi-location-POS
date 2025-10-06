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
        
        // Create PDF document with proper margins
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
        this.generateInvoiceTable(doc, orderData);
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
    const leftMargin = 50;
    const rightMargin = pageWidth - 50;
    
    // Company name with "V" logo
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('V', leftMargin, 45, { continued: true })
      .fontSize(20)
      .text('  SS ENTERPRISES', { continued: false });

    // Company details (left side)
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('C-7/31, Sector-7, Rohini Delhi-110085', leftMargin, 78)
      .text('GSTIN/UIN: 08AGFPK7804C1ZQ', leftMargin, 91)
      .text('E-Mail: ssenterprise255@gmail.com', leftMargin, 104);

    // Invoice details box (right side) - properly aligned
    const boxX = 340;
    const boxY = 40;
    const boxWidth = 210;
    const boxHeight = 115;
    
    doc
      .rect(boxX, boxY, boxWidth, boxHeight)
      .stroke();
    
    // Invoice details with proper alignment
    const labelX = boxX + 10;
    const valueX = boxX + 100;
    let currentY = boxY + 12;
    const lineHeight = 15;
    
    doc.fontSize(9);
    
    // Invoice No
    doc.font('Helvetica-Bold').text('Invoice No:', labelX, currentY);
    doc.font('Helvetica').text(orderData.invoiceNumber || 'MUMBVOYA-00001', valueX, currentY);
    currentY += lineHeight;
    
    // e-Way Bill No
    doc.font('Helvetica-Bold').text('e-Way Bill No.:', labelX, currentY);
    doc.font('Helvetica').text('TT1866418', valueX, currentY);
    currentY += lineHeight;
    
    // Dated
    doc.font('Helvetica-Bold').text('Dated:', labelX, currentY);
    doc.font('Helvetica').text(new Date(orderData.timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }), valueX, currentY);
    currentY += lineHeight;
    
    // Delivery Note
    doc.font('Helvetica-Bold').text('Delivery Note:', labelX, currentY);
    doc.font('Helvetica').text('Mode/Terms of Payment', valueX, currentY, { width: 100 });
    currentY += lineHeight;
    
    // Reference No
    doc.font('Helvetica-Bold').text('Reference No. & Date:', labelX, currentY, { width: 85 });
    doc.font('Helvetica').text('Other References', valueX, currentY);
    currentY += lineHeight;
    
    // Buyer's Order No
    doc.font('Helvetica-Bold').text('Buyer\'s Order No.:', labelX, currentY);
  }

  generateCustomerInformation(doc, orderData) {
    const startY = 175;
    const leftBoxX = 50;
    const rightBoxX = 305;
    const boxWidth = 245;
    const boxHeight = 105;
    
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
    const lineHeight = 13;

    // Consignee (Ship to) - Left side
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Consignee (Ship to)', leftBoxX + padding, leftY);
    leftY += lineHeight;
    
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(orderData.customerName || 'Dhruv', leftBoxX + padding, leftY);
    leftY += lineHeight;
    
    doc.text(orderData.location?.city || 'Mumbai', leftBoxX + padding, leftY);
    leftY += lineHeight;
    
    doc.text(`${orderData.location?.city || 'Mumbai'}, ${orderData.location?.city || 'Mumbai'}`, leftBoxX + padding, leftY);
    leftY += lineHeight;
    
    doc.text('GSTIN/UIN: N/A', leftBoxX + padding, leftY);
    leftY += lineHeight;
    
    doc.text(`State Name: ${orderData.location?.city || 'Mumbai'}, Code: 08`, leftBoxX + padding, leftY);

    // Buyer (Bill to) - Right side
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Buyer (Bill to)', rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(orderData.customerName || 'Dhruv', rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    doc.text(orderData.location?.city || 'Mumbai', rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    doc.text(`${orderData.location?.city || 'Mumbai'}, ${orderData.location?.city || 'Mumbai'}`, rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    doc.text('Buyer\'s Order No.:', rightBoxX + padding, rightY);
    rightY += lineHeight;
    
    doc.text('Dated:', rightBoxX + padding, rightY);
  }

  generateInvoiceTable(doc, orderData) {
    const tableTop = 300;
    const leftMargin = 50;
    const rightMargin = 550;
    
    // Column positions - properly aligned
    const col1X = leftMargin;        // SI No
    const col2X = 100;               // Description
    const col3X = 370;               // Quantity  
    const col4X = 440;               // Rate
    const col5X = rightMargin;       // Amount (right-aligned)
    
    // Table Header
    doc
      .fontSize(10)
      .font('Helvetica-Bold');
    
    doc.text('SI No.', col1X, tableTop);
    doc.text('Description of Goods', col2X, tableTop);
    doc.text('Quantity', col3X, tableTop);
    doc.text('Rate', col4X, tableTop);
    doc.text('Amount', col5X - 60, tableTop);

    // Header underline
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .moveTo(leftMargin, tableTop + 15)
      .lineTo(rightMargin, tableTop + 15)
      .stroke();

    // Table Rows with dynamic height for text wrapping
    doc.fontSize(9).font('Helvetica');
    let currentY = tableTop + 25;
    const baseRowHeight = 20;
    const lineHeight = 12;

    orderData.items.forEach((item, index) => {
      // Calculate price after discount
      const originalPrice = item.price || 0;
      const discountAmount = item.discountAmount || 0;
      const discountPercentage = item.discountPercentage || 0;
      
      // Calculate final price (price already includes discount if any)
      const finalPrice = originalPrice;
      const itemTotal = (finalPrice * item.quantity).toFixed(2);
      
      // Calculate text height for product name (with wrapping)
      const productName = item.title || item.name || 'Product';
      const descriptionWidth = 260;
      const textHeight = doc.heightOfString(productName, { 
        width: descriptionWidth,
        lineGap: 2
      });
      
      // Dynamic row height based on text
      const rowHeight = Math.max(baseRowHeight, textHeight + 6);
      
      // Row number
      doc.text((index + 1).toString(), col1X, currentY, { width: 40 });
      
      // Product name with text wrapping
      doc.text(productName, col2X, currentY, { 
        width: descriptionWidth,
        lineGap: 2
      });
      
      // Quantity
      doc.text(`${item.quantity} pcs`, col3X, currentY, { width: 60 });
      
      // Rate (with discount indication if applicable)
      if (discountAmount > 0 || discountPercentage > 0) {
        // Show original price struck through
        const originalPriceY = currentY;
        doc.fontSize(8);
        doc.text(`₹${(originalPrice + (discountAmount / item.quantity)).toFixed(2)}`, col4X, originalPriceY, { 
          strike: true,
          width: 60 
        });
        
        // Show discounted price
        doc.fontSize(9).fillColor('#059669').font('Helvetica-Bold');
        doc.text(`₹${finalPrice.toFixed(2)}`, col4X, originalPriceY + 10, { width: 60 });
        doc.fillColor('#000000').font('Helvetica');
        
        // Show discount percentage if available
        if (discountPercentage > 0) {
          doc.fontSize(7).fillColor('#dc2626');
          doc.text(`(${discountPercentage}% OFF)`, col4X, originalPriceY + 20, { width: 60 });
          doc.fillColor('#000000');
        }
        doc.fontSize(9);
      } else {
        doc.text(`₹${finalPrice.toFixed(2)}`, col4X, currentY, { width: 60 });
      }
      
      // Amount (right-aligned)
      doc.font('Helvetica-Bold');
      doc.text(`₹${itemTotal}`, col5X - 70, currentY, { 
        width: 70, 
        align: 'right' 
      });
      doc.font('Helvetica');
      
      currentY += rowHeight;
    });

    // Bottom line
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .moveTo(leftMargin, currentY)
      .lineTo(rightMargin, currentY)
      .stroke();

    // Totals section
    currentY += 10;
    doc.fontSize(10).font('Helvetica-Bold');
    
    const totalQty = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
    doc.text(`Total: ${totalQty} pcs`, col3X - 60, currentY);
    doc.text(`₹${orderData.subtotal.toFixed(2)}`, col5X - 70, currentY, { width: 70, align: 'right' });

    // GST Section
    currentY += 25;
    doc.fontSize(9).font('Helvetica');
    
    doc.text('HSN/SAC: 90041000', leftMargin, currentY);
    doc.text('Taxable Value:', 370, currentY);
    doc.text(`₹${orderData.subtotal.toFixed(2)}`, col5X - 70, currentY, { width: 70, align: 'right' });
    
    currentY += 15;
    doc.text('IGST Rate: 18%', 370, currentY);
    doc.text(`₹${orderData.tax.toFixed(2)}`, col5X - 70, currentY, { width: 70, align: 'right' });

    // Total line
    currentY += 20;
    doc
      .strokeColor('#000000')
      .lineWidth(2)
      .moveTo(leftMargin, currentY)
      .lineTo(rightMargin, currentY)
      .stroke();

    // Grand Total
    currentY += 10;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Total:', 370, currentY);
    doc.text(`₹${orderData.total.toFixed(2)}`, col5X - 70, currentY, { width: 70, align: 'right' });

    // Amount in words
    currentY += 25;
    doc.fontSize(10).font('Helvetica');
    doc.text(`Amount Chargeable (in words): INR ${this.numberToWords(orderData.total)} Only`, leftMargin, currentY, { width: 500 });

    return currentY;
  }

  generateFooter(doc, orderData) {
    let position = 560;
    const leftMargin = 50;
    
    // Bank Details
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
    doc.text('Branch & IFS Code: KKBK0004485', leftMargin, position);
    
    position += 35;
    
    // Declaration
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Declaration:', leftMargin, position);
    
    position += 15;
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('We declare that this invoice shows the actual price of the goods described and', leftMargin, position)
      .text('that all particulars are true and correct.', leftMargin, position + 12);
    
    // Company signature (right side)
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('for SS ENTERPRISES', 410, position);
    
    doc
      .moveDown(3)
      .text('Authorised Signatory', 410, position + 50);
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