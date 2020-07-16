const jwt = require('jsonwebtoken');

//next is a funtion to call once the authentication is done to execute whatever funtion we gave after that
//like in case of delete

const auth = (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token)
      return res
        .status(401)
        .json({ msg: 'No authentication token, authorization denied.' });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified)
      return res
        .status(401)
        .json({ msg: 'Token verification failed, authorization denied.' });

    //console.log of verified would give you an object with a id and iat(issued at)

    req.user = verified.id; //now doing req.user in subsequent things will give you the id
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = auth;
