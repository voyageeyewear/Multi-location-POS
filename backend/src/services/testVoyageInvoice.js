const InvoiceGenerator = require('./voyageInvoiceGenerator');

// Sample data
const sampleProducts = [
  {
    id: '1',
    title: 'Classic Sunglasses',
    fullTitle: 'Ray-Ban Classic Aviator Sunglasses',
    sku: 'RB-001',
    price: 2500.00
  },
  {
    id: '2',
    title: 'Sports Sunglasses',
    fullTitle: 'Oakley Sports Sunglasses',
    sku: 'OK-002',
    price: 3200.00
  },
  {
    id: '3',
    title: 'Reading Glasses',
    fullTitle: 'Premium Reading Eyeglasses Frame',
    sku: 'RF-003',
    price: 1800.00
  },
  {
    id: '4',
    title: 'Designer Frame',
    fullTitle: 'Designer Optical Frame',
    sku: 'DF-004',
    price: 4500.00
  },
  {
    id: '5',
    title: 'Polarized Sunglasses',
    fullTitle: 'Polarized UV Protection Sunglasses',
    sku: 'PS-005',
    price: 3800.00
  }
];

const sampleCustomers = [
  { name: 'Rajesh Kumar' },
  { name: 'Priya Sharma' },
  { name: 'Amit Patel' },
  { name: 'Sneha Reddy' },
  { name: 'Vikram Singh' }
];

const sampleAddresses = [
  { street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', zip: '400001' },
  { street: '456 Park Street', city: 'Delhi', state: 'Delhi', zip: '110001' },
  { street: '789 Brigade Road', city: 'Bangalore', state: 'Karnataka', zip: '560001' },
  { street: '321 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', zip: '600001' },
  { street: '654 Lake Palace Road', city: 'Udaipur', state: 'Rajasthan', zip: '313001' }
];

// Create invoice generator
const generator = new InvoiceGenerator(sampleProducts, sampleCustomers, sampleAddresses);

// Generate a test invoice
async function generateTestInvoice() {
  try {
    console.log('🚀 Generating test invoice with Voyage Eyewear design...\n');

    const result = await generator.generateInvoice(
      '2024/001',           // Invoice number
      'Cash',               // Payment method
      3,                    // Total quantity
      '15-10-2024',        // Start date (DD-MM-YYYY)
      '15-10-2024',        // End date (DD-MM-YYYY)
      'udaipur',           // Location (udaipur or dehradun)
      null                 // Target amount (null for random)
    );

    console.log('✅ Invoice generated successfully!\n');
    console.log('📄 Invoice Details:');
    console.log(`   Invoice Number: VOY${result.invoiceNumber}`);
    console.log(`   Customer: ${result.customer}`);
    console.log(`   Date: ${result.date}`);
    console.log(`   Amount: ₹${result.amount.toFixed(2)}`);
    console.log(`   Quantity: ${result.quantity}`);
    console.log(`   Items: ${result.itemCount}`);
    console.log(`   File: ${result.fileName}`);
    console.log(`   Path: ${result.filePath}`);
    console.log('\n📦 Items:');
    result.items_array.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.name} - Qty: ${item.quantity} - Price: ₹${item.unitPrice.toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ Error generating invoice:', error);
  }
}

// Generate invoice with custom data
async function generateCustomInvoice() {
  try {
    console.log('\n🚀 Generating custom invoice...\n');

    const customCustomer = {
      name: 'John Doe',
      address: '456 Park Avenue',
      city: 'Udaipur',
      state: 'Rajasthan',
      pincode: '313001'
    };

    const customItems = [
      {
        name: 'Polarized Sunglasses Premium',
        quantity: 2,
        unitPrice: 2500.00
      },
      {
        name: 'Designer Eyeglasses Frame',
        quantity: 1,
        unitPrice: 1800.00
      }
    ];

    const result = await generator.generateEditedInvoice(
      '2024/002',           // Invoice number
      'UPI',                // Payment method
      3,                    // Total quantity
      '15 Oct 2024',       // Date (formatted)
      'udaipur',           // Location
      customCustomer,      // Customer object
      customItems,         // Items array
      null                 // Target amount
    );

    console.log('✅ Custom invoice generated successfully!\n');
    console.log('📄 Invoice Details:');
    console.log(`   Invoice Number: VOY${result.invoiceNumber}`);
    console.log(`   Customer: ${result.customer}`);
    console.log(`   Date: ${result.date}`);
    console.log(`   Amount: ₹${result.amount.toFixed(2)}`);
    console.log(`   File: ${result.fileName}`);
    console.log(`   Path: ${result.filePath}`);

  } catch (error) {
    console.error('❌ Error generating custom invoice:', error);
  }
}

// Run the tests
(async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('       VOYAGE EYEWEAR INVOICE GENERATOR TEST');
  console.log('═══════════════════════════════════════════════════════\n');

  await generateTestInvoice();
  await generateCustomInvoice();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                    TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');
})();

