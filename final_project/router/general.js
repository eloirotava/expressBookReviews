const express = require("express");
const axios = require("axios");

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

/**
 * Task 6: Register a new user
 * Body: { "username": "...", "password": "..." }
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const exists = users.some((u) => u.username === username);
  if (exists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Task 1: Get the book list available in the shop
public_users.get("/", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

// Task 3: Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const keys = Object.keys(books);

  const result = [];
  keys.forEach((isbn) => {
    const book = books[isbn];
    if (book && book.author === author) result.push({ isbn, ...book });
  });

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }
  return res.status(200).json(result);
});

// Task 4: Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);

  const result = [];
  keys.forEach((isbn) => {
    const book = books[isbn];
    if (book && book.title === title) result.push({ isbn, ...book });
  });

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }
  return res.status(200).json(result);
});

// Task 5: Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews || {});
});

/* =========================================================
   Tasks 10–13 (Promises / Async-Await + Axios)
   Rotas novas para NÃO quebrar as rotas originais (Tasks 1–4)
   ========================================================= */

/**
 * Task 10: Get all books using Promise callbacks (Axios)
 * GET /async/books
 */
public_users.get("/async/books", (req, res) => {
  axios
    .get(`${BASE_URL}/`)
    .then((response) => {
      const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res.status(500).json({ message: "Error fetching books (async)", error: err.message });
    });
});

/**
 * Task 11: Get book by ISBN using async/await (Axios)
 * GET /async/isbn/:isbn
 */
public_users.get("/async/isbn/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({
      message: "Error fetching book by ISBN (async)",
      error: err.response?.data || err.message,
    });
  }
});

/**
 * Task 12: Get books by author using async/await (Axios)
 * GET /async/author/:author
 */
public_users.get("/async/author/:author", async (req, res) => {
  try {
    const author = req.params.author;
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({
      message: "Error fetching books by author (async)",
      error: err.response?.data || err.message,
    });
  }
});

/**
 * Task 13: Get books by title using async/await (Axios)
 * GET /async/title/:title
 */
public_users.get("/async/title/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({
      message: "Error fetching books by title (async)",
      error: err.response?.data || err.message,
    });
  }
});

module.exports.general = public_users;
