const User = require("../models/user");
const jwt = require("jsonwebtoken"); //used to generate signed token
const expressJwt = require("express-jwt"); //for authorization check
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.signup = (req, res) => {
  // console.log("req.body", req.body);
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: errorHandler(err)
      });
    }
    //To hide passwords on creation
    user.salt = undefined;
    user.hashed_password = undefined;
    res.json({
      user
    });
  });
};

exports.signin = (req, res) => {
  // Find the user based on Email
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        err: "Cannot find User with that email."
      });
    }

    // IF user if found, make sure email and password match
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: `Email and password don't match.`
      });
    }

    // Generate a signed token with user ID and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Persist the token as 't' in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });

    // Return response with user and token to frontend client
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "Signout successful" });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth"
});

// Prevents access to other Users' info
exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;

  if (!user) {
    return res.status(403).json({
      error: "Access Denied"
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    //Non-Admin User
    return res.status(403).json({
      error: "Admin resource - Access Denied"
    });
  }
  next();
};
