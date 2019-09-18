const User = require("../models/user");
const braintree = require("braintree");
require("dotenv").config();

// Connect to braintree
const gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  merchantId: process.env.BRAINTREE_MERCHANT_ID
});

exports.generateToken = (req, res) => {
  gateway.clientToken.generate({}, function(err, response) {
    if (err) {
      res.state(500).send(err);
    } else {
      res.send(response);
    }
  });
};

exports.processLoan = (req, res) => {
  // let nonceFromTheClient = req.body.paymentMethodNonce
  let newLoand = gateway.transaction.sale(
    {
      options: {
        submitForSettlement: true
      }
    },
    (error, result) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.json(result);
      }
    }
  );
};
