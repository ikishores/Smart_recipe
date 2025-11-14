const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cuisine: String,
  ingredients: [String], // normalized lower-case strings
  steps: [String],
  calories: Number,
  difficulty: { type: String, enum: ["Easy","Medium","Hard"], default: "Easy" },
  cookTimeMinutes: Number,
  servings: { type: Number, default: 1 },
  image: String, // path under /uploads
  ratings: [{ score: Number, createdAt: Date }],
  avgRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

RecipeSchema.methods.recalculateRating = function() {
  if (!this.ratings || this.ratings.length === 0) {
    this.avgRating = 0;
    return;
  }
  const sum = this.ratings.reduce((s, r) => s + r.score, 0);
  this.avgRating = Math.round((sum / this.ratings.length) * 10) / 10;
};

module.exports = mongoose.model("Recipe", RecipeSchema);
