let PDFDocument;
try {
  PDFDocument = require('pdfkit');
} catch (error) {
  console.warn('PDFKit not installed. PDF generation will be disabled.');
  PDFDocument = null;
}

// Generic PDF helper used by prescriptions/discharge
// opts: { title, subtitle, table: { headers: string[], rows: Array<object|string[]> }, keyValues: Array<{Field,Value}>|Array<[k,v]>, footer }
exports.generatePdf = (opts = {}) => {
  if (!PDFDocument) {
    throw new Error('PDFKit not installed');
  }
  const { title, subtitle, table, keyValues, footer } = opts;
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  const done = new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });

  if (title) doc.fontSize(18).text(title, { align: 'center' });
  if (subtitle) { doc.moveDown(0.5); doc.fontSize(12).text(subtitle, { align: 'center' }); }
  doc.moveDown();

  if (Array.isArray(keyValues) && keyValues.length) {
    doc.fontSize(12);
    keyValues.forEach(kv => {
      const k = Array.isArray(kv) ? kv[0] : (kv.Field || Object.keys(kv)[0]);
      const v = Array.isArray(kv) ? kv[1] : (kv.Value ?? kv[k]);
      doc.text(`${k}: ${v}`);
    });
    doc.moveDown();
  }

  if (table && Array.isArray(table.headers) && Array.isArray(table.rows)) {
    // Simple table
    const colXs = [];
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = Math.floor(pageWidth / table.headers.length);
    for (let i = 0; i < table.headers.length; i++) colXs.push(doc.x + i * colWidth);
    doc.font('Helvetica-Bold').fontSize(11);
    table.headers.forEach((h, i) => doc.text(String(h), colXs[i], doc.y, { width: colWidth }));
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10);
    table.rows.forEach(row => {
      const cells = Array.isArray(row) ? row : table.headers.map(h => row[h] ?? '');
      cells.forEach((c, i) => doc.text(String(c), colXs[i], doc.y, { width: colWidth }));
      doc.moveDown(0.2);
    });
    doc.moveDown();
  }

  if (footer) {
    doc.moveDown();
    doc.fontSize(10).text(String(footer), { align: 'center' });
  }

  doc.end();
  return done;
};

// Generate PDF for bills
exports.generateBillPDF = (bill, patient, callback) => {
  if (!PDFDocument) {
    return callback(Buffer.from('PDFKit not installed'));
  }
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];
  
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    callback(pdfData);
  });

  // Header
  doc.fontSize(20).text('Hospital Management System', { align: 'center' });
  doc.fontSize(16).text('INVOICE', { align: 'center' });
  doc.moveDown();

  // Invoice details
  doc.fontSize(12);
  doc.text(`Invoice Number: ${bill.invoiceNumber}`);
  doc.text(`Date: ${new Date(bill.invoiceDate).toLocaleDateString()}`);
  doc.text(`Status: ${bill.status.toUpperCase()}`);
  doc.moveDown();

  // Patient details
  doc.fontSize(14).text('Patient Information:', { underline: true });
  doc.fontSize(12);
  doc.text(`Name: ${patient.user?.firstName} ${patient.user?.lastName}`);
  doc.text(`Patient ID: ${patient.patientId}`);
  doc.text(`Email: ${patient.user?.email || 'N/A'}`);
  doc.moveDown();

  // Bill items
  doc.fontSize(14).text('Bill Details:', { underline: true });
  doc.moveDown(0.5);
  
  let yPos = doc.y;
  doc.fontSize(10);
  doc.text('Item', 50, yPos);
  doc.text('Amount', 400, yPos);
  
  yPos += 20;
  bill.items.forEach(item => {
    doc.text(item.description || 'Service', 50, yPos);
    doc.text(`$${item.amount.toFixed(2)}`, 400, yPos);
    yPos += 15;
  });

  // Totals
  yPos += 10;
  doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
  yPos += 10;
  doc.fontSize(12);
  doc.text('Subtotal:', 350, yPos);
  doc.text(`$${bill.subtotal.toFixed(2)}`, 450, yPos);
  yPos += 15;
  if (bill.discount > 0) {
    doc.text('Discount:', 350, yPos);
    doc.text(`-$${bill.discount.toFixed(2)}`, 450, yPos);
    yPos += 15;
  }
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('Total:', 350, yPos);
  doc.text(`$${bill.total.toFixed(2)}`, 450, yPos);
  yPos += 20;

  // Payments
  if (bill.payments && bill.payments.length > 0) {
    doc.fontSize(12).font('Helvetica');
    doc.text('Payments:', 50, yPos);
    yPos += 15;
    bill.payments.forEach(payment => {
      doc.text(`${new Date(payment.paymentDate).toLocaleDateString()} - $${payment.amount.toFixed(2)} (${payment.paymentMethod})`, 50, yPos);
      yPos += 15;
    });
  }

  // Footer
  doc.fontSize(10)
    .text('Thank you for choosing our hospital!', 50, doc.page.height - 100, { align: 'center' });

  doc.end();
};

// Generate PDF for medical records
exports.generateMedicalRecordPDF = (record, patient, doctor, callback) => {
  if (!PDFDocument) {
    return callback(Buffer.from('PDFKit not installed'));
  }
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];
  
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    callback(pdfData);
  });

  doc.fontSize(20).text('Medical Record', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Patient: ${patient.user?.firstName} ${patient.user?.lastName} (${patient.patientId})`);
  doc.text(`Doctor: Dr. ${doctor?.firstName} ${doctor?.lastName}`);
  doc.text(`Date: ${new Date(record.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  if (record.diagnosis) {
    doc.fontSize(14).text('Diagnosis:', { underline: true });
    doc.fontSize(12).text(record.diagnosis);
    doc.moveDown();
  }

  if (record.symptoms && record.symptoms.length > 0) {
    doc.fontSize(14).text('Symptoms:', { underline: true });
    doc.fontSize(12).text(record.symptoms.join(', '));
    doc.moveDown();
  }

  if (record.prescriptions && record.prescriptions.length > 0) {
    doc.fontSize(14).text('Prescriptions:', { underline: true });
    record.prescriptions.forEach((pres, idx) => {
      doc.text(`${idx + 1}. ${pres.medicine} - ${pres.dosage} (${pres.frequency}) for ${pres.duration}`);
    });
    doc.moveDown();
  }

  if (record.notes) {
    doc.fontSize(14).text('Notes:', { underline: true });
    doc.fontSize(12).text(record.notes);
  }

  doc.end();
};

