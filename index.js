require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/config");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const path = require("path");
const auth = require("./routes/user");
const category = require("./routes/category");
const product = require("./routes/product");
const orders = require('./routes/orders');
const blogs = require('./routes/blog'); 
const blogcategory = require('./routes/blogCategory');
const customer = require('./routes/customer');
const projects = require('./routes/projects');
const contact = require("./routes/contactus");
const modelAssociations = require('./models/modelAssociations');
const app = express();

const PORT = process.env.APP_PORT;


modelAssociations();

db.sync()
  .then(() =>
    console.log("Database connection successful and tables synchronized.")
  )
  .catch((error) => console.error("Database connection failed:", error));

const store = new SequelizeStore({
  db: db,
});

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: false,
      maxAge: 3 * 60 * 60 * 1000,
    },
  })
);

const corsOptions = {
  origin:[process.env.CLIENT_URL, process.env.CLIENT_URLS],
  credentials: true,
};

app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve website at root "/"
app.use('/', express.static(path.join(__dirname, '../sonicweb/dist')));

// Serve dashboard at "/admin"
app.use('/admin', express.static(path.join(__dirname, '../admin/dist')));

app.use("/api", auth);
app.use("/api", category);
app.use("/api", product);
app.use("/api", orders);
app.use("/api", customer);
app.use("/api", blogcategory);
app.use("/api", blogs);
app.use("/api", projects);
app.use("/api", contact);

//error handling
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  res.status(err.statusCode).json({
    message: err.message,
  });
});

const startServer = async () => {
  try {
    app.listen(PORT, () =>
      console.log(`Server is up and running on port ${PORT}`)
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
