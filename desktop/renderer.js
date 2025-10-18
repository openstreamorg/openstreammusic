const youtubedl = require('youtube-dl-exec');

let YoutubeMusicApi = null;
let api = null;
try {
  if (typeof require !== 'undefined') {
    YoutubeMusicApi = require('ytm-get-api');
    api = new YoutubeMusicApi();
  }
} catch (e) { }

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const songsList = document.getElementById('songs-list');
const favouritesList = document.getElementById('favourites-list');
const favouritesTitle = document.getElementById('favourites-title');
const songQueueContainer = document.getElementById('song-queue');
const loadingContainer = document.getElementById('loading-container');
const pageTitle = document.getElementById('page-title');
const offlineStatus = document.getElementById('offline-status');
const songNameEl = document.getElementById('song-name');
const artistNameEl = document.getElementById('artist-name');
const albumCoverEl = document.getElementById('player-album-cover');

const customPlayerDiv = document.createElement('div');
customPlayerDiv.id = 'custom-player-container';
const customPlayer = document.createElement('audio');
customPlayer.id = 'custom-player';
customPlayer.controls = true;
customPlayer.setAttribute('controlsList', 'nodownload');
customPlayerDiv.appendChild(customPlayer);
document.body.appendChild(customPlayerDiv);

let songQueue = [];
let favorites = [];
let allSongs = [];
let currentlyPlaying = null;

function showLoadingAnimation() {
  if (loadingContainer) loadingContainer.style.display = 'block';
  if (songsList) songsList.style.display = 'none';
  if (pageTitle) pageTitle.style.display = 'none';
}

function hideLoadingAnimation() {
  if (loadingContainer) loadingContainer.style.display = 'none';
  if (songsList) songsList.style.display = 'flex';
  if (pageTitle) pageTitle.style.display = 'block';
}

function updateOnlineStatusUI() {
  if (navigator.onLine) {
    if (offlineStatus) offlineStatus.style.display = 'none';
    if (songsList) songsList.style.display = 'flex';
    if (pageTitle) pageTitle.style.display = 'block';
    if (loadingContainer) loadingContainer.style.display = 'none';
  } else {
    if (offlineStatus) offlineStatus.style.display = 'block';
    if (songsList) songsList.style.display = 'none';
    if (pageTitle) pageTitle.style.display = 'none';
    if (loadingContainer) loadingContainer.style.display = 'none';
  }
}

function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setFavoritesStorage() {
  try {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  } catch (e) { }
}

function loadFavoritesFromStorage() {
  try {
    const raw = localStorage.getItem('favorites');
    favorites = raw ? JSON.parse(raw) : [];
  } catch (e) {
    favorites = [];
  }
}

function addToFavorites(song) {
  if (!song || !song.name) return;
  const exists = favorites.some(f => f.id === song.id && f.mp3Url === song.mp3Url);
  if (!exists) {
    favorites.push(song);
    setFavoritesStorage();
    displayFavorites();
  }
}

function removeFromFavorites(song) {
  favorites = favorites.filter(f => !(f.id === song.id && f.mp3Url === song.mp3Url));
  setFavoritesStorage();
  showSongs(null);
}

function displayFavorites() {
  if (!favouritesList || !favouritesTitle) return;
  favouritesList.innerHTML = '';

  if (!Array.isArray(favorites) || favorites.length === 0) {
    favouritesTitle.textContent = '';
    favouritesList.style.display = 'none';
    return;
  }

  pageTitle.style.marginTop = '10px';
  favouritesTitle.textContent = 'Your Favourites';
  favouritesList.style.display = 'flex';
  favouritesList.style.flexWrap = 'wrap';

  favorites.forEach(song => {
    const el = createSongElement(song);
    favouritesList.appendChild(el);
  });
}

function displaySongQueue() {
  if (!songQueueContainer) return;
  songQueueContainer.innerHTML = '';
  const header = document.createElement('div');
  const h3 = document.createElement('h3');
  h3.textContent = 'Your Queue';
  header.appendChild(h3);
  songQueueContainer.appendChild(header);
  songQueue.forEach((song, index) => {
    const songDiv = document.createElement('div');
    songDiv.className = 'queue-song';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = song.name;
    nameSpan.style.fontWeight = 'bold';
    songDiv.appendChild(nameSpan);
    songDiv.appendChild(document.createElement('br'));
    const artistSpan = document.createElement('span');
    artistSpan.textContent = song.artist || '';
    songDiv.appendChild(artistSpan);
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'x';
    removeBtn.style.float = 'right';
    removeBtn.addEventListener('click', () => removeSongFromQueue(index));
    songDiv.appendChild(removeBtn);
    songQueueContainer.appendChild(songDiv);
  });
}

function addSongToQueue(song) {
  if (!song) return;
  const wasEmpty = songQueue.length === 0;
  songQueue.push(song);
  displaySongQueue();
  if (wasEmpty) playSong(song);
}

function removeSongFromQueue(index) {
  if (index >= 0 && index < songQueue.length) {
    songQueue.splice(index, 1);
    displaySongQueue();
  }
}

function createSongElement(song) {
  const el = document.createElement('div');
  el.classList.add('song');
  const cover = document.createElement('img');
  cover.classList.add('cover');
  cover.src = song.coverUrl || '';
  el.appendChild(cover);
  const info = document.createElement('div');
  info.classList.add('song-info');
  const name = document.createElement('div');
  name.classList.add('song-name');
  name.innerText = song.name || 'Unknown';
  info.appendChild(name);
  const artist = document.createElement('div');
  artist.classList.add('artist-name');
  artist.innerText = song.artist || '';
  info.appendChild(artist);
  el.appendChild(info);
  el.addEventListener('click', () => playSong(song));
  el.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    const menu = buildContextMenuForSong(song);
    if (!menu) return;
    menu.style.position = 'fixed';
    menu.style.top = `${ev.clientY}px`;
    menu.style.left = `${ev.clientX}px`;
    document.body.appendChild(menu);
    const removeMenu = () => {
      menu.remove();
      window.removeEventListener('click', removeMenu);
    };
    setTimeout(() => window.addEventListener('click', removeMenu), 0);
  });
  return el;
}

function buildContextMenuForSong(song) {
  const menu = document.createElement('div');
  menu.classList.add('right-click-menu');
  const makeButton = (text, cb) => {
    const b = document.createElement('button');
    b.innerText = text;
    b.addEventListener('click', cb);
    menu.appendChild(b);
    return b;
  };
  makeButton('▶ Play', () => { playSong(song); menu.remove(); });
  const favExists = favorites.some(f => f.id === song.id && f.mp3Url === song.mp3Url);
  if (favExists) makeButton('★ Remove from Favorites', () => { removeFromFavorites(song); menu.remove(); });
  else makeButton('★ Add to Favorites', () => { addToFavorites(song); menu.remove(); });
  const inQueueIndex = songQueue.findIndex(q => (song.mp3Url && q.mp3Url === song.mp3Url) || (song.videoId && q.videoId === song.videoId));
  if (inQueueIndex !== -1) makeButton('🗑️ Remove from Queue', () => { songQueue.splice(inQueueIndex, 1); displaySongQueue(); menu.remove(); });
  else makeButton('☰ Add to Queue', () => { addSongToQueue(song); menu.remove(); });
  return menu;
}

function showSongs(songs = null, opts = {}) {
  if (!songsList) return;
  songsList.innerHTML = '';

  if (opts.title) {
    if (pageTitle) pageTitle.innerText = opts.title;
  } else {
    if (pageTitle) pageTitle.innerText = (searchInput && searchInput.value.trim().length ? 'Search results' : 'Your Favourites');
  }

  // If no songs provided, just show favorites
  if (!Array.isArray(songs) || songs.length === 0) {
    songs = favorites;
    if (!songs || songs.length === 0) {
      const p = document.createElement('p');
      p.innerText = 'Nothing in your favourites yet!';
      songsList.appendChild(p);
      return;
    }
  }

  songs.forEach(song => {
    const el = createSongElement(song);
    songsList.appendChild(el);
  });
}

customPlayer.addEventListener('ended', () => {
  playNextSong();
});

async function playSong(song) {
  if (!song) return;
  if (songNameEl) songNameEl.innerText = song.name || '';
  if (artistNameEl) artistNameEl.innerText = song.artist || '';
  if (albumCoverEl) albumCoverEl.src = song.coverUrl || '';
  try {
    if (currentlyPlaying && currentlyPlaying !== customPlayer) {
      currentlyPlaying.pause && currentlyPlaying.pause();
      if (currentlyPlaying.classList) currentlyPlaying.classList.remove('playing');
    }
  } catch (e) { }
  if (song.mp3Url) {
    customPlayer.src = song.mp3Url;
    await customPlayer.play().catch(() => { });
    currentlyPlaying = customPlayer;
    displaySongQueue();
    return;
  }
  if (song.videoId) {
    try {
      const mp3Url = await getUrl(song.videoId);
      if (!mp3Url) throw new Error('getUrl returned empty');
      customPlayer.src = mp3Url;
      await customPlayer.play().catch(() => { });
      currentlyPlaying = customPlayer;
      displaySongQueue();
      return;
    } catch (err) {
      console.error('Failed to convert videoId to mp3 URL:', err);
      alert('Unable to play that item.');
    }
  }
}

function playNextSong() {
  if (songQueue.length > 0) {
    const next = songQueue.shift();
    displaySongQueue();
    playSong(next);
  } else if (favorites.length > 0) {
    const random = shuffleArray(favorites)[0];
    playSong(random);
  } else if (allSongs.length > 0) {
    const random = shuffleArray(allSongs)[0];
    playSong(random);
  }
}

async function getUrl(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const output = await youtubedl(url, {
      getUrl: true,
      extractAudio: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    });
    console.log(output);
    return output;
  } catch (err) {
    console.error('youtube-dl-exec failed:', err);
    return null;
  }
}

async function searchMusic(query) {
  query = (query || '').trim();
  if (!query) return;

  showLoadingAnimation();

  try {
    let apiSongs = [];

    // Try YTM API if available
    if (api && typeof api.search === 'function') {
      try {
        if (typeof api.initialize === 'function') await api.initialize();
        else if (typeof api.initalize === 'function') await api.initalize();

        const apiResults = await api.search(query);
        if (apiResults && Array.isArray(apiResults.content)) {
          apiSongs = apiResults.content
            .filter(item => item.type === 'song')
            .map(item => ({
              id: item.id || item.videoId,
              name: item.name,
              artist: (item.artist && item.artist.name) || item.artist || '',
              coverUrl: (item.thumbnails && item.thumbnails[1]?.url) || item.thumbnails?.[0]?.url || '',
              mp3Url: item.mp3Url || null,
              videoId: item.videoId || item.id || null
            }));
        }
      } catch (e) {
        console.warn('YTM API search failed, falling back to local songs.json', e);
      }
    }

    // Always search local JSON fallback
    let jsonSongs = [];
    try {
      const resp = await fetch('https://raw.githubusercontent.com/openstreamorg/openstreammusic-data/main/songs.json');
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.songs)) {
          jsonSongs = data.songs
            .filter(item => item.type === 'song' && item.name?.toLowerCase().includes(query.toLowerCase()))
            .map(item => ({
              name: item.name,
              artist: (item.artist && item.artist.name) || item.artist || '',
              coverUrl: item.coverUrl,
              mp3Url: item.mp3Url
            }));
        }
      }
    } catch (e) {
      console.warn('Failed to load songs.json', e);
    }

    const combined = [...apiSongs, ...jsonSongs];
    showSongs(combined, { title: 'Search results', fallbackText: 'No songs found.' });
    displayFavorites();

  } catch (err) {
    console.error('Search failed:', err);
    alert('Search failed');
  } finally {
    hideLoadingAnimation();
  }
}

async function onlineChecks() {
  updateOnlineStatusUI();
  loadFavoritesFromStorage();
  displayFavorites();
  showSongs(null);
}

searchButton && searchButton.addEventListener('click', () => {
  const q = searchInput ? searchInput.value.trim() : '';
  if (q) searchMusic(q);
  else showSongs(null);
});

searchInput && searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    const q = searchInput.value.trim();
    if (q) searchMusic(q);
    else showSongs(null);
  }
});

searchInput && searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim();
  if (q.length === 0) showSongs(null);
});

window.addEventListener('online', updateOnlineStatusUI);
window.addEventListener('offline', updateOnlineStatusUI);
onlineChecks();

window.__musicUI = {
  playSong,
  addSongToQueue,
  displaySongQueue,
  get state() { return { allSongs, songQueue, favorites }; }
};
