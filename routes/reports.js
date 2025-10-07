const express = require('express');
const router = express.Router();
const Report = require('../models/Reports');
// const User = require('../models/User');
const User=require('../models/Users')
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

function isAuth(req, res, next) {
  if(req.session.userId) return next();
  res.redirect('/login');
}

// Reports page
router.get('/', isAuth, async (req, res) => {
  const users = await User.find();
  const reports = [];
  res.render('reports', { users, reports, selectedUser:  null });
});

// Handle dropdown select
router.post('/', isAuth, async (req, res) => {
  const userId = req.body.userId;
  const users = await User.find();
  const reports = await Report.find({ userId });
  res.render('reports', { users, reports, selectedUser: userId });
});

// Export Excel
router.get('/export/excel/:userId', isAuth, async (req, res) => {
  const reports = await Report.find({ userId: req.params.userId }).populate('userId', 'name email');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Reports');

  sheet.columns = [
    { header: 'User Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Details', key: 'details', width: 40 }
  ];

  reports.forEach(r => {
    sheet.addRow({
      name: r.userId.name,
      email: r.userId.email,
      date: r.date.toISOString().slice(0,10),
      details: r.details
    });
  });

  res.setHeader('Content-Disposition', 'attachment; filename=reports.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

// Export PDF
router.get('/export/pdf/:userId', isAuth, async (req, res) => {
  const reports = await Report.find({ userId: req.params.userId }).populate('userId', 'name email');
  const doc = new PDFDocument();
  res.setHeader('Content-Disposition', 'attachment; filename=reports.pdf');
  doc.pipe(res);

  doc.fontSize(18).text('Reports', { align: 'center' }).moveDown();
  reports.forEach(r => {
    doc.fontSize(12).text(`User: ${r.userId.name} (${r.userId.email})`);
    doc.text(`Date: ${r.date.toISOString().slice(0,10)}`);
    doc.text(`Details: ${r.details}`);
    doc.moveDown();
  });
  doc.end();
});

module.exports = router;
