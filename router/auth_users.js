const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');

let books = require('./booksdb.js');
let users = []; 
const app = express(); // Create an instance of the Express app

// Initialize session middleware
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key', // Change this to a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set secure to true if using HTTPS
}));
// Check if a username exists in the users array
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Authenticate a user based on username and password
const authenticatedUser = (username, password) => {
  const foundUser = users.find((user) => user.username === username);
  console.log("the found", foundUser)
  if (!foundUser) {
    return false; 
  }
  return foundUser.password === password; // Compare passwords
};

// User login endpoint
const regd_users = express.Router();

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing Username or Password' });
  }
  if (!isValid(username)) {
    return res.status(401).json({ message: 'The username is not registered' });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Incorrect username or password' });
  }
  // Generate a JWT token
  const token = jwt.sign({ username }, 'secret-Key', { expiresIn: '1h' });
  // Set the token as an HttpOnly cookie
  console.log("the token is", token)
  req.session.token = token;

  res.status(200).json({ message: 'The user is logged in successfully', token });

});

regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  console.log("i am here")
  // Retrieve the token from the session
  const token = req.session.token;


  // Assuming you want to use the username from the session
  const { username } = jwt.decode(token); // Extract the username from the token
  
  if (!isbn || !review) {
    return res.status(400).json({ message: 'Missing ISBN or Review' });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // Check if the user has already posted a review for the book
  if (books[isbn].reviews[username]) {
    // Modify the existing review
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: 'Review modified successfully' });
  }

  // Add a new review
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: 'Review added successfully' });
});


regd_users.delete('/auth/review/:isbn', (req, res) =>{
  const {isbn} = req.params;
  
  const token = req.session.token;
  const { username } = jwt.decode(token); // Extract the username from the token
  console.log("the username is ", username)

  if(!isbn || ! username){
    return res.status(400).json({message: "Missing some params"})
  }

  const book = books[isbn]
  console.log(book)
  if(!book){
    return res.status(404).json({message: "NO Book Founded"})
  }
    // Check if the user has a review for this book
    if (!book.reviews[username]) {
      return res.status(404).json({ message: 'Review not found for this user' });
    }
  
    // Delete the user's review
    delete book.reviews[username];
  
    return res.status(200).json({ message: 'Review deleted successfully' })
})


module.exports = {
  authenticated: regd_users,
  isValid,
  users,
};
