// This code sets up an Express server with routes for user registration, login, 
// and message handling. It includes middleware for authentication and integrates
//  with the GrammarBot API to check message grammar. It also includes error handling 
//  for both 404 and general errors.


// Import required modules
var express = require("express");
var cookieParser = require("cookie-parser");
const cors = require("cors");
var http = require("http");
const mongoose = require("mongoose");
const qs = require('querystring');
const https = require('https');

// Initialize express app
const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/llm_api");

// User Schema definition
const user = mongoose.model("user", {
  email: {
    type: String,
    required: [true, "Please enter your Email address"],
    trim: true,
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid Email address",
    ],
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

// Message Schema definition
const message = mongoose.model("message", {
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "user",
  },
  body: {
    type: String,
    required: [true, "Body is Required "],
  },
  fromChat: {
    type: Boolean,
    default: false,
    required: [true, ""],
  },
  type: {
    type: String,
    required: [true, "please a type of message is required"],
    enum: {
      values: ["text", "csv"],
      message: 'Please use a valid Data Type ["text", "csv"]',
    },
  },
});

// Middleware setup
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Cookie options
const options = {
  expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

// Authentication middleware
const protected = (req, res, next) => {
  let token;
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      status: "Not Authorized",
      error: "401 Invalid Authorization",
    });
  }
  req.user = { _id: token };
  next();
};

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json("Please provide an email and password", 400);
  }
  const data = await user.findOne({ email: email.toLowerCase() }).select("+password");
  if (!data || data.password !== password) {
    return res.status(400).json("Invalid credentials", 401);
  }
  res.status(201).cookie("token", data._id.toString(), options).json({ success: true, status: "success", data });
});

// Register route
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const isUser = await user.findOne({ email: email.toLowerCase() });
  if (isUser) {
    return res.send(`${email} is assigned to a user, sign in instead`);
  }
  const newUser = await user.create({ name, email, password });
  res.status(201).cookie("token", newUser._id.toString(), options).json({ success: true, status: "success", data: newUser });
});

// Get messages route
app.get("/messages", protected, async (req, res) => {
  const myMessage = await message.find({ user: req.user._id }).sort({ _id: -1 });
  res.status(200).json({ success: true, status: " success", prompt: myMessage });
});

// GrammarBot integration for checking grammar
const grammarCheck = (text, callback) => {
  const options = {
    method: 'POST',
    hostname: 'grammarbot.p.rapidapi.com',
    port: null,
    path: '/check',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'X-RapidAPI-Key': '04ea4900bemsh0d7483e56ad8865p10a620jsncfa77547dc1d',
      'X-RapidAPI-Host': 'grammarbot.p.rapidapi.com'
    }
  };

  const req = https.request(options, (res) => {
    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => callback(Buffer.concat(chunks).toString()));
  });

  req.write(qs.stringify({ text, language: 'en-US' }));
  req.end();
};

// Handle new messages and grammar check
app.post("/messages", protected, async (req, res) => {
  const { body, type } = req.body;
  const newMsg = await message.create({ body, type, user: req.user._id, fromChat: false });

  grammarCheck(body, async (result) => {
    const response = JSON.parse(result);
    const responseData = {
      user: req.user._id,
      body: response.matches[0] ? response.matches[0].message : "No issues found",
      type: "text",
      fromChat: true,
    };

    await message.create(responseData);
    res.status(200).json({ success: true, status: " success", prompt: responseData });
  });
});

// Error handling for 404 not found
app.use((req, res) => {
  res.status(404).json({ success: false, status: "Resource Not Found", error: "404 Content Do Not Exist Or Has Been Deleted" });
});

// General error handling
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500).json({ success: false, error: err.message });
});

// Start the server
const server = http.createServer(app);
const port = 3000;
server.listen(port, () => console.log("Listening on port " + port));

module.exports = app;
