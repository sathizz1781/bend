const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const user = require("./routes/user");

const app = express();
const PORT = 8055;

// ✅ MongoDB Connection String (Replace 'mydatabase' with your actual database name)
const mongoURI =
  "mongodb+srv://sathizzkumarr:tDfntPDRsmrt7BKP@cluster0.negxa.mongodb.net/mydatabase?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true";

// ✅ Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tlsAllowInvalidCertificates: true, // ✅ Fix for TLS issues
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

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

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
