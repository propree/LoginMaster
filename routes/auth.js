const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const svgCaptcha = require('svg-captcha');

// Middleware to check if user is authenticated
function isAuth(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/login');
}

// Redirect logged-in users away from login/register
function redirectIfLoggedIn(req, res, next) {
  if (req.session.userId) return res.redirect('/dashboard');
  next();
}

// -------------------- LOGIN --------------------
router.get('/login', redirectIfLoggedIn, (req, res) => {
  const captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  res.render('login', { 
    error: null, 
    captcha: captcha.data, 
    isAuthenticated: !!req.session.userId 
  });
});

router.post('/login', async (req, res) => {
  const { email, password, captcha } = req.body;

  // Validate captcha
  if (captcha !== req.session.captcha) {
    const newCaptcha = svgCaptcha.create();
    req.session.captcha = newCaptcha.text;
    return res.render('login', { 
      error: 'Captcha incorrect', 
      captcha: newCaptcha.data,
      isAuthenticated: !!req.session.userId 
    });
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    const newCaptcha = svgCaptcha.create();
    req.session.captcha = newCaptcha.text;
    return res.render('login', { 
      error: 'User not found', 
      captcha: newCaptcha.data,
      isAuthenticated: !!req.session.userId 
    });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const newCaptcha = svgCaptcha.create();
    req.session.captcha = newCaptcha.text;
    return res.render('login', { 
      error: 'Invalid credentials', 
      captcha: newCaptcha.data,
      isAuthenticated: !!req.session.userId 
    });
  }

  // Success → store session and redirect
  req.session.userId = user._id;
  res.redirect('/dashboard');
});

// -------------------- REGISTER --------------------
router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register', { 
    error: null, 
    isAuthenticated: !!req.session.userId 
  });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.render('register', { 
      error: 'Email already registered', 
      isAuthenticated: !!req.session.userId 
    });
  }

  // Hash and save
  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hash });

  res.redirect('/login');
});

// -------------------- DASHBOARD (Protected) --------------------
router.get('/dashboard', isAuth, async (req, res) => {
  try {
    const users = await User.find(); // get all users from DB
    res.render('dashboard', { 
      users,                          // ✅ pass users to the EJS
      isAuthenticated: !!req.session.userId 
    });
  } catch (err) {
    console.error(err);
    res.render('dashboard', { 
      users: [],                      // fallback to empty array
      isAuthenticated: !!req.session.userId 
    });
  }
});


// -------------------- LOGOUT --------------------
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
