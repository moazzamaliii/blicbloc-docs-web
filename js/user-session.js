/**
 * BlicBloc Feedback & Community Actions Header Manager
 */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    renderHeaderActions();
  });

  function renderHeaderActions() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    // Check if feedback CTA already exists
    if (!headerActions.querySelector('.feedback-header-btn')) {
      const btn = document.createElement('a');
      btn.href = 'index.html#feedback';
      btn.className = 'btn btn-primary feedback-header-btn';
      btn.style.padding = '0.5rem 1rem';
      btn.style.fontSize = '0.85rem';
      btn.innerHTML = `
        <span>💬 Submit Feedback</span>
      `;
      headerActions.appendChild(btn);
    }
  }
})();
