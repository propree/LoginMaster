// run with: node seed.js
const mongoose = require('mongoose');
require('dotenv').config();
const Report = require('./models/Report');

const data = [
  { name: 'Alice', date: new Date('2025-01-10'), details: 'Report A1' },
  { name: 'Alice', date: new Date('2025-02-14'), details: 'Report A2' },
  { name: 'Bob', date: new Date('2025-03-01'), details: 'Report B1' },
  { name: 'Charlie', date: new Date('2025-04-20'), details: 'Report C1' }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Report.deleteMany({});
    await Report.insertMany(data);
    console.log('Seeded reports');
    process.exit(0);
  })
  .catch(err => console.error(err));
