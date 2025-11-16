const express = require("express");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");
const bcrypt = require("bcrypt");

const booksRouter = require("./books");
const usersRouter = require("./users");
const User = require("./models/user");
const { ensureAuthenticated } = require("./middleware/auth");

// Initialize Passport config
require("./config/passport")(passport);

const app = express();
const port = 3000;

// Set view engine
app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
connectDB();

// Express session configuration
app.use(
  session({
    secret: "your-secret-key-change-this-in-production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/mydatabase",
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Home route - redirect to login
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/books");
  }
  res.redirect("/login");
});

// Login routes
app.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/books");
  }
  res.render("login", { error: null });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/books",
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.redirect("/books");
  }
);

// Register routes
app.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/books");
  }
  res.render("register", { error: null, success: null });
});

app.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  // Validation
  if (!username || !password || !confirmPassword) {
    return res.render("register", {
      error: "All fields are required",
      success: null,
    });
  }

  if (password !== confirmPassword) {
    return res.render("register", {
      error: "Passwords do not match",
      success: null,
    });
  }

  if (password.length < 6) {
    return res.render("register", {
      error: "Password must be at least 6 characters",
      success: null,
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render("register", {
        error: "Username already exists",
        success: null,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    // Auto login after registration
    req.login(newUser, (err) => {
      if (err) {
        return res.render("register", {
          error: "Registration successful, but login failed",
          success: null,
        });
      }
      res.redirect("/books");
    });
  } catch (error) {
    console.error(error);
    res.render("register", {
      error: "Error creating account. Please try again.",
      success: null,
    });
  }
});

// Logout route
app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

// Protected books route
app.use("/books", ensureAuthenticated, booksRouter);

// Users API route (keep for backward compatibility)
app.use("/users", usersRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
