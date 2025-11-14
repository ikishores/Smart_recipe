const apiBase = "https://smart-recipe-ty40.onrender.com/api";

const resultsEl = document.getElementById("results");
const favEl = document.getElementById("favorites");
const cuisineFilter = document.getElementById("cuisineFilter");
const uploadArea = document.getElementById("uploadArea");
const imageInput = document.getElementById("imageInput");

async function fetchJSON(url, opts={}) {
  const res = await fetch(url, opts);
  return res.json();
}

// Upload area interactions
uploadArea.addEventListener('click', () => imageInput.click());

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    imageInput.files = e.dataTransfer.files;
    uploadImage();
  }
});

imageInput.addEventListener('change', uploadImage);

async function loadCuisines() {
  const recipes = await fetchJSON(apiBase + "/recipes");
  const cuisines = [...new Set(recipes.map(r => r.cuisine).filter(Boolean))];
  cuisineFilter.innerHTML = '<option value="">All cuisines</option>' + 
    cuisines.map(c => `<option value="${c}">${c}</option>`).join("");
}
loadCuisines();

async function showFavorites() {
  const favs = JSON.parse(localStorage.getItem("favRecipes")||"[]");
  if (favs.length === 0) {
    favEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💔</div><p>No favorites yet. Start saving recipes you love!</p></div>';
    return;
  }
  const details = await Promise.all(favs.map(id => fetchJSON(apiBase + "/recipes/" + id)));
  favEl.innerHTML = details.map(r => renderCard(r, true)).join("");
}
showFavorites();

function renderCard(r, isFavArea=false, meta="") {
  const img = r.image || "/uploads/placeholder.jpg";
  const stars = '⭐'.repeat(Math.round(r.avgRating || 0));
  
  return `
    <div class="card">
      <img src="${img}" alt="${r.title}" class="card-image" />
      <div class="card-content">
        <h3>${r.title}</h3>
        <div class="card-meta">
          ${r.cuisine ? `<span class="badge cuisine">${r.cuisine}</span>` : ''}
          ${r.difficulty ? `<span class="badge difficulty">${r.difficulty}</span>` : ''}
          <span class="badge">⏱ ${r.cookTimeMinutes || '-'} min</span>
          ${r.avgRating ? `<span class="rating">${stars} ${r.avgRating.toFixed(1)}</span>` : ''}
        </div>
        ${meta ? `<div style="color: #667eea; font-size: 0.9rem; font-weight: 600;">${meta}</div>` : ''}
        <p class="ingredients-preview">${r.ingredients.slice(0,4).join(", ")}${r.ingredients.length > 4 ? "..." : ""}</p>
        <div class="card-actions">
          <button class="btn-small btn-save" onclick="addFav('${r._id}')">💾 Save</button>
          <button class="btn-small btn-rate" onclick="rateRecipe('${r._id}')">⭐ Rate</button>
          <button class="btn-small btn-view" onclick="viewRecipe('${r._id}')">👁 View</button>
        </div>
      </div>
    </div>
  `;
}

async function viewRecipe(id) {
  const r = await fetchJSON(apiBase + "/recipes/" + id);
  const modalBody = document.getElementById("modalBody");
  modalBody.innerHTML = `
    <h2>${r.title}</h2>
    ${r.image ? `<img src="${r.image}" style="width: 100%; border-radius: 12px; margin-bottom: 20px;" />` : ''}
    <div class="modal-section">
      <h3>📝 Ingredients</h3>
      <ul class="modal-list">
        ${r.ingredients.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>
    <div class="modal-section">
      <h3>👨‍🍳 Instructions</h3>
      <ul class="modal-list">
        ${r.steps.map((s, i) => `<li><strong>Step ${i+1}:</strong> ${s}</li>`).join('')}
      </ul>
    </div>
  `;
  document.getElementById("recipeModal").classList.add('active');
}

function closeModal() {
  document.getElementById("recipeModal").classList.remove('active');
}

document.getElementById("recipeModal").addEventListener('click', (e) => {
  if (e.target.id === 'recipeModal') closeModal();
});

function addFav(id) {
  const favs = JSON.parse(localStorage.getItem("favRecipes")||"[]");
  if (!favs.includes(id)) favs.push(id);
  localStorage.setItem("favRecipes", JSON.stringify(favs));
  showFavorites();
  showNotification("✅ Saved to favorites!");
}

async function rateRecipe(id) {
  const score = prompt("Rate this recipe from 1 to 5 stars:");
  const n = Number(score);
  if (!n || n<1 || n>5) {
    showNotification("❌ Please enter a number between 1 and 5");
    return;
  }
  await fetch(apiBase + "/recipes/" + id + "/rate", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ score: n })
  });
  showNotification("⭐ Thanks for rating!");
  loadResults();
}

function showNotification(msg) {
  const notif = document.createElement('div');
  notif.textContent = msg;
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    font-weight: 600;
    z-index: 2000;
    animation: slideInRight 0.3s ease;
  `;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 2500);
}

document.getElementById("searchBtn").addEventListener("click", loadResults);

async function uploadImage() {
  const file = imageInput.files[0];
  if(!file) return;
  
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(apiBase + "/recipes/upload-image", { method: "POST", body: fd });
  const data = await res.json();
  
  if (data.path) {
    document.getElementById("uploadedPreview").innerHTML = 
      `<img src="${data.path}" alt="Uploaded ingredients" />`;
    showNotification("📸 Image uploaded successfully!");
  } else {
    showNotification("❌ Upload failed. Please try again.");
  }
}

async function loadResults() {
  const ingredients = document.getElementById("ingredientsInput").value;
  const cuisine = cuisineFilter.value;
  const difficulty = document.getElementById("difficultyFilter").value;

  if (!ingredients.trim()) {
    const q = new URLSearchParams();
    if (cuisine) q.append("cuisine", cuisine);
    if (difficulty) q.append("difficulty", difficulty);
    const recipes = await fetchJSON(apiBase + "/recipes?" + q.toString());
    
    if (recipes.length === 0) {
      resultsEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No recipes found. Try different filters!</p></div>';
    } else {
      resultsEl.innerHTML = recipes.map(r => renderCard(r)).join("");
    }
    return;
  }

  const res = await fetch(apiBase + "/recipes/search", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ ingredients })
  });
  const items = await res.json();
  
  if (items.length === 0) {
    resultsEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">😕</div><p>No recipes match your ingredients. Try adding more!</p></div>';
  } else {
    resultsEl.innerHTML = items.map(item => {
      const meta = `✓ ${item.matches} ingredients matched • Score: ${item.score}`;
      return renderCard(item.recipe, false, meta);
    }).join("");
  }
}

loadResults();