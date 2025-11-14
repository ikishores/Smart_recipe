require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve frontend + uploads


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

const recipeRoutes = require("./routes/recipes");
const userRoutes = require("./routes/users");

app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);

// fallback
app.get("/health", (req,res) => res.json({ ok: true }));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
