/* =========================================================
   chatbot.js: front-end behaviour for the portfolio chatbot
   0. Settings
   1. Open / close the chat
   2. "Ask me" bubble
   3. Sending and showing messages
   4. getBotReply(): talks to the Worker backend
   ========================================================= */
(() => {
  'use strict';

  /* ---------- 0. Settings ---------- */
  // Paste your Worker URL here after you deploy it, e.g.
  // 'https://portfolio-chatbot.yourname.workers.dev'
  const CHAT_API_URL = 'https://portfolio-chatbot.akonahombedzi4.workers.dev';

  const MAX_HISTORY = 10;       // messages sent to the backend each time
  const FALLBACK = "Sorry, I can't answer right now. You can email akonahombedzi4@gmail.com instead.";

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
  const history = [];           // [{ role: 'user' | 'assistant', content: '...' }]

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
    el.textContent = text;                       // textContent keeps the text safe
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
    history.push({ role: 'user', content: text });
    input.value = '';

    const typing = showTyping();
    const reply = await getBotReply();
    typing.remove();
    addMessage(reply.text, 'bot');
    if (reply.ok) history.push({ role: 'assistant', content: reply.text });

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

  /* ---------- 4. Backend call ---------- */
  // Sends the recent conversation to the Worker and returns { ok, text }
  async function getBotReply() {
    if (CHAT_API_URL.includes('PASTE_YOUR')) {
      return { ok: false, text: 'The chatbot is not connected yet. Add the Worker URL in Js/chatbot.js.' };
    }

    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-MAX_HISTORY) })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.reply) return { ok: true, text: data.reply };
      if (res.status === 429) return { ok: false, text: 'You are sending messages too quickly. Please wait a minute and try again.' };
      return { ok: false, text: data.error || FALLBACK };
    } catch (err) {
      return { ok: false, text: FALLBACK };
    }
  }
})();
