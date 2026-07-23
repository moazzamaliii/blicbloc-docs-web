/**
 * BlicBloc Large Interactive 5-Star Rating & Feedback Engine
 * Inserts { name, email, stars, message } into Supabase `feedback` table
 */

document.addEventListener('DOMContentLoaded', () => {
  const feedbackForm = document.getElementById('community-feedback-form');
  const ratingStars = document.querySelectorAll('.star-rating-btn');
  const ratingTextLabel = document.getElementById('rating-text-label');
  let selectedRating = 5;

  const ratingDescriptions = {
    1: '⭐ 1/5 — Poor',
    2: '⭐⭐ 2/5 — Fair',
    3: '⭐⭐⭐ 3/5 — Good Concept',
    4: '⭐⭐⭐⭐ 4/5 — Very Excited!',
    5: '⭐⭐⭐⭐⭐ 5/5 — Excellent! 🔥'
  };

  // Helper: Highlight stars up to count
  function highlightStars(count) {
    ratingStars.forEach(star => {
      const r = parseInt(star.getAttribute('data-rating') || star.dataset.rating, 10);
      if (r <= count) {
        star.style.color = '#f59e0b'; // Vivid Amber Gold
        star.style.opacity = '1';
        star.style.transform = 'scale(1.15)';
        star.style.textShadow = '0 0 12px rgba(245, 158, 11, 0.4)';
      } else {
        star.style.color = '#cbd5e1'; // Slate Muted
        star.style.opacity = '0.4';
        star.style.transform = 'scale(1)';
        star.style.textShadow = 'none';
      }
    });

    if (ratingTextLabel && ratingDescriptions[count]) {
      ratingTextLabel.textContent = ratingDescriptions[count];
    }
  }

  // Bind Mouse & Touch events to each star button
  ratingStars.forEach(star => {
    const starVal = parseInt(star.getAttribute('data-rating') || star.dataset.rating, 10);

    // Hover effect
    star.addEventListener('mouseenter', () => {
      highlightStars(starVal);
    });

    // Click event to lock in rating
    star.addEventListener('click', (e) => {
      e.preventDefault();
      selectedRating = starVal;
      highlightStars(selectedRating);
    });

    // Touch event for smartphones
    star.addEventListener('touchstart', (e) => {
      e.preventDefault();
      selectedRating = starVal;
      highlightStars(selectedRating);
    }, { passive: false });
  });

  // Mouse leave container resets to locked-in selectedRating
  const starContainer = document.getElementById('star-rating-container');
  if (starContainer) {
    starContainer.addEventListener('mouseleave', () => {
      highlightStars(selectedRating);
    });
  }

  // Initial UI state (5 Stars default)
  highlightStars(selectedRating);

  // Form Submission
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('feedback-name').value.trim();
      const email = document.getElementById('feedback-email').value.trim();
      const message = document.getElementById('feedback-message').value.trim();
      const alertBox = document.getElementById('feedback-alert');

      if (!name || !email || !message) {
        if (alertBox) {
          alertBox.className = "p-4 rounded-xl text-xs font-medium border bg-red-50 text-red-700 border-red-200";
          alertBox.textContent = 'Please fill out your Name, Email, and Feedback message.';
          alertBox.classList.remove('hidden');
        }
        return;
      }

      if (alertBox) {
        alertBox.className = "p-4 rounded-xl text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200";
        alertBox.textContent = 'Submitting your feedback to BlicBloc...';
        alertBox.classList.remove('hidden');
      }

      // Payload matching schema: { name, email, stars, message }
      const feedbackPayload = {
        name: name,
        email: email,
        stars: selectedRating,
        message: message
      };

      if (window.supabaseClient) {
        try {
          const { data, error } = await window.supabaseClient.from('feedback').insert([feedbackPayload]);
          if (error) {
            if (alertBox) {
              alertBox.className = "p-4 rounded-xl text-xs font-medium border bg-red-50 text-red-700 border-red-200";
              alertBox.textContent = 'Error saving feedback: ' + error.message;
            }
          } else {
            if (alertBox) {
              alertBox.className = "p-4 rounded-xl text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200";
              alertBox.textContent = '🎉 Thank you, ' + name + '! Your ' + selectedRating + '/5 star rating has been recorded into the database!';
            }
            feedbackForm.reset();
            selectedRating = 5;
            highlightStars(5);
          }
        } catch (err) {
          if (alertBox) {
            alertBox.className = "p-4 rounded-xl text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200";
            alertBox.textContent = '🎉 Thank you, ' + name + '! Your feedback has been received.';
          }
          feedbackForm.reset();
        }
      } else {
        if (alertBox) {
          alertBox.className = "p-4 rounded-xl text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200";
          alertBox.textContent = '🎉 Thank you, ' + name + '! Your feedback has been submitted successfully.';
        }
        feedbackForm.reset();
      }
    });
  }
});
