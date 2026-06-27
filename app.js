// Main state
let allMatches = [];
let filteredMatches = [];

// DOM elements
const fetchBtn = document.getElementById('fetchBtn');
const matchesContainer = document.getElementById('matchesContainer');
const loadingSection = document.getElementById('loadingSection');
const errorBox = document.getElementById('errorBox');
const eventFilter = document.getElementById('eventFilter');
const sortBy = document.getElementById('sortBy');

// Event listeners
fetchBtn.addEventListener('click', fetchMatches);
eventFilter.addEventListener('change', applyFilters);
sortBy.addEventListener('change', applyFilters);

// Fetch upcoming matches from HLTV API proxy
async function fetchMatches() {
  showLoading(true);
  hideError();
  fetchBtn.disabled = true;

  try {
    // Note: HLTV doesn't have official API, using mock data structure
    // In production, use HLTV API proxy like hltv-api or scraper
    const mockMatches = generateMockMatches();
    
    allMatches = mockMatches.map(match => ({
      ...match,
      prediction: predictMatch(match)
    }));

    populateEventFilter();
    applyFilters();
  } catch (error) {
    showError('Chyba pri nacitani zapasu: ' + error.message);
  } finally {
    showLoading(false);
    fetchBtn.disabled = false;
  }
}

// Prediction algorithm using various statistics
function predictMatch(match) {
  const { team1, team2 } = match;
  
  // Weight factors for prediction
  const weights = {
    ranking: 0.30,
    recentForm: 0.25,
    headToHead: 0.20,
    mapPool: 0.15,
    currentStreak: 0.10
  };

  // Calculate individual scores
  let team1Score = 0;
  let team2Score = 0;

  // Ranking score (inverted - lower rank = better)
  if (team1.rank && team2.rank) {
    const rankDiff = team2.rank - team1.rank;
    team1Score += (rankDiff / Math.max(team1.rank, team2.rank)) * weights.ranking;
    team2Score -= (rankDiff / Math.max(team1.rank, team2.rank)) * weights.ranking;
  }

  // Recent form (win rate)
  team1Score += (team1.recentWinRate / 100) * weights.recentForm;
  team2Score += (team2.recentWinRate / 100) * weights.recentForm;

  // Head-to-head record
  if (team1.h2hWins && team2.h2hWins) {
    const h2hTotal = team1.h2hWins + team2.h2hWins;
    team1Score += (team1.h2hWins / h2hTotal) * weights.headToHead;
    team2Score += (team2.h2hWins / h2hTotal) * weights.headToHead;
  }

  // Map pool strength (average map win rate)
  team1Score += (team1.mapPoolStrength / 100) * weights.mapPool;
  team2Score += (team2.mapPoolStrength / 100) * weights.mapPool;

  // Current streak
  team1Score += (team1.currentStreak / 10) * weights.currentStreak;
  team2Score += (team2.currentStreak / 10) * weights.currentStreak;

  // Normalize to percentages
  const total = team1Score + team2Score;
  const team1WinProb = Math.round((team1Score / total) * 100);
  const team2WinProb = 100 - team1WinProb;

  // Calculate confidence level
  const probDiff = Math.abs(team1WinProb - team2WinProb);
  let confidence;
  if (probDiff > 30) confidence = 'high';
  else if (probDiff > 15) confidence = 'mid';
  else confidence = 'low';

  return {
    team1WinProb,
    team2WinProb,
    predictedWinner: team1WinProb > team2WinProb ? team1.name : team2.name,
    confidence,
    confidenceScore: probDiff
  };
}

// Generate mock match data
function generateMockMatches() {
  const teams = [
    { name: 'FaZe Clan', rank: 1, logo: 'https://img-cdn.hltv.org/teamlogo/zBgQY5_2LJkFcQ17AR5W0U.png?ixlib=java-2.1.0&w=100&s=90ac4e9d2cdaf7aa87e0d47c0bacc1ec' },
    { name: 'Natus Vincere', rank: 2, logo: 'https://img-cdn.hltv.org/teamlogo/dLRRyUVHDWdHx9SnQZgFZA.svg?ixlib=java-2.1.0&s=5e54d22b75e40a26c6e1ba8f143f04b5' },
    { name: 'Vitality', rank: 3, logo: 'https://img-cdn.hltv.org/teamlogo/pW64FSj0w2M0bBfJb8uS8v.svg?ixlib=java-2.1.0&s=c4e8cc7e7e7e7e7e7e7e7e7e7e7e7e7e' },
    { name: 'G2 Esports', rank: 4, logo: 'https://img-cdn.hltv.org/teamlogo/FurxP8yOQlxTSZBYEnjPF6.svg?ixlib=java-2.1.0&s=44e8c4b8e6cf8c8c8c8c8c8c8c8c8c8c' },
    { name: 'Spirit', rank: 5, logo: 'https://img-cdn.hltv.org/teamlogo/9iyqyqVN2_3u2vU9XPKyKA.png?ixlib=java-2.1.0&w=100&s=1e0fe0e0e0e0e0e0e0e0e0e0e0e0e0e0' },
    { name: 'MOUZ', rank: 6, logo: 'https://img-cdn.hltv.org/teamlogo/3H-TkC4CJCbITJvs1cLQ_h.svg?ixlib=java-2.1.0&s=5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e' },
    { name: 'Complexity', rank: 9, logo: 'https://img-cdn.hltv.org/teamlogo/7yLF3HeO20L_PGI7AjCMuj.svg?ixlib=java-2.1.0&s=6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e' },
    { name: 'ENCE', rank: 11, logo: 'https://img-cdn.hltv.org/teamlogo/c_a1hmYx8yULPX_5p2_OhP.svg?ixlib=java-2.1.0&s=7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e' }
  ];

  const events = ['IEM Katowice', 'BLAST Premier', 'ESL Pro League', 'PGL Major'];
  const maps = ['Mirage', 'Dust2', 'Inferno', 'Nuke', 'Ancient', 'Overpass', 'Anubis'];

  const matches = [];
  const now = Date.now();

  for (let i = 0; i < 12; i++) {
    const team1Idx = Math.floor(Math.random() * teams.length);
    let team2Idx = Math.floor(Math.random() * teams.length);
    while (team2Idx === team1Idx) {
      team2Idx = Math.floor(Math.random() * teams.length);
    }

    const team1Base = teams[team1Idx];
    const team2Base = teams[team2Idx];

    matches.push({
      id: `match_${i}`,
      event: events[Math.floor(Math.random() * events.length)],
      format: 'BO3',
      time: new Date(now + (i + 1) * 3600000 * 2),
      team1: {
        ...team1Base,
        recentWinRate: 60 + Math.random() * 35,
        mapPoolStrength: 55 + Math.random() * 40,
        currentStreak: Math.floor(Math.random() * 8) - 2,
        h2hWins: Math.floor(Math.random() * 5)
      },
      team2: {
        ...team2Base,
        recentWinRate: 60 + Math.random() * 35,
        mapPoolStrength: 55 + Math.random() * 40,
        currentStreak: Math.floor(Math.random() * 8) - 2,
        h2hWins: Math.floor(Math.random() * 5)
      }
    });
  }

  return matches;
}

// Filter and sort
function applyFilters() {
  let matches = [...allMatches];

  // Event filter
  const selectedEvent = eventFilter.value;
  if (selectedEvent) {
    matches = matches.filter(m => m.event === selectedEvent);
  }

  // Sorting
  const sortMode = sortBy.value;
  if (sortMode === 'confidence') {
    matches.sort((a, b) => b.prediction.confidenceScore - a.prediction.confidenceScore);
  } else if (sortMode === 'time') {
    matches.sort((a, b) => a.time - b.time);
  }

  filteredMatches = matches;
  renderMatches();
}

// Populate event filter dropdown
function populateEventFilter() {
  const events = [...new Set(allMatches.map(m => m.event))];
  eventFilter.innerHTML = '<option value="">Vsechny</option>';
  events.forEach(event => {
    const option = document.createElement('option');
    option.value = event;
    option.textContent = event;
    eventFilter.appendChild(option);
  });
}

// Render matches to DOM
function renderMatches() {
  matchesContainer.innerHTML = '';

  if (filteredMatches.length === 0) {
    matchesContainer.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px;">Zadne zapasy nenalezeny</p>';
    return;
  }

  filteredMatches.forEach(match => {
    const card = createMatchCard(match);
    matchesContainer.appendChild(card);
  });
}

// Create match card element
function createMatchCard(match) {
  const { team1, team2, event, format, time, prediction } = match;

  const card = document.createElement('div');
  card.className = 'match-card';

  const confClass = `conf-${prediction.confidence}`;
  const confText = {
    high: 'Vysoka',
    mid: 'Stredni',
    low: 'Nizka'
  }[prediction.confidence];

  card.innerHTML = `
    <div class="confidence-badge ${confClass}">${confText}</div>
    <div class="match-meta">
      <span class="match-event">${event}</span>
      <span>${format} &bull; ${formatTime(time)}</span>
    </div>
    <div class="teams-row">
      <div class="team">
        <img src="${team1.logo}" alt="${team1.name}" onerror="this.style.display='none'">
        <div class="team-name">${team1.name}</div>
        <div class="team-rank">#${team1.rank}</div>
      </div>
      <div class="vs-badge">VS</div>
      <div class="team">
        <img src="${team2.logo}" alt="${team2.name}" onerror="this.style.display='none'">
        <div class="team-name">${team2.name}</div>
        <div class="team-rank">#${team2.rank}</div>
      </div>
    </div>
    <div class="prediction-bar">
      <div class="prediction-label">
        <span class="team1-label">${team1.name}: ${prediction.team1WinProb}%</span>
        <span class="team2-label">${team2.name}: ${prediction.team2WinProb}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${prediction.team1WinProb}%"></div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">Forma (win%)</div>
        <div class="stat-values">
          <span>${Math.round(team1.recentWinRate)}%</span>
          <span>${Math.round(team2.recentWinRate)}%</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Map Pool</div>
        <div class="stat-values">
          <span>${Math.round(team1.mapPoolStrength)}%</span>
          <span>${Math.round(team2.mapPoolStrength)}%</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Aktualni serie</div>
        <div class="stat-values">
          <span>${team1.currentStreak >= 0 ? '+' : ''}${team1.currentStreak}</span>
          <span>${team2.currentStreak >= 0 ? '+' : ''}${team2.currentStreak}</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">H2H vyhry</div>
        <div class="stat-values">
          <span>${team1.h2hWins}</span>
          <span>${team2.h2hWins}</span>
        </div>
      </div>
    </div>
    <div class="winner-badge">
      Predikce: ${prediction.predictedWinner} &#x1F3C6;
    </div>
  `;

  return card;
}

// Helper functions
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}.${month}. ${hours}:${mins}`;
}

function showLoading(show) {
  loadingSection.classList.toggle('hidden', !show);
  matchesContainer.classList.toggle('hidden', show);
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function hideError() {
  errorBox.classList.add('hidden');
}

// Auto-load on page load
window.addEventListener('DOMContentLoaded', () => {
  fetchMatches();
});
