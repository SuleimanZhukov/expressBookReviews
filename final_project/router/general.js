const express = require('express');
let books = require("./booksdb.js");
const { default: axios } = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    if (!req.body.username || !req.body.password)
        return res.status(400).json({message: "Please provide username and passeword"});
    if (isValid(req.body.username))
        return res.status(400).json({message: "User already exists"});

    users.push({
        username: req.body.username,
        password: req.body.password,
    })

    return res.status(200).json({message: `User ${req.body.username} was registed`});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    if (!req.params.isbn)
        return res.status(404).json({message: `Please provide an isbn`})
    if (!books[req.params.isbn])
        return res.status(404).json({message: `Book with isbn ${req.params.isbn} not found`})

    return res.status(200).json(books[req.params.isbn]);
 });
  

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const theBook = Object.values(books).find(item => item.author === author);
    if (!req.params.author)
        return res.status(404).json({message: `Please provide an author`})
    if (!theBook)
        return res.status(404).json({message: `Book with author ${author} not found`})
   
    return res.status(200).json(theBook);
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const theBook = Object.values(books).find(item => item.title === title);
    if (!req.params.title)
        return res.status(404).json({message: `Please provide an title`})
    if (!theBook)
        return res.status(404).json({message: `Book with title ${title} not found`})
    
    axios.get("https://books.bytitle").then(book => {
        return res.status(200).json(book);
    }).catch(error => {
        return res.status(400).json({message: error});
    })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const theBook = books[isbn];
    if (!req.params.isbn)
        return res.status(404).json({message: `Please provide an isbn`})
    if (!theBook)
        return res.status(404).json({message: `Book with isbn ${isbn} not found`})
    
    return res.status(200).json(theBook.reviews);
});

module.exports.general = public_users;
