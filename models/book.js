const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const bookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000
    },
    price: {
      type: Number,
      trim: true,
      required: true,
      maxlength: 32
    },
    category: {
      type: ObjectId,
      ref: "Category",
      required: true,
      maxlength: 32
    },
    quantity: {
      type: Number
    },
    numberOfTimesRented: {
      //In Tutorial, is called 'sold'
      type: Number,
      default: 0
    },
    image: {
      data: Buffer,
      contentType: String
    }
    // dueDate: {              <--Use this for LOANS
    //   type: Date,
    //   default
    // }
    // ADD ISBN too
    // ADD Author
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
