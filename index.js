const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Initialize session middleware
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key', // Change this to a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set secure to true if using HTTPS
}));
app.use(express.json());

// app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// app.use("/customer/auth/*", function auth(req, res, next) {
//     // Extract the token from the request header
//     const token = req.header('Authorization');
//     if (!token) {
//         return res.status(401).json({ message: 'Access Denied, no token provided' });
//     }
//     try {
//         const decoded = jwt.verify(token, 'your-secret-key');
//         // Set the decoded user object to the user for further usage
//         req.user = decoded;
//         console.log(req.user); // Log the decoded user (optional)
//         next(); // Call next middleware
//     } catch (error) {
//         res.status(400).json({ message: "Invalid TOKEN" });
//     }
// });

 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
