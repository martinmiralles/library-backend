const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Book = require("../models/book");
const { errorHandler } = require("../helpers/dbErrorHandler");

// Middleware
exports.bookById = (req, res, next, id) => {
  Book.findById(id)
    .populate("category")
    .exec((err, book) => {
      if (err || !book) {
        return res.status(400).json({
          error: "Book not found."
        });
      }
      req.book = book;
      next();
    });
};

// To get a single Book
exports.read = (req, res) => {
  req.book.image = undefined;
  return res.json(req.book);
};

// This is one method...
exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded"
      });
    }

    // Checks for fields
    const { name, description, price, category, quantity } = fields;

    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({
        error: "One or more fields are empty"
      });
    }

    let book = new Book(fields);

    // 1kb = 1000
    // 1mb = 1000000, million

    if (files.image) {
      if (files.image.size > 1000000) {
        return res.status(400).json({
          error: "Image must be less th an 1MB in size"
        });
      }
      book.image.data = fs.readFileSync(files.image.path);
      book.image.contentType = files.image.type;
    }

    book.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(result);
    });
  });
};

exports.remove = (req, res) => {
  let book = req.book;
  book.remove((err, deletedBook) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    res.json({
      message: "Book successfully deleted."
    });
  });
};

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded"
      });
    }

    // Checks for fields - cannot Update unless ALL fields are changes on frontend
    // const { name, description, price, category, quantity } = fields;

    // if (!name || !description || !price || !category || !quantity) {
    //   return res.status(400).json({
    //     error: "One or more fields are empty"
    //   });
    // }

    let book = req.book;
    book = _.extend(book, fields);

    // 1kb = 1000
    // 1mb = 1000000, million

    if (files.image) {
      if (files.image.size > 1000000) {
        return res.status(400).json({
          error: "Image must be less th an 1MB in size"
        });
      }
      book.image.data = fs.readFileSync(files.image.path);
      book.image.contentType = files.image.type;
    }

    book.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(result);
    });
  });
};

// Popular Books
// by popularity = books?sortBy=numberOfTimesRented&order=desc&limit=4

// New Books
// by arrival = /books?sortBy=createdAt&order=desc&limit=4

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Book.find()
    .select("-image")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, books) => {
      if (err) {
        return res.status(400).json({
          error: "Books not found."
        });
      }
      res.json(books);
    });
};

// Will find Books based on the request Books category
// Other Books with the same category will be returned
exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 2;

  //Finds books, not including the requested book
  //
  Book.find({ _id: { $ne: req.book }, category: req.book.category })
    .limit(limit)
    .populate("category", "_id name")
    .exec((err, books) => {
      if (err) {
        return res.status(400).json({
          error: "Books not found."
        });
      }
      res.json(books);
    });
};

exports.listCategories = (req, res) => {
  Book.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "Books not found."
      });
    }
    res.json(categories);
  });
};

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1]
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Book.find(findArgs)
    .select("-image")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Books not found"
        });
      }
      res.json({
        size: data.length,
        data
      });
    });
};

exports.image = (req, res, next) => {
  if (req.book.image.data) {
    res.set("Content-Type", req.book.image.contentType);
    return res.send(req.book.image.data);
  }
  next();
};

exports.listSearch = (req, res) => {
  // Create Query object to hold the value of Search and Category
  const query = {};

  // assigning Search value to query.name
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" };

    // assigning Category value to query.category
    if (req.query.category && req.query.category != "All") {
      query.category = req.query.category;
    }

    // Find book based on query object, based on above 2 properties
    Book.find(query, (err, books) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(books);
    }).select("-image"); //disregard searching the image
  }
};

exports.decreaseQuantity = (req, res, next) => {
  let bulkOps = req.body.loan.books.map(item => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: {
          $inc: {
            quantity: -item.count,
            numberOfTimesRented: +item.count
          }
        }
      }
    };
  });
  Book.bulkWrite(bulkOps, {}, (error, books) => {
    if (error) {
      return res.status(400).json({
        error: "Could not update book"
      });
    }
    next();
  });
};
