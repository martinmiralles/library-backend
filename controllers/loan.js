const { Loan, SavedItemsItem } = require("../models/loan");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.loanById = (req, res, next, id) => {
  Loan.findById(id)
    .populate("books.book", "name description")
    .exec((err, loan) => {
      if (err || !loan) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      req.loan = loan;
      next();
    });
};

exports.create = (req, res) => {
  console.log("CREATE LOAN: ", req.body);
  req.body.loan.user = req.profile;
  const loan = new Loan(req.body.loan);
  loan.save((error, data) => {
    if (error) {
      return res.status(400).json({
        error: errorHandler(error)
      });
    }
    res.json(data);
  });
};

exports.listLoans = (req, res) => {
  Loan.find()
    .populate("user", "_id name address")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      res.json(orders);
    });
};

exports.getStatusValues = (req, res) => {
  res.json(Loan.schema.path("status").enumValues);
};

exports.updateLoanStatus = (req, res) => {
  Loan.update(
    { _id: req.body.loanId },
    { $set: { status: req.body.status } },
    (err, loan) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      res.json(loan);
    }
  );
};
