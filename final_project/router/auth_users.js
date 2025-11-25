const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// returns boolean: username "válido" = ainda não existe na base
const isValid = (username) => {
  return !users.some((u) => u.username === username);
};

// returns boolean: username e password batem com algum usuário registrado
const authenticatedUser = (username, password) => {
  return users.some((u) => u.username === username && u.password === password);
};

// Task 7: only registered users can login
// Endpoint (por causa do index.js): POST /customer/login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // use o mesmo secret do middleware auth do index.js
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

  // salva na sessão
  req.session.authorization = { accessToken, username };

  return res.status(200).json({
    message: "Customer successfully logged in",
    token: accessToken
  });
});

// Task 8: Add or modify a book review
// Endpoint: PUT /customer/auth/review/:isbn?review=texto
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required (?review=...)" });
  }

  const username = req.session?.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "Not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) books[isbn].reviews = {};

  // cria ou atualiza a review desse usuário para esse isbn
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    isbn,
    reviews: books[isbn].reviews
  });
});

// Task 9: Delete a book review (somente do usuário logado)
// Endpoint: DELETE /customer/auth/review/:isbn
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const username = req.session?.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "Not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review by this user for this ISBN" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    isbn,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
