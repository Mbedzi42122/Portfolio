/* =========================================================
   chatbot.js: front-end behaviour for the portfolio chatbot
   1. Open / close the chat
   2. "Ask me" bubble
   3. Sending and showing messages
   4. getBotReply(): temporary answers (replace with backend later)
   ========================================================= */
(() => {
  'use strict';

  const root = document.getElementById('chatbot');
  if (!root) return;

  const toggleBtn = document.getElementById('chat-toggle');
  const closeBtn = document.getElementById('chat-close');
  const bubble = document.getElementById('chat-bubble');
  const chatWindow = document.getElementById('chat-window');
  const messages = document.getElementById('chat-messages');
  const suggestions = document.getElementById('chat-suggestions');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  let greeted = false;
  let waiting = false;

  /* ---------- 1. Open / close ---------- */
  const setOpen = (open) => {
    root.classList.toggle('open', open);
    toggleBtn.setAttribute('aria-expanded', String(open));
    toggleBtn.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    chatWindow.setAttribute('aria-hidden', String(!open));

    if (open) {
      bubble.classList.remove('show');
      if (!greeted) {
        greeted = true;
        addMessage("Hi! I'm Akonaho's assistant. Ask me anything about his skills, projects or experience.", 'bot');
      }
      setTimeout(() => input.focus(), 300);
    }
  };

  toggleBtn.addEventListener('click', () => setOpen(!root.classList.contains('open')));
  closeBtn.addEventListener('click', () => {
    setOpen(false);
    toggleBtn.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('open')) setOpen(false);
  });

  /* ---------- 2. "Ask me" bubble ---------- */
  // Appears shortly after the page loads, and goes away once the chat is opened
  setTimeout(() => {
    if (!root.classList.contains('open')) bubble.classList.add('show');
  }, 1800);

  /* ---------- 3. Messages ---------- */
  function addMessage(text, who) {
    const el = document.createElement('div');
    el.className = 'msg msg-' + who;
    el.textContent = text;                       // textContent keeps user input safe
    messages.appendChild(el);
    scrollDown();
    return el;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'msg msg-bot typing';
    el.setAttribute('aria-label', 'Assistant is typing');
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    scrollDown();
    return el;
  }

  function scrollDown() {
    messages.scrollTop = messages.scrollHeight;
  }

  async function send(text) {
    text = text.trim();
    if (!text || waiting) return;

    waiting = true;
    sendBtn.disabled = true;
    suggestions.style.display = 'none';          // hide the quick questions after first use

    addMessage(text, 'user');
    input.value = '';

    const typing = showTyping();
    let reply;
    try {
      reply = await getBotReply(text);
    } catch (err) {
      reply = 'Sorry, something went wrong. Please try again.';
    }
    typing.remove();
    addMessage(reply, 'bot');

    waiting = false;
    sendBtn.disabled = false;
    input.focus();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send(input.value);
  });

  suggestions.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) send(btn.textContent);
  });

  /* ---------- 4. Replies ---------- */
  // TEMPORARY: simple keyword answers so the chat feels alive.
  // When the backend is ready, replace the body of this function with:
  //
  //   const res = await fetch('/api/chat', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ message })
  //   });
  //   const data = await res.json();
  //   return data.reply;
  async function getBotReply(message) {
    await new Promise((resolve) => setTimeout(resolve, 900));   // fake thinking time

    const m = message.toLowerCase();
    const has = (...words) => words.some((w) => m.includes(w));

    if (has('hello', 'hi ', 'hey', 'hi!') || m === 'hi') {
      return 'Hello! What would you like to know about Akonaho?';
    }
    if (has('skill', 'tech', 'stack', 'language', 'know')) {
      return 'Akonaho works with HTML, CSS, JavaScript, PHP, MySQL, Python, Java and C++, and uses Git and GitHub for version control.';
    }
    if (has('project', 'built', 'portfolio', 'work')) {
      return 'Featured projects: Pop a Prize (an interactive prize draw site), a Java Product Inventory Manager, and the De Legacies Salon Management System (queue + booking, PHP and MySQL).';
    }
    if (has('study', 'education', 'degree', 'university', 'honours', 'hons')) {
      return "He's a Computer Science graduate currently completing his Honours at the University of Limpopo.";
    }
    if (has('contact', 'email', 'phone', 'reach', 'hire', 'whatsapp')) {
      return 'You can email akonahombedzi4@gmail.com, call +27 73 024 3864, or use the contact form at the bottom of this page.';
    }
    if (has('intern', 'job', 'available', 'opportunit', 'role')) {
      return "Yes! Akonaho is open to internships, junior developer roles and collaborations.";
    }

    return "I'm still learning to answer that. Try asking about his skills, projects, education or how to contact him.";
  }
})();
