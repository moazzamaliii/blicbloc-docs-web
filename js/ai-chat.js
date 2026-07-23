/**
 * BlicBloc AI Floating Chatbot Engine
 * Powered by Groq LLM API (llama-3.3-70b-versatile)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inject Floating Chat Widget HTML if not present
  if (!document.getElementById('blicbloc-ai-widget')) {
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'blicbloc-ai-widget';
    widgetContainer.innerHTML = `
      <!-- Floating Toggle Button -->
      <button id="ai-chat-toggle-btn" class="ai-chat-toggle" title="Chat with BlicBloc AI Assistant">
        <span class="ai-icon">🤖</span>
        <span class="ai-btn-text">Ask AI</span>
        <span class="ai-badge-pulse"></span>
      </button>

      <!-- AI Chat Modal Container -->
      <div id="ai-chat-modal" class="ai-chat-modal">
        <!-- Header -->
        <div class="ai-chat-header">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div class="ai-avatar">🤖</div>
            <div>
              <div class="ai-title">BlicBloc AI Guide</div>
              <div class="ai-status"><span class="status-dot"></span> Online &bull; Powered by Groq</div>
            </div>
          </div>
          <button id="ai-chat-close-btn" class="ai-close-btn" aria-label="Close Chat">&times;</button>
        </div>

        <!-- Chat Body Messages -->
        <div id="ai-chat-messages" class="ai-chat-messages">
          <!-- Initial Assalamu Alaikum Message -->
          <div class="ai-msg assistant-msg">
            <div class="msg-content">
              <strong>Assalamu Alaikum! 🖐️</strong><br />
              Welcome to BlicBloc! I am your AI assistant. Ask me anything about MainSpaces, Blics & Sparks, custom domains, or creator tools!
            </div>
          </div>
        </div>

        <!-- Quick Suggestion Chips -->
        <div class="ai-chips-row">
          <button class="ai-chip-btn" data-question="What is a MainSpace?">What is a MainSpace?</button>
          <button class="ai-chip-btn" data-question="What is the difference between Blics and Sparks?">Blics vs Sparks</button>
          <button class="ai-chip-btn" data-question="How do custom domains work on BlicBloc?">Custom Domains</button>
          <button class="ai-chip-btn" data-question="What are the pricing and storage tiers?">Pricing & Storage</button>
        </div>

        <!-- Input Footer -->
        <div class="ai-chat-footer">
          <form id="ai-chat-form" style="display:flex; gap:0.5rem; width:100%;">
            <input type="text" id="ai-chat-input" placeholder="Ask a question about BlicBloc..." required autocomplete="off" />
            <button type="submit" id="ai-chat-send-btn" class="ai-send-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(widgetContainer);
  }

  // Inject CSS Styles for AI Widget
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .ai-chat-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      background: linear-gradient(135deg, var(--primary) 0%, #4338ca 100%);
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.3);
      padding: 0.75rem 1.25rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ai-chat-toggle:hover {
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 14px 30px rgba(99, 102, 241, 0.5);
    }
    .ai-badge-pulse {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: pulse-green 2s infinite;
    }
    @keyframes pulse-green {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .ai-chat-modal {
      position: fixed;
      bottom: 90px;
      right: 24px;
      z-index: 9999;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 120px);
      background: var(--bg-secondary);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ai-chat-modal.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .ai-chat-header {
      background: var(--bg-surface-elevated);
      padding: 0.85rem 1.15rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ai-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .ai-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    .ai-status {
      font-size: 0.725rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
    }
    .ai-close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0 0.25rem;
      line-height: 1;
    }
    .ai-close-btn:hover { color: var(--text-primary); }

    .ai-chat-messages {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      background: var(--bg-surface);
    }
    .ai-msg {
      display: flex;
      flex-direction: column;
      max-width: 85%;
    }
    .ai-msg.user-msg {
      align-self: flex-end;
    }
    .ai-msg.assistant-msg {
      align-self: flex-start;
    }
    .ai-msg .msg-content {
      padding: 0.75rem 1rem;
      border-radius: 16px;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .user-msg .msg-content {
      background: var(--primary);
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }
    .assistant-msg .msg-content {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      border-bottom-left-radius: 4px;
    }

    .ai-chips-row {
      display: flex;
      gap: 0.4rem;
      padding: 0.5rem 0.85rem;
      overflow-x: auto;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-subtle);
      white-space: nowrap;
    }
    .ai-chip-btn {
      font-size: 0.75rem;
      padding: 0.3rem 0.65rem;
      border-radius: 9999px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
    }
    .ai-chip-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    .ai-chat-footer {
      padding: 0.75rem 0.85rem;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-subtle);
    }
    .ai-chat-footer input {
      flex: 1;
      padding: 0.6rem 0.85rem;
      border-radius: 9999px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      color: var(--text-primary);
      font-size: 0.875rem;
      outline: none;
    }
    .ai-chat-footer input:focus {
      border-color: var(--primary);
    }
    .ai-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform 0.2s;
    }
    .ai-send-btn:hover {
      transform: scale(1.05);
    }

    @media (max-width: 480px) {
      .ai-chat-toggle {
        bottom: 16px;
        right: 16px;
        padding: 0.65rem 1rem;
        font-size: 0.85rem;
      }
      .ai-chat-modal {
        bottom: 80px;
        right: 16px;
        width: calc(100vw - 32px);
        height: 460px;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // Widget Elements
  const toggleBtn = document.getElementById('ai-chat-toggle-btn');
  const closeBtn = document.getElementById('ai-chat-close-btn');
  const modal = document.getElementById('ai-chat-modal');
  const chatMessages = document.getElementById('ai-chat-messages');
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-chat-input');
  const chipBtns = document.querySelectorAll('.ai-chip-btn');

  // System Prompt for Groq AI
  const systemPrompt = `You are BlicBloc AI, an intelligent, polite, and enthusiastic assistant for BlicBloc (the creator-first digital ecosystem built by Moazzam Ali).

Greeting Rule: Always greet users politely (e.g. "Wa Alaikum Assalam!" when greeted with Assalamu Alaikum, or "Hello!").

Release Date Rule: When asked about the platform release date or launch date, state clearly and politely: "BlicBloc is currently in active concept development and community preview phase. There is no official release date fixed yet—it will be decided and announced later to our early community supporters!"

Platform Knowledge Base:
- BlicBloc Vision: BlicBloc unifies long-form professional publishing (Blics), lightweight instant updates (Sparks), public creator identity (MainSpace), and private content management (Creator Space) under one custom URL.
- Core Quote: "All platforms are better, but what BlicBloc does is another type of satisfaction."
- MainSpace: The public creator homepage where visitors discover work, track creators, and explore tabs.
- Subdomain vs Custom Domain: Creators get free subdomains (username.blicbloc.com) or can connect custom root domains (yourname.com).
- Multiple MainSpaces: Creators can run multiple spaces (teaching, freelancing, personal projects) under a single account.
- Blics: Primary long-form durable content in 5 types (Article Blic, Video Blic, Project Blic, Resource Blic, Image Blic).
- Sparks: Quick, lightweight updates published instantly to the MainSpace stream.
- Target Audience: Teachers, Freelancers, Developers, Designers, Startups, Writers, Educators.
- Storage Tiers: Free (5 GB), Pro $9/mo (50 GB), Creator $19/mo (250 GB), Studio $39/mo (1 TB).

Be helpful, concise, formatting key terms in bold or lists, and encourage users to submit feedback on the landing page!`;

  let conversationHistory = [
    { role: "system", content: systemPrompt }
  ];

  // Toggle Modal
  toggleBtn.addEventListener('click', () => {
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
      chatInput.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Handle Quick Question Chips
  chipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.question;
      if (q) {
        chatInput.value = q;
        sendMessage(q);
      }
    });
  });

  // Handle Form Submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (msg) {
      sendMessage(msg);
    }
  });

  // Send Message function (Vercel Serverless API + Direct Client Fallback)
  async function sendMessage(text) {
    appendMessage(text, 'user');
    chatInput.value = '';

    conversationHistory.push({ role: 'user', content: text });

    // Typing Indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-msg assistant-msg typing-msg';
    typingDiv.innerHTML = `<div class="msg-content" style="color:var(--text-muted); font-style:italic">BlicBloc AI is thinking...</div>`;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const modelName = window.GROQ_MODEL || "llama-3.3-70b-versatile";

    // 1. Try Vercel Serverless API Endpoint (/api/chat) first
    try {
      const vercelRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          messages: conversationHistory
        })
      });

      if (vercelRes.ok) {
        const data = await vercelRes.json();
        typingDiv.remove();
        const aiReply = data.choices[0]?.message?.content || "Assalamu Alaikum! How else can I assist you with BlicBloc?";
        conversationHistory.push({ role: 'assistant', content: aiReply });
        appendMessage(formatMarkdown(aiReply), 'assistant', true);
        return;
      }

      // If Vercel API returns an error message specifically about GROQ_API_KEY missing on Vercel
      if (vercelRes.status === 500) {
        const errData = await vercelRes.json();
        if (errData.error?.message?.includes('GROQ_API_KEY')) {
          console.warn('Vercel API notice:', errData.error.message);
        }
      }
    } catch (e) {
      // /api/chat not available (e.g. static local server) - proceed to fallback below
    }

    // 2. Fallback: Direct Client API call using window.GROQ_API_KEY
    const apiKey = window.GROQ_API_KEY;

    if (!apiKey || apiKey.includes('YOUR_GROQ')) {
      typingDiv.remove();
      appendMessage("Assalamu Alaikum! BlicBloc AI is online. Please make sure GROQ_API_KEY is added to your Vercel Environment Variables (or configured in js/groq-config.js).", 'assistant');
      return;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: conversationHistory,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      typingDiv.remove();

      if (!response.ok) {
        const errData = await response.json();
        appendMessage(`Sorry, Groq API error: ${errData.error?.message || 'Failed to generate response'}`, 'assistant');
        return;
      }

      const data = await response.json();
      const aiReply = data.choices[0]?.message?.content || "Assalamu Alaikum! How else can I assist you with BlicBloc?";

      conversationHistory.push({ role: 'assistant', content: aiReply });
      appendMessage(formatMarkdown(aiReply), 'assistant', true);

    } catch (err) {
      typingDiv.remove();
      appendMessage(`Network error connecting to AI assistant: ${err.message}`, 'assistant');
    }
  }

  function appendMessage(content, sender, isHTML = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ${sender}-msg`;
    const contentDiv = document.createElement('div');
    contentDiv.className = 'msg-content';

    if (isHTML) {
      contentDiv.innerHTML = content;
    } else {
      contentDiv.textContent = content;
    }

    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function formatMarkdown(text) {
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
    return formatted;
  }
});
