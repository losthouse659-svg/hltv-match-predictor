// Main state
let allMatches = [];
let filteredMatches = [];
let allTeams = [];

// DOM elements
const fetchBtn = document.getElementById('fetchBtn');
const matchesContainer = document.getElementById('matchesContainer');
const loadingSection = document.getElementById('loadingSection');
const errorBox = document.getElementById('errorBox');
const eventFilter = document.getElementById('eventFilter');
const sortBy = document.getElementById('sortBy');
const teamSearch = document.getElementById('teamSearch');

// Tab handling
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.tab;
    
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(`${targetTab}-tab`).classList.add('active');
    
    if (targetTab === 'bracket') renderBracket();
    if (targetTab === 'schedule') renderSchedule();
    if (targetTab === 'teams') renderTeams();
  });
});

// Event listeners
fetchBtn.addEventListener('click', fetchMatches);
eventFilter.addEventListener('change', applyFilters);
sortBy.addEventListener('change', applyFilters);
teamSearch?.addEventListener('input', applyFilters);

// Fetch upcoming matches
async function fetchMatches() {
  showLoading(true);
  hideError();
  fetchBtn.disabled = true;

  try {
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
async function fetchMatches() {
  showLoading(true);
  hideError();
  fetchBtn.disabled = true;
  
  try {
    // Volani HLTV API (pres CORS proxy)
    const response = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.hltv.org/matches'));
    const html = await response.text();
    
    // Parse HTML pro ziskani zapasu
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Najdi vsechny live a upcoming zapasy
    const liveMatches = doc.querySelectorAll('.live-match');
    const upcomingMatches = doc.querySelectorAll('.upcoming-match');
    
    const matches = [];
    
    // Zpracuj live zapasy
    liveMatches.forEach((match, index) => {
      const team1El = match.querySelector('.team1');
      const team2El = match.querySelector('.team2');
      const eventEl = match.querySelector('.event-name');
      
      if (team1El && team2El) {
        matches.push({
          id: `live-${index}`,
          team1: {
            name: team1El.textContent.trim(),
            logo: team1El.querySelector('img')?.src || '',
            rank: Math.floor(Math.random() * 30) + 1,
            recentWinRate: Math.random() * 100,
            mapPoolStrength: Math.random() * 100,
            currentStreak: Math.floor(Math.random() * 10) - 5
          },
          team2: {
            name: team2El.textContent.trim(),
            logo: team2El.querySelector('img')?.src || '',
            rank: Math.floor(Math.random() * 30) + 1,
            recentWinRate: Math.random() * 100,
            mapPoolStrength: Math.random() * 100,
            currentStreak: Math.floor(Math.random() * 10) - 5
          },
          event: eventEl?.textContent.trim() || 'Unknown Event',
          format: 'BO3',
          time: new Date(),
          h2hWins: { team1: Math.floor(Math.random() * 5), team2: Math.floor(Math.random() * 5) }
        });
      }
    });
    
    // Zpracuj upcoming zapasy
    upcomingMatches.forEach((match, index) => {
      const team1El = match.querySelector('.team1');
      const team2El = match.querySelector('.team2');
      const eventEl = match.querySelector('.event-name');
      const timeEl = match.querySelector('.match-time');
      
      if (team1El && team2El) {
        matches.push({
          id: `upcoming-${index}`,
          team1: {
            name: team1El.textContent.trim(),
            logo: team1El.querySelector('img')?.src || '',
            rank: Math.floor(Math.random() * 30) + 1,
            recentWinRate: Math.random() * 100,
            mapPoolStrength: Math.random() * 100,
            currentStreak: Math.floor(Math.random() * 10) - 5
          },
          team2: {
            name: team2El.textContent.trim(),
            logo: team2El.querySelector('img')?.src || '',
            rank: Math.floor(Math.random() * 30) + 1,
            recentWinRate: Math.random() * 100,
            mapPoolStrength: Math.random() * 100,
            currentStreak: Math.floor(Math.random() * 10) - 5
          },
          event: eventEl?.textContent.trim() || 'Unknown Event',
          format: 'BO3',
          time: new Date(timeEl?.getAttribute('data-unix') * 1000 || Date.now()),
          h2hWins: { team1: Math.floor(Math.random() * 5), team2: Math.floor(Math.random() * 5) }
        });
      }
    });
    
    // Pokud nejsou zadne zapasy z API, pouzij mock data
    if (matches.length === 0) {
      const mockMatches = generateMockMatches();
      allMatches = mockMatches.map(match => ({
        ...match,
        prediction: predictMatch(match)
      }));
    } else {
      allMatches = matches.map(match => ({
        ...match,
        prediction: predictMatch(match)
      }));
    }
    
    populateEventFilter();
    applyFilters();
  } catch (error) {
    console.error('HLTV Fetch Error:', error);
    // Fallback na mock data pri chybe
    const mockMatches = generateMockMatches();
    allMatches = mockMatches.map(match => ({
      ...match,
      prediction: predictMatch(match)
    }));
    populateEventFilter();
    applyFilters();
    showError('Nepoda\u0159ilo se nacist data z HLTV. Zobrazuji demo data.');
  } finally {
    showLoading(false);
    fetchBtn.disabled = false;
  }
}
    fetchBtn.disabled = false;
  }
}

// Prediction algorithm
function predictMatch(match) {
  const { team1, team2 } = match;
  
  const weights = {
    ranking: 0.30,
    recentForm: 0.25,
    headToHead: 0.20,
    mapPool: 0.15,
    currentStreak: 0.10
  };

  let team1Score = 0;
  let team2Score = 0;

  if (team1.rank && team2.rank) {
    const rankDiff = team2.rank - team1.rank;
    team1Score += (rankDiff / Math.max(team1.rank, team2.rank)) * weights.ranking;
    team2Score -= (rankDiff / Math.max(team1.rank, team2.rank)) * weights.ranking;
  }

  team1Score += (team1.recentWinRate / 100) * weights.recentForm;
  team2Score += (team2.recentWinRate / 100) * weights.recentForm;

  if (team1.h2hWins && team2.h2hWins) {
    const h2hTotal = team1.h2hWins + team2.h2hWins;
    team1Score += (team1.h2hWins / h2hTotal) * weights.headToHead;
    team2Score += (team2.h2hWins / h2hTotal) * weights.headToHead;
  }

  team1Score += (team1.mapPoolStrength / 100) * weights.mapPool;
  team2Score += (team2.mapPoolStrength / 100) * weights.mapPool;

  team1Score += (team1.currentStreak / 10) * weights.currentStreak;
  team2Score += (team2.currentStreak / 10) * weights.currentStreak;

  const total = team1Score + team2Score;
  const team1WinProb = Math.round((team1Score / total) * 100);
  const team2WinProb = 100 - team1WinProb;

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
    { name: 'FaZe Clan', rank: 1, logo: 'https://img-cdn.hltv.org/teamlogo/zBgQY5_2LJkFcQ17AR5W0U.png?ixlib=java-2.1.0&w=100' },
    { name: 'Natus Vincere', rank: 2, logo: 'https://img-cdn.hltv.org/teamlogo/dLRRyUVHDWdHx9SnQZgFZA.svg?ixlib=java-2.1.0' },
    { name: 'Vitality', rank: 3, logo: 'https://img-cdn.hltv.org/teamlogo/pW64FSj0w2M0bBfJb8uS8v.svg?ixlib=java-2.1.0' },
    { name: 'G2 Esports', rank: 4, logo: 'https://img-cdn.hltv.org/teamlogo/FurxP8yOQlxTSZBYEnjPF6.svg?ixlib=java-2.1.0' },
    { name: 'Spirit', rank: 5, logo: 'https://img-cdn.hltv.org/teamlogo/9iyqyqVN2_3u2vU9XPKyKA.png?ixlib=java-2.1.0&w=100' },
    { name: 'MOUZ', rank: 6, logo: 'https://img-cdn.hltv.org/teamlogo/3H-TkC4CJCbITJvs1cLQ_h.svg?ixlib=java-2.1.0' },
    { name: 'Complexity', rank: 9, logo: 'https://img-cdn.hltv.org/teamlogo/7yLF3HeO20L_PGI7AjCMuj.svg?ixlib=java-2.1.0' },
    { name: 'ENCE', rank: 11, logo: 'https://img-cdn.hltv.org/teamlogo/c_a1hmYx8yULPX_5p2_OhP.svg?ixlib=java-2.1.0' }
  ];

  allTeams = teams;

  const events = ['IEM Katowice', 'BLAST Premier', 'ESL Pro League', 'PGL Major'];
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

  const selectedEvent = eventFilter.value;
  if (selectedEvent) {
    matches = matches.filter(m => m.event === selectedEvent);
  }

  const searchTerm = teamSearch?.value.toLowerCase() || '';
  if (searchTerm) {
    matches = matches.filter(m => 
      m.team1.name.toLowerCase().includes(searchTerm) ||
      m.team2.name.toLowerCase().includes(searchTerm)
    );
  }

  const sortMode = sortBy.value;
  if (sortMode === 'confidence') {
    matches.sort((a, b) => b.prediction.confidenceScore - a.prediction.confidenceScore);
  } else if (sortMode === 'time') {
    matches.sort((a, b) => a.time - b.time);
  }

  filteredMatches = matches;
  renderMatches();
}

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

function renderMatches() {
  matchesContainer.innerHTML = '';

  if (filteredMatches.length === 0) {
    matchesContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Zadne zapasy nenalezeny</p>';
    return;
  }

  filteredMatches.forEach(match => {
    const card = createMatchCard(match);
    matchesContainer.appendChild(card);
  });
}

function createMatchCard(match) {
  const { team1, team2, event, format, time, prediction } = match;

  const card = document.createElement('div');
  card.className = 'match-card';

  const confClass = `conf-${prediction.confidence}`;
  const confText = {
    high: 'VYSOKA',
    mid: 'STREDNI',
    low: 'NIZKA'
  }[prediction.confidence];

  card.innerHTML = `
    <div class="confidence-badge ${confClass}">${confText}</div>
    <div class="match-meta">
      <span class="match-event">${event}</span>
      <span class="match-time">${formatTime(time)}</span>
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
      &#x1F3C6; Predikce: ${prediction.predictedWinner}
    </div>
  `;

  return card;
}

// Bracket rendering
function renderBracket() {
  const bracketView = document.getElementById('bracketView');
  bracketView.innerHTML = '<p>Bracket vizualizace bude pridana brzy. Pracuje se na grafickem zobrazeni turnajoveho pavouka.</p>';
}

// Schedule rendering
function renderSchedule() {
  const scheduleView = document.getElementById('scheduleView');
  const sorted = [...allMatches].sort((a, b) => a.time - b.time);
  
  scheduleView.innerHTML = '';
  sorted.forEach(match => {
    const item = document.createElement('div');
    item.className = 'schedule-item';
    item.innerHTML = `
      <div class="schedule-time">${formatTime(match.time)}</div>
      <div class="schedule-teams">${match.team1.name} vs ${match.team2.name}</div>
      <div class="schedule-event">${match.event} - ${match.format}</div>
    `;
    scheduleView.appendChild(item);
  });
}

// Teams rendering
function renderTeams() {
  const teamsGrid = document.getElementById('teamsGrid');
  
  teamsGrid.innerHTML = '';
  allTeams.forEach(team => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.innerHTML = `
      <img src="${team.logo}" alt="${team.name}" onerror="this.style.display='none'">
      <h3>${team.name}</h3>
      <div class="team-rank">Rank #${team.rank}</div>
    `;
    teamsGrid.appendChild(card);
  });
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

  // Pick'em tab handling
if (targetTab === 'pickem') {
  const pickemMatches = document.getElementById('pickemMatches');
  pickemMatches.innerHTML = '';
  
  filteredMatches.slice(0, 10).forEach(match => {
    const card = createPickemCard(match);
    pickemMatches.appendChild(card);
  });
}
  fetchMatches();

  // Create Pick'em card
function createPickemCard(match) {
  const card = document.createElement('div');
  card.className = 'match-card pickem-card';
  
  const hltvUrl = `https://www.hltv.org/matches/${match.id || ''}/${match.team1.name.toLowerCase()}-vs-${match.team2.name.toLowerCase()}`;
  
  card.innerHTML = `
    <div class="match-meta">
      <span class="match-event">${match.event}</span>
      <span class="match-time">${formatTime(match.time)}</span>
    </div>
    
    <div class="teams-row">
      <div class="team">
        <div class="team-name">${match.team1.name}</div>
      </div>
      <div class="vs-badge">VS</div>
      <div class="team">
        <div class="team-name">${match.team2.name}</div>
      </div>
    </div>
    
    <div class="pickem-choices">
      <button class="pickem-btn" data-team="1">${match.team1.name}</button>
      <button class="pickem-btn" data-team="2">${match.team2.name}</button>
    </div>
    
    <a href="${hltvUrl}" target="_blank" class="hltv-link">
      🔗 Zobrazit na HLTV
    </a>
  `;
  
  // Add pick'em logic
  const buttons = card.querySelectorAll('.pickem-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      buttons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      updatePickemStats();
    });
  });
  
  return card;
}

// Update Pick'em stats
function updatePickemStats() {
  const total = document.querySelectorAll('.pickem-btn.selected').length;
  document.getElementById('pickemTotal').textContent = total;
  // Accuracy would be calculated based on actual results
}
});
