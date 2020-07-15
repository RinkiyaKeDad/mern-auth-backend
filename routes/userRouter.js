const router = require('express').Router();
router.get('/test', (req, res) => {
  res.send('Its working!');
});

module.exports = router;
