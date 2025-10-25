const AppDataSource = require('../config/database');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const pdfInvoiceService = require('../services/pdfInvoiceService');

class InvoiceController {
  static async generateInvoice(req, res, next) {
    try {
      const { saleId } = req.params;
      const { format = 'pdf' } = req.query; // pdf or html
      
      // Check if order data is passed in request body (for Shopify orders)
      const orderData = req.body || req.query;
      
      if (orderData && orderData.invoiceNumber) {
        // Direct order data provided (from frontend)
        console.log('📄 Generating invoice for order:', orderData.invoiceNumber);
        console.log('📋 Customer Name:', orderData.customerName);
        console.log('📋 Customer Address:', orderData.customerAddress);
        console.log('📋 Customer GST:', orderData.customerGstNumber);
        console.log('📋 Full order data:', JSON.stringify(orderData, null, 2));
        
        const invoicePayload = {
          invoiceNumber: orderData.invoiceNumber || saleId,
          timestamp: orderData.timestamp || orderData.createdAt || new Date().toISOString(),
          customerName: orderData.customerName || 'Customer',
          customerAddress: orderData.customerAddress || '',
          customerGstNumber: orderData.customerGstNumber || '',
          location: orderData.location || {
            city: orderData.city || 'Mumbai',
            state: orderData.state || 'Maharashtra',
            gstNumber: '08AGFPK7804C1ZQ'
          },
          items: (orderData.items || []).map(item => ({
            title: item.title || item.name || 'Product',
            hsnCode: item.hsnCode || '90041000',
            quantity: item.quantity || 1,
            price: parseFloat(item.price || 0),
            gstRate: item.gstRate || 18,
            discountAmount: parseFloat(item.discountAmount || 0)
          }))
        };
        
        // Generate PDF using new service
        const result = await pdfInvoiceService.generateInvoicePDF(invoicePayload);
        
        // Send the PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 
          format === 'html' 
            ? `inline; filename="${result.fileName}"` 
            : `attachment; filename="${result.fileName}"`
        );
        return res.sendFile(result.filePath);
      }
      
      // Fallback: Try to get from database (for POS sales)
      const saleRepository = AppDataSource.getRepository('Sale');
      const saleItemRepository = AppDataSource.getRepository('SaleItem');
      const companyRepository = AppDataSource.getRepository('Company');
      
      // Get sale with all related data
      const sale = await saleRepository.findOne({
        where: { id: saleId },
        relations: ['location']
      });
      
      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found. Please ensure the sale exists in the database.'
        });
      }
      
      // Get sale items with products
      const saleItems = await saleItemRepository.find({
        where: { saleId: saleId },
        relations: ['product']
      });
      
      // Get company information
      const company = await companyRepository.findOne({
        where: { id: req.companyId || 1 }
      });
      
      // Map database sale to order format
      const invoicePayload = {
        invoiceNumber: sale.orderNumber,
        timestamp: sale.createdAt,
        customerName: sale.customerName || 'Walk-in Customer',
        location: {
          city: sale.location?.city || company?.stateName || 'Mumbai',
          state: sale.location?.state || company?.stateName || 'Maharashtra',
          gstNumber: company?.gstin || '08AGFPK7804C1ZQ'
        },
        items: saleItems.map(item => ({
          title: item.product?.name || 'Product',
          hsnCode: item.product?.hsnCode || '90041000',
          quantity: item.quantity,
          price: parseFloat(item.unitPrice),
          gstRate: item.product?.gstRate || 18,
          discountAmount: parseFloat(item.discountAmount) || 0
        }))
      };
      
      // Generate PDF using new service
      const result = await pdfInvoiceService.generateInvoicePDF(invoicePayload);
      
      // Send the PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 
        format === 'html' 
          ? `inline; filename="${result.fileName}"` 
          : `attachment; filename="${result.fileName}"`
      );
      return res.sendFile(result.filePath);
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      next(error);
    }
  }
  
  static generateInvoiceHTML(data) {
    const { company, customer, invoice } = data;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.number}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
                background: white;
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: white;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }
            
            .company-info h1 {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .company-info p {
                margin: 2px 0;
                font-size: 11px;
            }
            
            .invoice-details {
                text-align: right;
            }
            
            .invoice-details h2 {
                font-size: 18px;
                margin-bottom: 10px;
            }
            
            .invoice-details p {
                margin: 2px 0;
                font-size: 11px;
            }
            
            .customer-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            
            .customer-info, .consignee-info {
                flex: 1;
                margin-right: 20px;
            }
            
            .customer-info h3, .consignee-info h3 {
                font-size: 14px;
                margin-bottom: 10px;
                text-decoration: underline;
            }
            
            .customer-info p, .consignee-info p {
                margin: 2px 0;
                font-size: 11px;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            
            .items-table th, .items-table td {
                border: 1px solid #333;
                padding: 8px;
                text-align: left;
                font-size: 11px;
            }
            
            .items-table th {
                background-color: #f5f5f5;
                font-weight: bold;
            }
            
            .items-table .text-center {
                text-align: center;
            }
            
            .items-table .text-right {
                text-align: right;
            }
            
            .tax-summary {
                margin-top: 20px;
            }
            
            .tax-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            
            .tax-table th, .tax-table td {
                border: 1px solid #333;
                padding: 8px;
                text-align: center;
                font-size: 11px;
            }
            
            .tax-table th {
                background-color: #f5f5f5;
                font-weight: bold;
            }
            
            .total-section {
                margin-top: 20px;
                text-align: right;
            }
            
            .total-row {
                display: flex;
                justify-content: flex-end;
                margin: 5px 0;
            }
            
            .total-label {
                width: 200px;
                text-align: right;
                padding-right: 10px;
                font-weight: bold;
            }
            
            .total-value {
                width: 100px;
                text-align: right;
                border-bottom: 1px solid #333;
            }
            
            .amount-in-words {
                margin-top: 20px;
                font-style: italic;
            }
            
            .declaration {
                margin-top: 30px;
                font-size: 11px;
            }
            
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 11px;
            }
            
            .signature-section {
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
            }
            
            .signature-box {
                text-align: center;
                width: 200px;
            }
            
            .signature-line {
                border-top: 1px solid #333;
                margin-top: 40px;
                padding-top: 5px;
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <div class="company-info">
                    <h1>${company.name}</h1>
                    <p>${company.address}</p>
                    <p>GSTIN/UIN: ${company.gstin || 'N/A'}</p>
                    <p>State Name: ${company.stateName || 'N/A'}, Code: ${company.stateCode || 'N/A'}</p>
                </div>
                <div class="invoice-details">
                    <h2>TAX INVOICE</h2>
                    <p><strong>Invoice No.:</strong> ${invoice.number}</p>
                    <p><strong>Dated:</strong> ${invoice.date}</p>
                    <p><strong>Mode/Terms of Payment:</strong> ${invoice.paymentMethod || 'Cash'}</p>
                </div>
            </div>
            
            <!-- Customer Information -->
            <div class="customer-section">
                <div class="customer-info">
                    <h3>Consignee (Ship to) / Buyer (Bill to)</h3>
                    <p><strong>${customer.name}</strong></p>
                    <p>${customer.address}</p>
                    <p>GSTIN/UIN: ${customer.gstin || 'N/A'}</p>
                    <p>State Name: ${customer.stateName || 'N/A'}, Code: ${customer.stateCode || 'N/A'}</p>
                </div>
                <div class="consignee-info">
                    <h3>Consignee (Ship to) / Buyer (Bill to)</h3>
                    <p><strong>${customer.name}</strong></p>
                    <p>${customer.address}</p>
                    <p>GSTIN/UIN: ${customer.gstin || 'N/A'}</p>
                    <p>State Name: ${customer.stateName || 'N/A'}, Code: ${customer.stateCode || 'N/A'}</p>
                </div>
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>SI No.</th>
                        <th>Description of Goods</th>
                        <th>HSN/SAC</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>per</th>
                        <th>Disc. %</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map((item, index) => `
                        <tr>
                            <td class="text-center">${index + 1}</td>
                            <td>${item.description}</td>
                            <td class="text-center">${item.hsn}</td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-right">${item.rate.toFixed(2)}</td>
                            <td class="text-center">${item.unit}</td>
                            <td class="text-center">${item.discount > 0 ? item.discount.toFixed(2) : ''}</td>
                            <td class="text-right">${item.amount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Tax Summary -->
            <div class="tax-summary">
                <table class="tax-table">
                    <thead>
                        <tr>
                            <th>HSN/SAC</th>
                            <th>Taxable Value</th>
                            <th>Central Tax</th>
                            <th>State Tax</th>
                            <th>Total Tax Amount</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            <th>Rate</th>
                            <th>Amount</th>
                            <th>Rate</th>
                            <th>Amount</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${invoice.items[0]?.hsn || '1005'}</td>
                            <td class="text-right">${invoice.subtotal.toFixed(2)}</td>
                            <td class="text-center">${invoice.cgstRate}%</td>
                            <td class="text-right">${invoice.cgstAmount.toFixed(2)}</td>
                            <td class="text-center">${invoice.sgstRate}%</td>
                            <td class="text-right">${invoice.sgstAmount.toFixed(2)}</td>
                            <td class="text-right">${invoice.totalTaxAmount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>Total</strong></td>
                            <td class="text-right"><strong>${invoice.subtotal.toFixed(2)}</strong></td>
                            <td></td>
                            <td class="text-right"><strong>${invoice.cgstAmount.toFixed(2)}</strong></td>
                            <td></td>
                            <td class="text-right"><strong>${invoice.sgstAmount.toFixed(2)}</strong></td>
                            <td class="text-right"><strong>${invoice.totalTaxAmount.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <!-- Total Section -->
            <div class="total-section">
                <div class="total-row">
                    <div class="total-label">Total Quantity:</div>
                    <div class="total-value">${invoice.items.reduce((sum, item) => sum + item.quantity, 0)} No</div>
                </div>
                <div class="total-row">
                    <div class="total-label">Total Amount:</div>
                    <div class="total-value">₹ ${invoice.total.toFixed(2)}</div>
                </div>
                <div class="amount-in-words">
                    <strong>Amount Chargeable (in words):</strong> Indian Rupee ${InvoiceController.numberToWords(invoice.total)} Only
                </div>
            </div>
            
            <!-- Declaration -->
            <div class="declaration">
                <p><strong>Declaration:</strong></p>
                <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p>E. & O.E (Errors and Omissions Excepted)</p>
            </div>
            
            <!-- Signature Section -->
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-line">
                        <p>for ${company.name}</p>
                        <p>Authorised Signatory</p>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>This is a Computer Generated Invoice</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
  
  static async generateInvoicePDF(data) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      const html = InvoiceController.generateInvoiceHTML(data);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });
      
      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }
  
  static numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const convertHundreds = (n) => {
      let result = '';
      if (n > 99) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n > 19) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n > 9) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };
    
    const convertThousands = (n) => {
      let result = '';
      if (n > 99999) {
        result += convertHundreds(Math.floor(n / 100000)) + 'Lakh ';
        n %= 100000;
      }
      if (n > 999) {
        result += convertHundreds(Math.floor(n / 1000)) + 'Thousand ';
        n %= 1000;
      }
      if (n > 0) {
        result += convertHundreds(n);
      }
      return result.trim();
    };
    
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);
    
    let result = convertThousands(integerPart);
    
    if (decimalPart > 0) {
      result += ' and ' + convertHundreds(decimalPart) + 'Paise';
    }
    
    return result;
  }
}

module.exports = InvoiceController;
