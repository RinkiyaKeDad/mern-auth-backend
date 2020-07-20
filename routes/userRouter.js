const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const User = require('../models/userModel');

//since we used json parser we can interact like: req.body.email
router.post('/register', async (req, res) => {
  try {
    let { email, password, passwordCheck, displayName } = req.body; //destructuring

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

//login:
//comparing creds entered with those in the db (pass matches the hashed one in the DB) and after that
//create a jwt => looks like a hash but is an encoded message which can always be decoded
//basically a json object converted into gibberish but we can always get back the original json object
//this obj stores some info about the logged in user like the db id
//we'll later validated this token when we create content for the user
//we can also put in an expiry time in this jwt

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate
    if (!email || !password)
      return res.status(400).json({ msg: 'Not all fields have been entered.' });

    const user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(400)
        .json({ msg: 'No account with this email has been registered.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//after login and regis we create a middleware for our private routes ie routes which require user to be
//authenticated

router.delete('/delete', auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//an endpoint which gives true or false if the token we give it is vaild or not
//kinda like auth but auth needs to be applied to other funtions
// this is not a private route as it will be telling if we're logged in or not:

router.post('/tokenIsValid', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    displayName: user.displayName,
    id: user._id,
  });
});

module.exports = router;
