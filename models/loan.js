const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const SavedItemsItemSchema = new mongoose.Schema(
  {
    book: { type: ObjectId, ref: "Book" },
    name: String,
    description: String,
    count: Number
  },
  { timestamps: true }
);

const SavedItemsItem = mongoose.model("SavedItemsItem", SavedItemsItemSchema);

const LoanSchema = new mongoose.Schema(
  {
    books: [SavedItemsItemSchema],
    status: {
      type: String,
      default: "Awaiting Pickup",
      enum: ["Awaiting Pickup", "Cancelled", "On Loan", "Returned", "Late"]
    },
    updated: Date,
    user: { type: ObjectId, ref: "User" }
    //Maybae add a due_Date: Date
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", LoanSchema);

module.exports = { Loan, SavedItemsItem };
