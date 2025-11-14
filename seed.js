require("dotenv").config();
const mongoose = require("mongoose");
const Recipe = require("./models/Recipe");

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartrecipe";

const seedRecipes = [
  {
    title: "Classic Tomato Pasta",
    cuisine: "Italian",
    image: "/uploads/classic_tomato_pasta.jpg",
    ingredients: ["pasta","tomato","garlic","olive oil","basil","salt","pepper"],
    steps: ["Boil pasta","Saute garlic & tomato","Mix with pasta","Garnish basil"],
    calories: 450, difficulty: "Easy", cookTimeMinutes: 20, servings: 2
  },

  {
    title: "Vegetable Fried Rice",
    cuisine: "Chinese",
    image: "/uploads/vegetable_fried_rice.jpg",
    ingredients: ["rice","carrot","peas","onion","soy sauce","garlic","oil","salt"],
    steps: ["Cook rice","Stir fry veggies","Add rice & sauce","Serve hot"],
    calories: 400, difficulty: "Easy", cookTimeMinutes: 25, servings: 2
  },

  {
    title: "Chana Masala",
    cuisine: "Indian",
    image: "/uploads/chana_masala.jpg",
    ingredients: ["chickpeas","tomato","onion","garlic","ginger","spices","cilantro"],
    steps: ["Saute aromatics","Add spices & tomato","Simmer chickpeas","Garnish cilantro"],
    calories: 320, difficulty: "Medium", cookTimeMinutes: 40, servings: 3
  },

  {
    title: "Paneer Butter Masala",
    cuisine: "Indian",
    image: "/uploads/paneer_butter_masala.jpg",
    ingredients: ["paneer","tomato","butter","cream","onion","garam masala","cashew"],
    steps: ["Make tomato gravy","Add paneer","Finish with cream & butter"],
    calories: 550, difficulty: "Medium", cookTimeMinutes: 35, servings: 3
  },

  {
    title: "Garlic Butter Shrimp",
    cuisine: "Seafood",
    image: "/uploads/garlic_butter_shrimp.jpg",
    ingredients: ["shrimp","garlic","butter","lemon","parsley","salt","pepper"],
    steps: ["Sear shrimp","Add garlic butter","Finish with lemon & parsley"],
    calories: 270, difficulty: "Easy", cookTimeMinutes: 15, servings: 2
  },

  {
    title: "Greek Salad",
    cuisine: "Mediterranean",
    image: "/uploads/greek_salad.jpg",
    ingredients: ["cucumber","tomato","feta","olive oil","olives","onion","oregano"],
    steps: ["Chop veggies","Toss with feta & dressing","Serve chilled"],
    calories: 200, difficulty: "Easy", cookTimeMinutes: 10, servings: 2
  },

  {
    title: "Veggie Omelette",
    cuisine: "Breakfast",
    image: "/uploads/veggie_omelette.jpg",
    ingredients: ["eggs","bell pepper","onion","tomato","salt","pepper","oil"],
    steps: ["Beat eggs","Saute veggies","Pour eggs & cook","Fold & serve"],
    calories: 220, difficulty: "Easy", cookTimeMinutes: 10, servings: 1
  },

  {
    title: "Mashed Potatoes",
    cuisine: "Comfort",
    image: "/uploads/mashed_potatoes.jpg",
    ingredients: ["potato","butter","milk","salt","pepper"],
    steps: ["Boil potatoes","Mash with milk & butter","Season to taste"],
    calories: 250, difficulty: "Easy", cookTimeMinutes: 25, servings: 3
  },

  {
    title: "Lentil Soup",
    cuisine: "Healthy",
    image: "/uploads/lentil_soup.jpg",
    ingredients: ["lentils","carrot","celery","onion","garlic","stock","salt"],
    steps: ["Saute aromatics","Add lentils & stock","Simmer until soft","Blend optional"],
    calories: 180, difficulty: "Easy", cookTimeMinutes: 35, servings: 4
  },

  {
    title: "Tomato Soup",
    cuisine: "Comfort",
    image: "/uploads/tomato_soup.jpg",
    ingredients: ["tomato","onion","garlic","cream","stock","salt","pepper"],
    steps: ["Saute onion & garlic","Add tomato & stock","Blend & finish with cream"],
    calories: 150, difficulty: "Easy", cookTimeMinutes: 30, servings: 3
  },

  {
    title: "Pancakes",
    cuisine: "Breakfast",
    image: "/uploads/pancakes.jpg",
    ingredients: ["flour","milk","egg","sugar","baking powder","butter","salt"],
    steps: ["Make batter","Cook on skillet","Serve with syrup"],
    calories: 350, difficulty: "Easy", cookTimeMinutes: 20, servings: 2
  },

  {
    title: "Aloo Gobi",
    cuisine: "Indian",
    image: "/uploads/aloo_gobi.jpg",
    ingredients: ["potato","cauliflower","tomato","onion","turmeric","cumin","garlic"],
    steps: ["Saute spices","Add veggies","Cook until tender"],
    calories: 300, difficulty: "Medium", cookTimeMinutes: 35, servings: 3
  },

  {
    title: "Caprese Salad",
    cuisine: "Italian",
    image: "/uploads/caprese_salad.jpg",
    ingredients: ["tomato","mozzarella","basil","olive oil","salt","pepper"],
    steps: ["Slice tomato & mozzarella","Arrange & drizzle oil","Garnish basil"],
    calories: 220, difficulty: "Easy", cookTimeMinutes: 10, servings: 2
  },

  {
    title: "Vegetable Curry",
    cuisine: "Indian",
    image: "/uploads/vegetable_curry.jpg",
    ingredients: ["potato","carrot","peas","tomato","onion","spices","coconut milk"],
    steps: ["Saute","Add spices","Add veggies & coconut milk","Simmer"],
    calories: 360, difficulty: "Medium", cookTimeMinutes: 40, servings: 4
  },

  {
    title: "Mushroom Risotto",
    cuisine: "Italian",
    image: "/uploads/mushroom_risotto.jpg",
    ingredients: ["arborio rice","mushroom","onion","garlic","stock","parmesan","butter"],
    steps: ["Saute mushrooms","Cook rice while adding stock","Finish with butter & parmesan"],
    calories: 480, difficulty: "Hard", cookTimeMinutes: 45, servings: 3
  },

  {
    title: "Chicken Stir Fry",
    cuisine: "Chinese",
    image: "/uploads/chicken_stir_fry.jpg",
    ingredients: ["chicken","bell pepper","onion","soy sauce","garlic","oil"],
    steps: ["Slice chicken","Stir fry","Add sauce & veggies","Serve with rice"],
    calories: 420, difficulty: "Easy", cookTimeMinutes: 20, servings: 2
  },

  {
    title: "Beetroot Salad",
    cuisine: "Healthy",
    image: "/uploads/beetroot_salad.jpg",
    ingredients: ["beetroot","feta","walnuts","olive oil","lemon","salt"],
    steps: ["Roast or boil beetroot","Mix with feta & walnuts","Dress and serve"],
    calories: 210, difficulty: "Easy", cookTimeMinutes: 30, servings: 2
  },

  {
    title: "Sambar",
    cuisine: "South Indian",
    image: "/uploads/sambar.jpg",
    ingredients: ["lentils","tamarind","drumstick","tomato","sambar powder","onion","salt"],
    steps: ["Cook dal","Make tamarind extract","Cook veggies with spices","Combine and simmer"],
    calories: 220, difficulty: "Medium", cookTimeMinutes: 50, servings: 4
  },

  {
    title: "Grilled Cheese Sandwich",
    cuisine: "Snack",
    image: "/uploads/grilled_cheese.jpg",
    ingredients: ["bread","cheese","butter"],
    steps: ["Butter bread","Add cheese","Grill until golden"],
    calories: 330, difficulty: "Easy", cookTimeMinutes: 10, servings: 1
  },

  {
    title: "Simple Salsa",
    cuisine: "Mexican",
    image: "/uploads/simple_salsa.jpg",
    ingredients: ["tomato","onion","cilantro","lime","salt","chili"],
    steps: ["Chop ingredients","Mix & season","Serve fresh"],
    calories: 30, difficulty: "Easy", cookTimeMinutes: 10, servings: 4
  }
];

mongoose.connect(MONGO)
  .then(async () => {
    console.log("Connected, seeding...");
    await Recipe.deleteMany({});
    for (const r of seedRecipes) {
      const rec = new Recipe({
        ...r,
        ingredients: r.ingredients.map(i => i.toLowerCase())
      });
      await rec.save();
    }
    console.log("Seeded", seedRecipes.length, "recipes");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
