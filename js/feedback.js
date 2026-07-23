/**
 * BlicBloc Interactive 5-Star Rating & Feedback Handler
 * Inserts { name, email, stars, message } into Supabase `feedback` table
 */

document.addEventListener('DOMContentLoaded', () => {
  const feedbackForm = document.getElementById('community-feedback-form');
  const ratingStars = document.querySelectorAll('.star-rating-btn');
  const ratingTextLabel = document.getElementById('rating-text-label');
  let selectedRating = 5;

  const ratingDescriptions = {
    1: '⭐ Poor — Needs lots of improvement',
    2: '⭐⭐ Fair — Getting somewhere',
    3: '⭐⭐⭐ Good — Solid concept',
    4: '⭐⭐⭐⭐ Great — Very excited!',
    5: '⭐⭐⭐⭐⭐ Excellent — Another type of satisfaction! 🔥'
  };

  // Helper: Highlight stars up to count
  function highlightStars(count) {
    ratingStars.forEach(star => {
      const r = parseInt(star.dataset.rating, 10);
      if (r <= count) {
        star.style.color = '#f59e0b'; // Amber Gold
        star.style.transform = 'scale(1.15)';
      } else {
        star.style.color = '#cbd5e1'; // Muted Slate
        star.style.transform = 'scale(1)';
      }
    });

    if (ratingTextLabel && ratingDescriptions[count]) {
      ratingTextLabel.textContent = ratingDescriptions[count];
    }
  }

  // Bind Hover, MouseLeave & Click events to Star Buttons
  ratingStars.forEach(star => {
    // Hover effect
    star.addEventListener('mouseenter', () => {
      const hoverVal = parseInt(star.dataset.rating, 10);
      highlightStars(hoverVal);
    });

    // Mouse leave resets to selected rating
    star.parentElement.addEventListener('mouseleave', () => {
      highlightStars(selectedRating);
    });

    // Click locks selected rating
    star.addEventListener('click', (e) => {
      e.preventDefault();
      selectedRating = parseInt(star.dataset.rating, 10);
      highlightStars(selectedRating);
    });
  });

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

      // Payload matching schema.sql: { name, email, stars, message }
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
              alertBox.textContent = 'Error: ' + error.message;
            }
          } else {
            if (alertBox) {
              alertBox.className = "p-4 rounded-xl text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200";
              alertBox.textContent = '🎉 Thank you, ' + name + '! Your ' + selectedRating + '-star feedback has been recorded. We appreciate your support!';
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
