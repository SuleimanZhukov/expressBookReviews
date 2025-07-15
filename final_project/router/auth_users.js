const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.find(item => item.username === username);
}

const authenticatedUser = (username,password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });

    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    if (!req.body.username || !req.body.password)
        return res.status(400).json({message: "Please provide username and passeword"});
    if (!isValid(req.body.username))
        return res.status(400).json({message: "This user doesn't exist"});

    if (authenticatedUser(req.body.username, req.body.password)) {
        let accessToken = jwt.sign({
            data: req.body.password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username: req.body.username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const review = req.query.review;
    if (!isbn)
        return res.status(400).json({message: "Please provide an isbn as a param"});
    if (!review)
        return res.status(400).json({message: "Please provide a review as a query"});
    const theBook = books[isbn];
    if (!theBook)
        return res.status(404).json({message: `The book with isbn ${isbn} does not exist`});

    theBook.reviews[username] = review;
    books[isbn] = theBook;

    return res.status(200).json({message: "The book was edited"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    if (!isbn)
        return res.status(400).json({message: "Please provide an isbn as a param"});
    const theBook = books[isbn];
    if (!theBook)
        return res.status(404).json({message: `The book with isbn ${isbn} does not exist`});

    delete theBook.reviews[username];
    books[isbn] = theBook;

    return res.status(200).json({message: "The book was deleted"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
