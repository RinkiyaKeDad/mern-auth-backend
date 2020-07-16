const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

//since we used json parser we can interact like: req.body.email
router.post('/register', async (req, res) => {
  try {
    let { email, password, passwordCheck, displayName } = req.body;

    // validate

    if (!email || !password || !passwordCheck)
      return res.status(400).json({ msg: 'Not all fields have been entered.' });
    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: 'The password needs to be at least 5 characters long.' });
    if (password !== passwordCheck)
      return res
        .status(400)
        .json({ msg: 'Enter the same password twice for verification.' });

    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: 'An account with this email already exists.' });

    if (!displayName) displayName = email;

    const salt = await bcrypt.genSalt(); //kinda like a secret random key given to bcrypt to generate the hash
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: passwordHash,
      displayName,
    });
    const savedUser = await newUser.save(); //saving user in mongoDb returns the saved user
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
