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
        const doc = new PDFDocument({ margin: 50 });
        
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
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(orderData.location?.name || 'SS ENTERPRISES', 50, 45)
      .fontSize(10)
      .font('Helvetica')
      .text(orderData.location?.address || 'C-7/31, Sector-7, Rohini Delhi-110085', 50, 70)
      .text(`GSTIN/UIN: ${orderData.location?.gstNumber || '08AGFPK7804C1ZQ'}`, 50, 85)
      .text(`Email: ${orderData.location?.email || 'ssenterprise255@gmail.com'}`, 50, 100)
      .moveDown();

    // Invoice details on the right
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`Invoice No: ${orderData.invoiceNumber}`, 400, 50, { align: 'right' })
      .font('Helvetica')
      .text(`e-Way Bill No: ${orderData.eWayBillNo || 'TT1866418'}`, 400, 65, { align: 'right' })
      .text(`Date: ${new Date(orderData.timestamp).toLocaleDateString('en-IN')}`, 400, 80, { align: 'right' })
      .text(`Mode/Terms of Payment: ${orderData.paymentMethod || 'Cash'}`, 400, 95, { align: 'right' })
      .moveDown();

    // Draw line
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, 130)
      .lineTo(550, 130)
      .stroke();
  }

  generateCustomerInformation(doc, orderData) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Buyer (Bill to):', 50, 145)
      .fontSize(10)
      .font('Helvetica')
      .text(orderData.customerName || 'Customer', 50, 165)
      .text(orderData.customerAddress || 'Ahmedabad, Gujarat', 50, 180)
      .text(`Buyer's Order No.: ${orderData.buyerOrderNo || ''}`, 50, 195)
      .moveDown();

    // Draw line
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, 220)
      .lineTo(550, 220)
      .stroke();
  }

  generateInvoiceTable(doc, orderData) {
    let i;
    const tableTop = 240;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 320;
    const rateX = 380;
    const amountX = 480;

    // Table Header
    doc.font('Helvetica-Bold');
    this.generateTableRow(
      doc,
      tableTop,
      'SI No.',
      'Description of Goods',
      'Quantity',
      'Rate',
      'Amount'
    );

    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, tableTop + 20)
      .lineTo(550, tableTop + 20)
      .stroke();

    // Table Rows
    doc.font('Helvetica');
    let position = tableTop + 30;

    orderData.items.forEach((item, index) => {
      this.generateTableRow(
        doc,
        position,
        (index + 1).toString(),
        item.title,
        `${item.quantity} pcs`,
        `₹${item.price.toFixed(2)}`,
        `₹${(item.price * item.quantity).toFixed(2)}`
      );
      position += 25;
    });

    // Draw line
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, position)
      .lineTo(550, position)
      .stroke();

    // Totals
    position += 10;
    doc.font('Helvetica-Bold');
    this.generateTableRow(
      doc,
      position,
      '',
      '',
      `Total: ${orderData.items.reduce((sum, item) => sum + item.quantity, 0)} pcs`,
      '',
      `₹${orderData.subtotal.toFixed(2)}`
    );

    // GST Breakdown
    position += 30;
    doc.font('Helvetica');
    
    // IGST/CGST/SGST section
    if (orderData.gstBreakdown) {
      const taxableAmount = orderData.subtotal;
      const gstRate = 18; // 18% GST
      
      doc.text('HSN/SAC: 90041000', 50, position);
      doc.text('Taxable Value:', 320, position);
      doc.text(`₹${taxableAmount.toFixed(2)}`, 480, position, { align: 'right' });
      
      position += 20;
      doc.text(`IGST Rate: ${gstRate}%`, 320, position);
      doc.text(`₹${orderData.tax.toFixed(2)}`, 480, position, { align: 'right' });
    }

    // Draw line
    position += 25;
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(2)
      .moveTo(50, position)
      .lineTo(550, position)
      .stroke();

    // Grand Total
    position += 10;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total:', 320, position);
    doc.text(`₹${orderData.total.toFixed(2)}`, 480, position, { align: 'right' });

    // Amount in words
    position += 25;
    doc.fontSize(10).font('Helvetica');
    doc.text(`Amount Chargeable (in words): INR ${this.numberToWords(orderData.total)} Only`, 50, position);

    return position;
  }

  generateTableRow(doc, y, col1, col2, col3, col4, col5) {
    doc
      .fontSize(10)
      .text(col1, 50, y, { width: 90 })
      .text(col2, 150, y, { width: 160 })
      .text(col3, 320, y, { width: 50 })
      .text(col4, 380, y, { width: 90 })
      .text(col5, 480, y, { width: 100, align: 'right' });
  }

  generateFooter(doc, orderData) {
    const bottomPosition = 650;
    
    doc
      .fontSize(10)
      .font('Helvetica-Italic')
      .text('Declaration:', 50, bottomPosition)
      .font('Helvetica')
      .text(
        'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
        50,
        bottomPosition + 15,
        { width: 350 }
      );

    // Company signature
    doc
      .font('Helvetica-Bold')
      .text(`for ${orderData.location?.name || 'SS ENTERPRISES'}`, 400, bottomPosition + 20)
      .moveDown()
      .font('Helvetica-Italic')
      .text('Authorised Signatory', 400, bottomPosition + 50);

    // Footer note
    doc
      .fontSize(8)
      .font('Helvetica-Italic')
      .text(
        'This is a Computer Generated Invoice',
        50,
        720,
        { align: 'center', width: 500 }
      );
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

