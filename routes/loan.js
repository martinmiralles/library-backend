const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById, addLoanToUserHistory } = require("../controllers/user");
const {
  create,
  listLoans,
  getStatusValues,
  loanById,
  updateLoanStatus
} = require("../controllers/loan");
const { decreaseQuantity } = require("../controllers/book");

router.post(
  "/loan/create/:userId",
  requireSignin,
  isAuth,
  addLoanToUserHistory,
  decreaseQuantity,
  create
);

router.get("/loan/list/:userId", requireSignin, isAuth, isAdmin, listLoans);
router.get(
  "/loan/status-values/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  getStatusValues
);
router.put(
  "/loan/:loanId/status/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  updateLoanStatus
);

router.param("userId", userById);
router.param("loanId", loanById);
module.exports = router;
