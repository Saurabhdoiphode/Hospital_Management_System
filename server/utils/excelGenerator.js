let ExcelJS;
try {
  ExcelJS = require('exceljs');
} catch (error) {
  console.warn('ExcelJS not installed. Excel export will be disabled.');
  ExcelJS = null;
}

// Generate Excel for appointments
exports.generateAppointmentsExcel = async (appointments) => {
  if (!ExcelJS) {
    throw new Error('ExcelJS not installed');
  }
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Appointments');

  // Define columns
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Time', key: 'time', width: 10 },
    { header: 'Patient', key: 'patient', width: 25 },
    { header: 'Patient ID', key: 'patientId', width: 15 },
    { header: 'Doctor', key: 'doctor', width: 25 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Reason', key: 'reason', width: 30 }
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add data
  appointments.forEach(apt => {
    worksheet.addRow({
      date: new Date(apt.appointmentDate).toLocaleDateString(),
      time: apt.appointmentTime,
      patient: `${apt.patient?.user?.firstName} ${apt.patient?.user?.lastName}`,
      patientId: apt.patient?.patientId,
      doctor: `Dr. ${apt.doctor?.firstName} ${apt.doctor?.lastName}`,
      type: apt.appointmentType,
      status: apt.status,
      reason: apt.reason || ''
    });
  });

  return workbook;
};

// Generate Excel for billing
exports.generateBillingExcel = async (bills) => {
  if (!ExcelJS) {
    throw new Error('ExcelJS not installed');
  }
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Billing');

  worksheet.columns = [
    { header: 'Invoice #', key: 'invoice', width: 15 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Patient', key: 'patient', width: 25 },
    { header: 'Patient ID', key: 'patientId', width: 15 },
    { header: 'Subtotal', key: 'subtotal', width: 12 },
    { header: 'Discount', key: 'discount', width: 12 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Paid', key: 'paid', width: 12 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  bills.forEach(bill => {
    const totalPaid = bill.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    worksheet.addRow({
      invoice: bill.invoiceNumber,
      date: new Date(bill.invoiceDate).toLocaleDateString(),
      patient: `${bill.patient?.user?.firstName} ${bill.patient?.user?.lastName}`,
      patientId: bill.patient?.patientId,
      subtotal: bill.subtotal,
      discount: bill.discount || 0,
      total: bill.total,
      paid: totalPaid,
      status: bill.status
    });
  });

  // Add summary row
  const totalRow = worksheet.addRow({});
  worksheet.mergeCells(`A${totalRow.number}:D${totalRow.number}`);
  worksheet.getCell(`A${totalRow.number}`).value = 'TOTAL';
  worksheet.getCell(`A${totalRow.number}`).font = { bold: true };
  worksheet.getCell(`E${totalRow.number}`).value = {
    formula: `SUM(E2:E${totalRow.number - 1})`
  };
  worksheet.getCell(`G${totalRow.number}`).value = {
    formula: `SUM(G2:G${totalRow.number - 1})`
  };

  return workbook;
};

