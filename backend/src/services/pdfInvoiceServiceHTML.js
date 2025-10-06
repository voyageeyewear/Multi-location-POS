const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PDFInvoiceServiceHTML {
  constructor() {
    // Create invoices directory if it doesn't exist
    this.invoicesDir = path.join(__dirname, '../../invoices');
    if (!fs.existsSync(this.invoicesDir)) {
      fs.mkdirSync(this.invoicesDir, { recursive: true });
    }
  }

  async generateInvoicePDF(orderData) {
    try {
      const fileName = `${orderData.invoiceNumber}.pdf`;
      const filePath = path.join(this.invoicesDir, fileName);
      
      // Generate HTML content using the same template as frontend preview
      const htmlContent = this.generateInvoiceHTML(orderData);
      
      // Launch puppeteer and convert HTML to PDF
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        }
      });
      
      await browser.close();
      
      console.log(`✅ PDF generated: ${filePath}`);
      
      return {
        success: true,
        filePath: filePath,
        fileName: fileName
      };
      
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateInvoiceHTML(order) {
    const companySettings = {
      name: 'SS ENTERPRISES',
      address: 'C-7/31, Sector-7, Rohini Delhi-110085',
      gstin: '08AGFPK7804C1ZQ',
      stateName: 'Maharashtra',
      stateCode: '08',
      email: 'ssenterprise255@gmail.com'
    };

    // Process individual items
    const processedItems = (order.items || []).map(item => {
      const productType = item.productType || 'sunglasses';
      const hsnCode = item.hsnCode || (productType === 'eyeglasses' ? '90031900' : '90041000');
      const gstRate = item.gstRate || (productType === 'eyeglasses' ? 5 : 18);

      const description = item.title || item.name || item.productName || (productType === 'sunglasses' ? 'Sunglasses' : 'Eyeglasses');
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      const originalAmount = price * quantity;
      const discountAmount = item.discountAmount || 0;
      const discountPercentage = item.discountPercentage || 0;
      const amountBeforeGST = originalAmount - discountAmount;
      const gstAmount = (amountBeforeGST * gstRate) / 100;
      const totalAmount = amountBeforeGST + gstAmount;

      return {
        hsnCode,
        description,
        quantity,
        price,
        originalAmount,
        discountAmount,
        discountPercentage,
        amountBeforeGST,
        gstRate,
        gstAmount,
        totalAmount
      };
    });

    const totalQuantity = processedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalBeforeDiscount = processedItems.reduce((sum, item) => sum + item.originalAmount, 0);
    const totalDiscount = processedItems.reduce((sum, item) => sum + item.discountAmount, 0);
    const subtotalAfterDiscount = processedItems.reduce((sum, item) => sum + item.amountBeforeGST, 0);
    const totalGST = processedItems.reduce((sum, item) => sum + item.gstAmount, 0);
    const grandTotal = processedItems.reduce((sum, item) => sum + item.totalAmount, 0);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${order.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.3;
            color: #000;
            background: white;
            padding: 10px;
        }

        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
        }

        .header-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-bottom: 2px solid #000;
        }

        .company-section {
            border-right: 2px solid #000;
            padding: 10px;
        }

        .company-logo {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .company-details {
            font-size: 9px;
            line-height: 1.4;
        }

        .invoice-info-section {
            padding: 10px;
        }

        .invoice-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 2px 10px;
            font-size: 9px;
        }

        .invoice-grid strong {
            font-weight: 600;
        }

        .buyer-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-bottom: 2px solid #000;
        }

        .buyer-left, .buyer-right {
            padding: 10px;
            font-size: 9px;
        }

        .buyer-left {
            border-right: 2px solid #000;
        }

        .section-title {
            font-weight: bold;
            margin-bottom: 5px;
            text-decoration: underline;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
        }

        .items-table th {
            border: 1px solid #000;
            border-left: none;
            border-right: none;
            padding: 5px;
            font-size: 9px;
            font-weight: 600;
            text-align: center;
            background-color: #f5f5f5;
        }

        .items-table td {
            border: 1px solid #000;
            border-left: none;
            border-right: none;
            padding: 5px;
            font-size: 9px;
        }

        .items-table td:first-child,
        .items-table th:first-child {
            border-left: none;
        }

        .items-table td:last-child,
        .items-table th:last-child {
            border-right: none;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        .discount-row {
            font-style: italic;
            background-color: #f9f9f9;
        }

        .total-row {
            font-weight: bold;
            background-color: #f5f5f5;
        }

        .tax-summary-section {
            border-top: 2px solid #000;
            padding: 10px;
        }

        .tax-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .tax-table th, .tax-table td {
            border: 1px solid #000;
            padding: 5px;
            font-size: 9px;
            text-align: center;
        }

        .tax-table th {
            background-color: #f5f5f5;
            font-weight: 600;
        }

        .amount-words {
            margin-top: 10px;
            padding: 10px;
            border-top: 2px solid #000;
            font-size: 9px;
            font-weight: bold;
        }

        .bank-details {
            padding: 10px;
            border-top: 2px solid #000;
            font-size: 9px;
        }

        .declaration {
            padding: 10px;
            border-top: 2px solid #000;
            font-size: 9px;
        }

        .footer {
            padding: 10px;
            border-top: 2px solid #000;
            text-align: right;
        }

        .signature-section {
            text-align: right;
            margin-top: 30px;
        }

        .computer-generated {
            text-align: center;
            margin-top: 10px;
            font-size: 9px;
            font-style: italic;
        }
    </style>
</head>
<body>
<div class="invoice-container">
    <!-- Header Section -->
    <div class="header-section">
        <div class="company-section">
            <div class="company-logo">
                V ${companySettings.name}
            </div>
            <div class="company-details">
                ${companySettings.address}<br/>
                GSTIN/UIN: ${companySettings.gstin}<br/>
                E-Mail: ${companySettings.email}
            </div>
        </div>
        <div class="invoice-info-section">
            <div class="invoice-grid">
                <strong>Invoice No.:</strong><span>${order.invoiceNumber}</span>
                <strong>e-Way Bill No.:</strong><span>TT1866418</span>
                <strong>Dated:</strong><span>${new Date(order.timestamp).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
                <strong>Delivery Note:</strong><span>Mode/Terms of Payment</span>
                <strong>Reference No. & Date:</strong><span>Other References</span>
                <strong>Buyer's Order No.:</strong><span></span>
                <strong>Dated:</strong><span></span>
                <strong>Dispatch Doc No.:</strong><span>Delivery Note Date</span>
                <strong>Dispatched through:</strong><span>Destination</span>
                <strong>Terms of Delivery:</strong><span></span>
            </div>
        </div>
    </div>
    
    <!-- Buyer Information -->
    <div class="buyer-section">
        <div class="buyer-left">
            <div class="section-title">Consignee (Ship to)</div>
            <strong>${order.customerName}</strong><br/>
            ${order.location?.city || order.city || 'Mumbai'}<br/>
            ${order.location?.city || 'Mumbai'}, ${order.location?.state || 'Maharashtra'}<br/>
            GSTIN/UIN: ${companySettings.gstin}<br/>
            State Name: ${order.location?.state || 'Maharashtra'}, Code: ${companySettings.stateCode}
        </div>
        <div class="buyer-right">
            <div class="section-title">Buyer (Bill to)</div>
            <strong>${order.customerName}</strong><br/>
            ${order.location?.city || order.city || 'Mumbai'}<br/>
            ${order.location?.city || 'Mumbai'}, ${order.location?.state || 'Maharashtra'}<br/>
            Buyer's Order No.:<br/>
            Dated:
        </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
        <thead>
            <tr>
                <th>Sl No.</th>
                <th>Description of Goods</th>
                <th>HSN/SAC</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>per</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${processedItems.map((item, index) => `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-left">${item.description}</td>
                    <td class="text-center">${item.hsnCode}</td>
                    <td class="text-center">${item.quantity} pcs</td>
                    <td class="text-right">${item.price.toFixed(2)}</td>
                    <td class="text-center">pcs</td>
                    <td class="text-right">${item.originalAmount.toFixed(2)}</td>
                </tr>
                ${item.discountAmount > 0 ? `
                <tr class="discount-row">
                    <td colspan="6" class="text-right">Discount (${item.discountPercentage.toFixed(2)}%)</td>
                    <td class="text-right">-${item.discountAmount.toFixed(2)}</td>
                </tr>
                ` : ''}
            `).join('')}
            <tr class="total-row">
                <td colspan="3" class="text-right">Total</td>
                <td class="text-center">${totalQuantity} pcs</td>
                <td colspan="2"></td>
                <td class="text-right">₹ ${subtotalAfterDiscount.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>

    <!-- Amount in Words -->
    <div class="amount-words">
        Amount Chargeable (in words): <strong>INR ${this.numberToWords(grandTotal)} Only</strong>
    </div>

    <!-- Tax Summary -->
    <div class="tax-summary-section">
        <table class="tax-table">
            <thead>
                <tr>
                    <th rowspan="2">HSN/SAC</th>
                    <th rowspan="2">Taxable Value</th>
                    <th colspan="2">IGST</th>
                    <th rowspan="2">Total Tax Amount</th>
                </tr>
                <tr>
                    <th>Rate</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${processedItems.map(item => `
                    <tr>
                        <td>${item.hsnCode}</td>
                        <td>${item.amountBeforeGST.toFixed(2)}</td>
                        <td>${item.gstRate}%</td>
                        <td>${item.gstAmount.toFixed(2)}</td>
                        <td>${item.gstAmount.toFixed(2)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td><strong>Total</strong></td>
                    <td><strong>${subtotalAfterDiscount.toFixed(2)}</strong></td>
                    <td colspan="2"><strong>${totalGST.toFixed(2)}</strong></td>
                    <td><strong>${totalGST.toFixed(2)}</strong></td>
                </tr>
            </tbody>
        </table>
        
        <div style="margin-top: 10px; font-size: 9px;">
            <strong>Tax Amount (in words):</strong> INR ${this.numberToWords(totalGST)} Only
        </div>
    </div>

    <!-- Bank Details -->
    <div class="bank-details">
        <strong>Company's Bank Details</strong><br/>
        Bank Name: <strong>Kotak Mahindra Bank</strong><br/>
        A/c No.: <strong>2512756649</strong><br/>
        Branch & IFS Code: <strong>KKBK0004485</strong>
    </div>

    <!-- Declaration -->
    <div class="declaration">
        <strong>Declaration:</strong><br/>
        We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
        
        <div class="signature-section">
            for <strong>SS ENTERPRISES</strong><br/><br/><br/>
            <strong>Authorised Signatory</strong>
        </div>
    </div>

    <!-- Footer -->
    <div class="computer-generated">
        This is a Computer Generated Invoice
    </div>
</div>
</body>
</html>
    `;
  }

  numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    let integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let words = '';

    // Lakhs
    if (integerPart >= 100000) {
      words += this.convertHundreds(Math.floor(integerPart / 100000)) + ' Lakh ';
      integerPart %= 100000;
    }

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
      words += ones[num] + ' ';
    }

    return words.trim();
  }
}

module.exports = new PDFInvoiceServiceHTML();

