const express = require('express');
let books = require("./booksdb.js");
const jwt = require('jsonwebtoken');

let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
  }

  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists." });
  }
  const newUser = {username, password}
  users.push(newUser);

  console.log(users)
  
  // Create a JWT for the user (you can customize the payload)
  const token = jwt.sign({ username }, 'your-secret-key', { expiresIn: '1h' });

  return res.status(201).json({ message: 'User registered successfully.', token });

});


public_users.get('/', (req, res) => {
  res.status(200).json(books); 
});
//get methode using the asyn await Axios 
public_users.get('/', (req, res) => {
  axios.get('http://localhost:3000/api/books')
    .then((response) => {
      res.status(200).json(response.data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch books' });
    });
});


// Get the book details based on numeric key (pseudo-ISBN)
public_users.get('/isbn/:key', (req, res) => {
  const { key } = req.params;
  const book = books[key];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  res.status(200).json(book);
});

// Get the book details based on numeric key (pseudo-ISBN)
public_users.get('/isbn/:key', (req, res) => {
  axios.get(`http://localhost:3000/api/books/${key}`)
  .then(response => {
    const book = response.data;
    console.log(`Book details for key ${key}:`, book);
  })
  .catch(error => {
    console.error('Error fetching book:', error);
  });
});



// Get book details based on author
public_users.get('/author/:author', (req, res) => {

  const { author } = req.params;
  console.log(author);
  // Find books by author
  const matchingBooks = Object.values(books).filter((book) => book.author === author);

  if (matchingBooks.length === 0) {
    return res.status(404).json({ message: 'No books found for this author' });
  }
  
  // Return the matching books
  res.status(200).json(matchingBooks);
});

// Get book details based on author using axios methodes
public_users.get('/author/:author', (req, res) => {
  axios.get(`http://localhost:3000/api/author/${author}`)
  .then(response => {
    const book = response.data;
    console.log(`Book details for author ${author}:`, book);
  })
  .catch(error =>{
    console.error('Error fetching books', error)
  })
})

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const {title} = req.params;
  const book = Object.values(books).find(item => item.title === title);
  if (book){
    return res.status(200).json(book);
  }else return res.status(400).json({message: "Book not Found"})
});

// Get all books based on title by using axios async await methodes
public_users.get('/title/:title', async (req, res) => {
  const { title } = req.params;

  try {
    // Make an API request using Axios with async/await
    const response = await axios.get(`https://api.example.com/books?title=${title}`);

    // Assuming the API response contains an array of books
    const book = response.data.find(item => item.title === title);

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(400).json({ message: "Book not found" });
    }
  } catch (error) {
    // Handle errors
    console.error("Error fetching book:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;

  // Find the book by numeric key (pseudo-ISBN)
  const book = books[isbn];
  console.log(book)
  if(book){
    return res.status(200).json(book.reviews)
  } else return res.status(400).json({message: "There is no Book"})
});

module.exports.general = public_users;
