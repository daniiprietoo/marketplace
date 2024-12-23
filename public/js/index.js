import { auth, db, fetchApprovedProducts } from './firebaseInit.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.querySelector(".search-bar input");
  const searchButton = document.querySelector(".btn-search");
  const categoryButtons = document.querySelectorAll(".category-card");
  const productsGrid = document.querySelector(".listings-grid");
  const btnRegister = document.querySelector(".btn-register");

  let products = [];
  try {
    products = await fetchApprovedProducts();
  } catch (error) {
    console.error("Error fetching products:", error.message);
    alert("Failed to load products.");
  }

  const renderProducts = (products) => {
    productsGrid.innerHTML = "";

    const productsToRender = products.slice(0, 3);

    productsToRender.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.title}" />
          <span class="condition">${product.condition}</span>
        </div>
        <div class="product-info">
          <h3>${product.title}</h3>
          <p class="author">${product.author}</p>
          <p class="edition">${product.edition}th Edition</p>
          <div class="product-meta">
            <p class="price">${product.price}$</p>
            <p class="location">${product.location}</p>
          </div>
          <button class="btn btn-contact">Contact Seller</button>
        </div>
      `;

      productsGrid.appendChild(productCard);
    });
  };

  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);

    return {
      search: params.get("search") || "",
      category: params.get("category") || "",
    };
  };

  const urlParams = getUrlParams();
  if (urlParams.search) {
    searchInput.value = urlParams.search;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    const search = searchInput.value.trim();

    if (search) {
      const searchParams = new URLSearchParams();

      searchParams.set("search", search);
      window.location.href = `products.html?${searchParams.toString()}`;
    } else {
      window.location.href = "products.html";
    }
  };

  searchButton.addEventListener("click", handleSearch);

  
  if (auth.currentUser) {
    btnRegister.innerHTML = "Sign Out";
    btnRegister.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = "index.html";
        alert("You have been signed out.");
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Please try again.");
      }
    });
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const subject = e.target.dataset.subject;
      const searchParams = new URLSearchParams();

      searchParams.set("subject", subject);
      window.location.href = `products.html?${searchParams.toString()}`;
    });
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const isAdmin = userDoc.data().isAdmin;

        if (isAdmin) {
          const navLinks = document.querySelector(".nav-links");
          const adminLink = document.createElement("li");
          adminLink.innerHTML = `<a href="admin.html">ADMIN</a>`;
          navLinks.appendChild(adminLink);
        }
      }
    }
  });

  renderProducts(products);
});
