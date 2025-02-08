// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const user = require("./routes/user");

const app = express();
const PORT = 8055;

// MongoDB connection URL
// const mongoURI = "mongodb://127.0.0.1:27017/amman_wb"; // Replace 'mydatabase' with your database name
const mongoURI =
  "mongodb+srv://sathizzkumarr:tDfntPDRsmrt7BKP@cluster0.negxa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace 'mydatabase' with your database name

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});
app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    origin: [/.[0-9]{4}/],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use("/api/user", user);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
