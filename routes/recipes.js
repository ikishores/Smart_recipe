const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");

const multer = require("multer");
const cloudinary = require("../cloudinary");
const upload = multer({ dest: "temp/" });

// Create recipe (admin)
router.post("/", async (req, res) => {
  try {
    const r = new Recipe(req.body);
    await r.save();
    res.status(201).json(r);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Upload image to Cloudinary
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "smart_recipe_images"
    });

    res.json({ path: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cloudinary upload failed" });
  }
});
// List recipes with filters
router.get("/", async (req, res) => {
  const { cuisine, difficulty, maxTime, q, minRating } = req.query;
  const filter = {};
  if (cuisine) filter.cuisine = cuisine;
  if (difficulty) filter.difficulty = difficulty;
  if (maxTime) filter.cookTimeMinutes = { $lte: Number(maxTime) };
  if (minRating) filter.avgRating = { $gte: Number(minRating) };

  let recipes = await Recipe.find(filter).sort({ avgRating: -1, createdAt: -1 });
  if (q) {
    const qlc = q.toLowerCase();
    recipes = recipes.filter(r =>
      r.title.toLowerCase().includes(qlc) ||
      r.ingredients.join(" ").includes(qlc)
    );
  }
  res.json(recipes);
});

// Get single recipe
router.get("/:id", async (req, res) => {
  const r = await Recipe.findById(req.params.id);
  if (!r) return res.status(404).json({ error: "Not found" });
  res.json(r);
});

// Rate a recipe
router.post("/:id/rate", async (req, res) => {
  const { score } = req.body;
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ error: "Not found" });
  recipe.ratings.push({ score: Number(score), createdAt: new Date() });
  recipe.recalculateRating();
  await recipe.save();
  res.json({ avgRating: recipe.avgRating });
});

// Ingredient search
router.post("/search", async (req, res) => {
  const raw = req.body.ingredients || "";
  const userIngredients = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

  const recipes = await Recipe.find();
  const scored = recipes.map(r => {
    const rIngredients = r.ingredients.map(i => i.toLowerCase());
    const matches = [...new Set(rIngredients)].filter(i => userIngredients.includes(i)).length;
    const score = rIngredients.length ? (matches / rIngredients.length) : 0;
    return { recipe: r, matches, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.matches !== a.matches) return b.matches - a.matches;
    return (b.recipe.avgRating || 0) - (a.recipe.avgRating || 0);
  });

  res.json(scored.slice(0, 20).map(s => ({
    recipe: s.recipe,
    matches: s.matches,
    score: Math.round(s.score * 100) / 100
  })));
});

module.exports = router;
