// World's Best Boss Tab — Michael Scott Extension
// "I'm not superstitious, but I am a little stitious." — Michael Scott

'use strict';

// 25 classic Michael Scott quotes, hand-picked from the show
const QUOTES = [
  "I am the best boss in the world. And I will prove it. By being the best boss in the world.",
  "Would I rather be feared or loved? Easy. Both. I want people to be afraid of how much they love me.",
  "I'm not superstitious, but I am a little stitious.",
  "I knew exactly what to do, but in a much more real sense I had no idea what to do.",
  "People will never be replaced by machines. In the end, life and business are about human connections. And computers are about trying to murder you in a lake.",
  "I am running away from my responsibilities. And it feels good.",
  "An office is for not dying. An office is a place to live life to the fullest, to the max, to... an office is a place where dreams come true.",
  "I'm an early bird and I'm a night owl so I'm wise and I have worms.",
  "Wikipedia is the best thing ever. Anyone in the world can write anything they want about any subject, so you know you are getting the best possible information.",
  "I love inside jokes. I'd love to be a part of one someday.",
  "I am Beyoncé, always.",
  "This is the best day of my life. Wait, no — that was the day I met Magic Johnson. But this is definitely top three.",
  "Sometimes I'll start a sentence and I don't even know where it's going. I just hope I find it along the way.",
  "Do I need to be liked? Absolutely not. I like to be liked. I enjoy being liked. I have to be liked. But it's not like a compulsive need to be liked, like my need to be praised.",
  "I want people to be afraid of how much they love me.",
  "The worst thing about prison was the Dementors.",
  "There is no such thing as an appropriate joke. That's why it's a joke.",
  "I live by one rule: No office romances, no way. Very messy, inappropriate... but I live by another rule: Just do it.",
  "My philosophy is basically this, and this is something that I live by, and I always have, and I always will: don't ever, for any reason, do anything, to anyone, for any reason, ever.",
  "I have a lot of questions. Number one: how dare you?",
  "Fool me once, strike one. Fool me twice, strike three.",
  "Why are you the way that you are?",
  "I don't understand the hype around death. It happens to everyone. Big deal.",
  "Business is always personal. It's the most personal thing in the world.",
  "You miss 100% of the shots you don't take. — Wayne Gretzky. — Michael Scott."
];

// ————— Clock & Date —————

function updateClock() {
  const now = new Date();

  // Time
  const hours   = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;

  // Date
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const day   = days[now.getDay()];
  const month = months[now.getMonth()];
  const date  = now.getDate();
  const year  = now.getFullYear();
  document.getElementById('date').textContent = `${day}, ${month} ${date}, ${year}`;
}

setInterval(updateClock, 1000);
updateClock();

// ————— Quotes —————

let currentQuoteIndex = -1;
let twssApplied = false;

function pickNewQuoteIndex() {
  let next;
  do {
    next = Math.floor(Math.random() * QUOTES.length);
  } while (next === currentQuoteIndex);
  return next;
}

function showQuote(index) {
  twssApplied = false;
  currentQuoteIndex = index;
  const quoteText = document.getElementById('quote-text');
  const quoteCard = document.getElementById('quote-card');
  quoteCard.classList.remove('twss-appended');
  // Render plain quote text (no TWSS yet)
  quoteText.textContent = `"${QUOTES[index]}"`;
}

// Load a random quote on startup
showQuote(pickNewQuoteIndex());

// New Quote button
document.getElementById('new-quote-btn').addEventListener('click', () => {
  showQuote(pickNewQuoteIndex());
});

// ————— TWSS button —————

document.getElementById('twss-btn').addEventListener('click', () => {
  const quoteText = document.getElementById('quote-text');
  const quoteCard = document.getElementById('quote-card');

  // Add " That's what she said!" inline with animation
  if (!twssApplied) {
    twssApplied = true;
    quoteCard.classList.add('twss-appended');

    const span = document.createElement('span');
    span.className = 'twss-append';
    span.textContent = " That's what she said!";
    quoteText.appendChild(span);
  }

  // Show the fullscreen overlay briefly
  const overlay = document.getElementById('twss-overlay');
  overlay.classList.add('active');
  setTimeout(() => overlay.classList.remove('active'), 1200);
});

// Click overlay to dismiss early
document.getElementById('twss-overlay').addEventListener('click', () => {
  document.getElementById('twss-overlay').classList.remove('active');
});
