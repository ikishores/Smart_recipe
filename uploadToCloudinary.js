require("dotenv").config();
const mongoose = require("mongoose");
const Recipe = require("./models/Recipe");
const cloudinary = require("./cloudinary");
const path = require("path");
const fs = require("fs");

async function migrate() {
  console.log("Starting migration...");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected ✔");

  const recipes = await Recipe.find();
  console.log("Recipes found:", recipes.length);

  for (const r of recipes) {
    if (!r.image || !r.image.startsWith("/uploads/")) {
      console.log("Skipping already updated:", r.title);
      continue;
    }

    const filename = r.image.replace("/uploads/", "");
    const filePath = path.join(__dirname, "public/uploads", filename);

    if (!fs.existsSync(filePath)) {
      console.log("❌ File not found:", filename);
      continue;
    }

    console.log("Uploading:", filename, "for", r.title);

    try {
      const upload = await cloudinary.uploader.upload(filePath, {
        folder: "smart_recipe_images"
      });

      r.image = upload.secure_url;
      await r.save();

      console.log("✔ Updated:", r.title);

    } catch (err) {
      console.log("❌ Upload error for", r.title, err);
    }
  }

  console.log("✔ DONE - All images migrated");
  process.exit(0);
}

migrate();
