// Deutsch1000 — local version (no Supabase, no account required)

let words = [];

const $ = id => document.getElementById(id);
const progressKey = "deutsch1000-progress-v1";

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(progressKey) || "{}");
  } catch {
    return {};
  }
}

let progress = readProgress();
let currentIndex = 0;
let revealed = false;
let filtered = [];

const historyKey = "deutsch1000-recent-v1";
const MAX_RECENT = 10;

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(historyKey) || "[]");
  } catch {
    return [];
  }
}

let recentWordIds = readHistory();

function saveHistory() {
  localStorage.setItem(historyKey, JSON.stringify(recentWordIds));
}

function recordWord(word) {
  if (!word) return;

  recentWordIds = recentWordIds.filter(id => id !== word.id);
  recentWordIds.push(word.id);

  if (recentWordIds.length > MAX_RECENT) {
    recentWordIds = recentWordIds.slice(-MAX_RECENT);
  }

  saveHistory();
}

const typeLabels = {
  noun: "NOUN",
  verb: "VERB",
  adjective: "ADJECTIVE",
  adverb: "ADVERB",
  preposition: "PREPOSITION",
  conjunction: "CONJUNCTION",
  expression: "EXPRESSION",
  "verb-preposition": "VERB + PREPOSITION",
  "sentence-pattern": "SENTENCE PATTERN",
  connector: "CONNECTOR"
};

function saveLocal() {
  localStorage.setItem(progressKey, JSON.stringify(progress));
  updateStats();
}

function statusOf(word) {
  return progress[word.id]?.status || "new";
}

function escapeHTML(value) {
  return String(value ?? "—").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function shuffleCards(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectRandomWord() {
  if (!filtered.length) return -1;

  // Exclude recently shown review cards.
  let candidates = filtered.filter(word =>
    !(statusOf(word) === "review" &&
      recentWordIds.includes(word.id))
  );

  // If all available cards are temporarily excluded,
  // relax the restriction.
  if (!candidates.length) {
    candidates = [...filtered];
  }

  // Known cards have only 20% of normal selection weight.
  const weightedCandidates = candidates.map(word => ({
    word,
    weight: statusOf(word) === "known" ? 0.2 : 1
  }));

  const totalWeight = weightedCandidates.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  let random = Math.random() * totalWeight;

  for (const item of weightedCandidates) {
    random -= item.weight;

    if (random < 0) {
      return filtered.indexOf(item.word);
    }
  }

  return filtered.indexOf(
    weightedCandidates[weightedCandidates.length - 1].word
  );
}

function showRandomWord() {
  currentIndex = selectRandomWord();
  revealed = false;

  if (currentIndex >= 0) {
    recordWord(filtered[currentIndex]);
  }

  render();
}

function applyFilters() {
  const type = $("type-filter").value;
  const status = $("status-filter").value;
  const query = $("search").value.trim().toLowerCase();

  filtered = words.filter(word =>
    (type === "all" || word.type === type) &&
    (status === "all" ||
      (status === "studied" && Boolean(progress[word.id]?.seen)) ||
      (status === "new" && !progress[word.id]?.seen) ||
      (status === "review" && statusOf(word) === "review") ||
      (status === "known" && statusOf(word) === "known")) &&
    (!query || [
      word.de, word.en, word.zh, word.topic, word.level, word.example
    ].join(" ").toLowerCase().includes(query))
  );

  const selected = $("type-filter").selectedOptions[0].textContent;

  $("deck-title").textContent =
    type === "all" ? "All vocabulary" : selected;

  showRandomWord();
}

function updateStats() {
  const studied = words.filter(word => progress[word.id]?.seen).length;
  const known = words.filter(word => statusOf(word) === "known").length;
  const review = words.filter(word => statusOf(word) === "review").length;

  $("studied-count").textContent = studied;
  $("known-count").textContent = known;
  $("review-count").textContent = review;

  const percent = words.length ? Math.round(known / words.length * 100) : 0;
  $("progress-percent").textContent = percent + "%";
  $("progress-bar").style.width = percent + "%";
}

function detail(label, value) {
  return `<div class="detail"><label>${escapeHTML(label)}</label><p>${escapeHTML(value || "—")}</p></div>`;
}

function render() {
  $("total-count").textContent = words.length;

  if (!filtered.length) {
    $("card-position").textContent = "0 / 0";
    $("word-type").textContent = "NO CARDS";
    $("card-front").innerHTML = '<div class="word-main">No matching cards</div><div class="word-sub">Try changing your filters.</div>';
    $("card-back").classList.add("hidden");
    $("feedback").textContent = "";
    $("flip-btn").textContent = "Reveal answer";
    return;
  }

  currentIndex = Math.max(0, Math.min(currentIndex, filtered.length - 1));
  const word = filtered[currentIndex];
  const reverse = $("direction").value === "en-de";

  $("card-position").textContent = `${currentIndex + 1} / ${filtered.length}`;
  $("word-type").textContent = typeLabels[word.type] || String(word.type || "WORD").toUpperCase();

  $("card-front").innerHTML = reverse
    ? `<div class="word-main">${escapeHTML(word.en)}</div><div class="word-sub">${escapeHTML(word.zh)}</div>`
    : `<div class="word-main">${escapeHTML(word.de)}</div><div class="word-sub">${word.type === "noun" ? escapeHTML(word.plural || "Singular") : escapeHTML(word.level || "German vocabulary")}</div>`;

  $("front-hint").textContent = reverse ? "English + Chinese meaning" : "German vocabulary";

  const grammarDetails = word.type === "noun"
    ? detail("Plural", word.plural)
    : word.type === "verb"
      ? `${detail("Präteritum", word.praet)}${detail("Perfekt", word.perf)}${detail("Preposition", word.prep)}`
      : `${detail("Category", typeLabels[word.type] || word.type)}${detail("Level", word.level)}${detail("Topic", word.topic)}${detail("Usage / pattern", word.prep || word.usage)}`;

  $("card-back").innerHTML = `
    <p class="eyebrow">ANSWER & DETAILS</p>
    <h3>${escapeHTML(word.de)}</h3>
    <div class="detail-grid">
      ${detail("English", word.en)}
      ${detail("中文", word.zh)}
      ${grammarDetails}
      ${detail("Synonym", word.synonyms)}
      ${detail("Antonym", word.antonyms)}
      ${detail("Level", word.level)}
      ${detail("Topic", word.topic)}
    </div>
    <div class="example">
      <label class="eyebrow">EXAMPLE</label>
      <p><strong>${escapeHTML(word.example)}</strong></p>
      <p class="translation">${escapeHTML(word.exampleEn)}</p>
      <p class="translation">${escapeHTML(word.exampleZh)}</p>
    </div>`;

  $("card-back").classList.toggle("hidden", !revealed);
  $("flip-btn").textContent = revealed ? "Hide answer" : "Reveal answer";

  const status = statusOf(word);
  $("feedback").textContent = status === "known"
    ? "You marked this card as understood."
    : status === "review"
      ? "This card is in your repeat list."
      : "";
}

function flip() {
  if (!filtered.length) return;
  revealed = !revealed;
  $("card-back").classList.toggle("hidden", !revealed);
  $("flip-btn").textContent = revealed ? "Hide answer" : "Reveal answer";

  if (revealed) {
    const word = filtered[currentIndex];
    if (!progress[word.id]?.seen) {
      progress[word.id] = { ...(progress[word.id] || {}), seen: true };
      saveLocal();
    }
  }
}

function move(delta) {
  if (!filtered.length) return;

  showRandomWord();
}

function rate(status) {
  if (!filtered.length) return;

  const word = filtered[currentIndex];
  const previous = progress[word.id] || {};
  const intervalDays = status === "known" ? 4 : 1;
  const due = new Date();
  due.setDate(due.getDate() + intervalDays);

  progress[word.id] = {
    ...previous,
    seen: true,
    status,
    intervalDays,
    dueAt: due.toISOString(),
    lastRatedAt: new Date().toISOString()
  };

  saveLocal();
  $("feedback").textContent = status === "known"
    ? "Great — marked as understood. Review scheduled in 4 days."
    : "Added to your repeat list. Review scheduled for tomorrow.";
  move(1);
}

$("flashcard").addEventListener("click", flip);
$("flashcard").addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    flip();
  }
});

$("flip-btn").onclick = flip;
$("previous-btn").onclick = () => move(-1);
$("next-btn").onclick = () => move(1);
$("again-btn").onclick = () => rate("review");
$("known-btn").onclick = () => rate("known");

["direction", "type-filter", "status-filter"].forEach(id =>
  $(id).addEventListener("change", applyFilters)
);
$("search").addEventListener("input", applyFilters);

async function loadVocabulary() {
  try {
    const response = await fetch("./vocabulary.json");
    if (!response.ok) {
      throw new Error(`Could not load vocabulary.json (HTTP ${response.status})`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("vocabulary.json must contain a JSON array.");
    }

    words = data;
    applyFilters();
    updateStats();
  } catch (error) {
    console.error("Deutsch1000 vocabulary loading error:", error);
    $("total-count").textContent = "0";
    $("card-position").textContent = "0 / 0";
    $("word-type").textContent = "LOAD ERROR";
    $("card-front").innerHTML = '<div class="word-main">Could not load vocabulary</div><div class="word-sub">Make sure vocabulary.json is in the same folder and open the project with a local web server.</div>';
    $("card-back").classList.add("hidden");
    $("feedback").textContent = "Check the browser console for details.";
    updateStats();
  }
}

loadVocabulary();
