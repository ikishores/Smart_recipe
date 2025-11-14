const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");

// For demo: store favorites in-memory keyed by provided userId (not secure)
const favorites = {};

// Add favorite
router.post("/favorites", async (req, res) => {
  const { userId = "guest", recipeId } = req.body;
  if (!recipeId) return res.status(400).json({ error: "recipeId required" });
  favorites[userId] = favorites[userId] || new Set();
  favorites[userId].add(recipeId);
  // return list
  res.json({ favorites: Array.from(favorites[userId]) });
});

// Remove favorite
router.delete("/favorites", async (req, res) => {
  const { userId = "guest", recipeId } = req.body;
  if (!recipeId) return res.status(400).json({ error: "recipeId required" });
  if (favorites[userId]) favorites[userId].delete(recipeId);
  res.json({ favorites: favorites[userId] ? Array.from(favorites[userId]) : [] });
});

// Get favorite recipes
router.get("/favorites/:userId", async (req, res) => {
  const userId = req.params.userId || "guest";
  const ids = favorites[userId] ? Array.from(favorites[userId]) : [];
  const recipes = await Recipe.find({ _id: { $in: ids } });
  res.json(recipes);
});

module.exports = router;
