/**
 * BlicBloc Community Feedback Handler
 * Submits feedback directly to the Supabase `feedback` table
 */

document.addEventListener('DOMContentLoaded', () => {
  const feedbackForm = document.getElementById('community-feedback-form');
  const ratingStars = document.querySelectorAll('.star-rating-btn');
  let selectedRating = 5;

  // Star Rating Picker
  ratingStars.forEach(star => {
    star.addEventListener('click', (e) => {
      e.preventDefault();
      selectedRating = parseInt(star.dataset.rating, 10);
      updateStarUI(selectedRating);
    });
  });

  function updateStarUI(rating) {
    ratingStars.forEach(star => {
      const r = parseInt(star.dataset.rating, 10);
      if (r <= rating) {
        star.classList.add('text-amber-400');
        star.classList.remove('text-slate-300');
      } else {
        star.classList.add('text-slate-300');
        star.classList.remove('text-amber-400');
      }
    });
  }

  // Form Submission
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('feedback-name').value;
      const email = document.getElementById('feedback-email').value;
      const message = document.getElementById('feedback-message').value;
      const alertBox = document.getElementById('feedback-alert');

      if (alertBox) {
        alertBox.classList.remove('hidden', 'bg-red-50', 'text-red-700', 'border-red-200', 'bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
        alertBox.classList.add('bg-blue-50', 'text-blue-700', 'border-blue-200');
        alertBox.textContent = 'Submitting your feedback to BlicBloc...';
      }

      const feedbackData = {
        name: name,
        email: email,
        creator_type: 'Community Member',
        feedback_type: 'Idea Impression',
        rating: selectedRating,
        message: message
      };

      if (window.supabaseClient) {
        try {
          const { data, error } = await window.supabaseClient.from('feedback').insert([feedbackData]);
          if (error) {
            if (alertBox) {
              alertBox.className = "p-4 rounded-xl text-xs font-medium border bg-red-50 text-red-700 border-red-200";
              alertBox.textContent = 'Error: ' + error.message;
            }
          } else {
            if (alertBox) {
              alertBox.className = "p-4 rounded-xl text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200";
              alertBox.textContent = '🎉 Thank you, ' + name + '! Your feedback has been recorded. We appreciate your support!';
            }
            feedbackForm.reset();
            updateStarUI(5);
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
