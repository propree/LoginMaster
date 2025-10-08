const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const bcrypt = require('bcryptjs');


function isAuth(req, res, next) {
  if(req.session.userId) return next();
  res.redirect('/login');
}

// List all users
router.get('/', isAuth, async (req, res) => {
  const users = await User.find();
  res.render('dashboard', { users });
});

// Add user
router.post('/add', isAuth, async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hash });
  res.redirect('/dashboard');
});
// Show edit form
router.get('/edit/:id', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.redirect('/dashboard');

    res.render('edit', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Edit user
router.post('/edit/:id', isAuth, async (req, res) => {
  const { name, email } = req.body;
  await User.findByIdAndUpdate(req.params.id, { name, email });
  res.redirect('/dashboard');
});

// Delete user
router.get('/delete/:id', isAuth, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/dashboard');
});

module.exports = router;
