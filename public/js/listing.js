import { db } from "./firebaseInit.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { auth } from "./firebaseInit.js";

document.addEventListener('DOMContentLoaded', () => {
  const listingForm = document.getElementById('listingForm');
  const submitButton = document.querySelector('.btn-submit');
  const imageInput = document.getElementById('image');

  // Add file input listener to validate and show selected filename
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        imageInput.value = '';
        return;
      }
      
      // Validate file name (no spaces or special characters)
      const safeName = file.name.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
      if (safeName !== file.name) {
        alert('Note: The image filename will be saved as: ' + safeName);
      }
    }
  });

  listingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert('Please sign in to list a book');
      window.location.href = 'userLogin.html';
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';

      // Get image filename and sanitize it
      const imageFile = imageInput.files[0];
      if (!imageFile) {
        throw new Error('Please select an image file');
      }

      const safeName = imageFile.name.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
      const imagePath = `../assets/images/${safeName}`;

      const formData = {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
        edition: parseInt(document.getElementById('edition').value),
        price: parseFloat(document.getElementById('price').value),
        subject: document.getElementById('subject').value,
        condition: document.getElementById('condition').value,
        image: imagePath,
        userId: auth.currentUser.uid,
        isApproved: false,
        createdAt: new Date().toISOString(),
        location: 'Campus'
      };

      const docRef = await addDoc(collection(db, "products"), formData);
      console.log("Product submitted with ID:", docRef.id);

      // Show detailed instructions
      const message = `
Listing submitted successfully!

IMPORTANT: To complete the listing, please:
1. Save your image as: ${safeName}
2. Place it in the project's /public/assets/images/ directory
3. The image will then appear with your listing

Your listing ID is: ${docRef.id}`;

      alert(message);
      listingForm.reset();
      window.location.href = 'products.html';

    } catch (error) {
      console.error('Error submitting listing:', error);
      alert(error.message || 'Failed to submit listing. Please try again.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit for Review';
    }
  });
});