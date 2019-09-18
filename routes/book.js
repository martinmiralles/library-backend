const express = require("express");
const router = express.Router();

const {
  create,
  bookById,
  read,
  remove,
  update,
  list,
  listRelated,
  listCategories,
  listBySearch,
  image,
  listSearch
} = require("../controllers/book"); //methods from Book Controller
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

// CRUD Methods
router.get("/book/:bookId", read);
router.post("/book/create/:userId", requireSignin, isAuth, isAdmin, create);
router.delete("/book/:bookId/:userId", requireSignin, isAuth, isAdmin, remove);
router.put("/book/:bookId/:userId", requireSignin, isAuth, isAdmin, update);

// Query Methods
router.get("/books", list);
router.get("/books/search", listSearch);
router.get("/books/related/:bookId", listRelated);
router.get("/books/categories", listCategories);
router.post("/books/by/search", listBySearch);
router.get("/book/image/:bookId", image);

router.param("userId", userById);
router.param("bookId", bookById);

module.exports = router;
