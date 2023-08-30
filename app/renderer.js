// Import the YouTube Music API module
const YoutubeMusicApi = require('youtube-music-api');
const api = new YoutubeMusicApi();
const fs = require('fs');
const ytdl = require('ytdl-core');

function donothing() {
    //
}
function wait(waitsecs) {
    setTimeout(donothing(), 'waitsecs');
}

// Existing code for playing and displaying songs
let allSongs = [];
let currentlyPlaying = null;
let audioPlayerEl = document.getElementById("custom-player");
audioPlayerEl.addEventListener("ended", function () {
  currentlyPlaying.pause();
  currentlyPlaying.classList.remove("playing");

  const shuffledSongs = shuffleArray(allSongs);
  const randomSong = shuffledSongs[0];

  customPlayer.src = randomSong.mp3Url;
  customPlayer.play();
  currentlyPlaying = customPlayer;

  const songNameEl = document.getElementById("song-name");
  const artistNameEl = document.getElementById("artist-name");
  const albumCoverEl = document.getElementById("player-album-cover");
  songNameEl.innerText = randomSong.name;
  artistNameEl.innerText = randomSong.artist;
  albumCoverEl.src = randomSong.coverUrl;
});

function showSongs(songs) {
  const songsList = document.getElementById("songs-list");
  songsList.innerHTML = "";
  title();

  // Initialize searchInput before using it
  const searchInput = document.getElementById("search-input");
  const searchInputValue = searchInput.value.trim();

  if (!songs || searchInputValue.length === 0) {
    const shuffledSongs = shuffleArray(allSongs);
    songs = shuffledSongs.slice(0, 15);
  }

  songs.forEach((song) => {
    const songDiv = document.createElement("div");
    songDiv.classList.add("song");

    const coverImg = document.createElement("img");
    coverImg.src = song.coverUrl;
    coverImg.classList.add("cover");
    const bree = document.createElement("br");
    songDiv.classList.add("bree");
    const songInfo = document.createElement("div");
    songInfo.classList.add("song-info");

    const songName = document.createElement("div");
    songName.innerText = song.name;
    songName.classList.add("song-name");

    const artistName = document.createElement("div");
    artistName.innerText = song.artist;
    artistName.classList.add("artist-name");

    songDiv.appendChild(coverImg);
    songInfo.appendChild(songName);
    songInfo.appendChild(artistName);
    songDiv.appendChild(songInfo);
    songsList.appendChild(songDiv);
    songDiv.appendChild(bree);
    songDiv.appendChild(bree);
    songDiv.appendChild(bree);

    songDiv.addEventListener("click", function () {
      if (currentlyPlaying) {
        currentlyPlaying.pause();
        currentlyPlaying.classList.remove("playing");
      }

      customPlayer.pause();
      customPlayer.currentTime = 0;
      customPlayer.src = song.mp3Url;
      console.log(song.mp3Url);
      customPlayer.play();
      currentlyPlaying = customPlayer;

      const songNameEl = document.getElementById("song-name");
      const artistNameEl = document.getElementById("artist-name");
      const albumCoverEl = document.getElementById("player-album-cover");
      songNameEl.innerText = song.name;
      artistNameEl.innerText = song.artist;
      albumCoverEl.src = song.coverUrl;
    });

    songDiv.addEventListener("contextmenu", function (event) {
      event.preventDefault();

      const menu = document.createElement("div");
      menu.classList.add("right-click-menu");

      const playButton = document.createElement("button");
      playButton.innerText = "▶\t\t\tPlay";
      playButton.addEventListener("click", function () {
        customPlayer.pause();
        customPlayer.currentTime = 0;
        customPlayer.src = song.mp3Url;
        customPlayer.play();
        currentlyPlaying = customPlayer;

        updateSongInfo(song);

        menu.remove();
      });

      menu.appendChild(playButton);
      const breakx = document.createElement("br");
      menu.appendChild(breakx);
      const addToPlaylistButton = document.createElement("button");
      addToPlaylistButton.innerText = "Add to Playlist";
      addToPlaylistButton.addEventListener("click", function () {
        addToPlaylist(song);

        menu.remove();
      });

      menu.style.position = "fixed";
      menu.style.top = event.clientY + "px";
      menu.style.left = event.clientX + "px";

      document.body.appendChild(menu);

      const removeMenu = function () {
        menu.remove();
        window.removeEventListener("click", removeMenu);
      };
      window.addEventListener("click", removeMenu);
    });

  });

  searchInput.addEventListener("input", function (event) {
    const filteredSongs = allSongs.filter((song) => {
      const songName = song.name.toLowerCase();
      const searchTerm = event.target.value.toLowerCase();
      return songName.includes(searchTerm);
    });
    showSongs(filteredSongs);
    title();
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function title() {
  const titleEl = document.getElementById("page-title");
  const searchInput = document.getElementById("search-input").value.trim();

  if (searchInput.length > 0) {
    titleEl.innerText = "Search results";
  } else {
    titleEl.innerText = "Listen to something new";
  }
}

function getUrl(id) {
    let filename = id + ".mp3";
    let url = "http://www.youtube.com/watch?v=" + id;
    ytdl(url, { filter: audioonly => format.container === 'mp3' }).pipe(fs.createWriteStream(filename));
    return filename;
}
api.initalize().then(info => {
  // API is initialized and ready to use
  // You can now use the YouTube Music API within your search function

  // Implement the search function
  function searchMusic(query) {
    // Use the YouTube Music API to search for music based on the query
    api.search(query)
      .then(results => {
        // Process the search results and display them on the page
        const songs = results.content
          .filter(item => item.type === 'song') // Filter out only song items
          .map(item => {
            console.log(item.videoId);
            return {
              name: item.name,
              artist: item.artist.name,
              coverUrl: item.thumbnails[1].url,
              mp3Url: getUrl(item.videoId) // You need to map this correctly
            };
          });

        // Call the showSongs function with the search results
        showSongs(songs);
      })
      .catch(error => {
        console.error("Error searching music:", error);
      });
  }

  // Attach the search functionality to the input event of the search input field
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", function (event) {
    const searchQuery = event.target.value.trim();
    if (searchQuery.length > 0) {
      searchMusic(searchQuery);
    } else {
      // If the search input is empty, show all songs
      showSongs(allSongs);
    }
  });
}).catch(error => {
  console.error("Error initializing YouTube Music API:", error);
});

fetch("https://raw.githubusercontent.com/openstreamorg/openstreammusic-data/main/songs.json")
  .then((response) => response.json())
  .then((data) => {
    allSongs = data.songs;
    allSongs.forEach((song) => {
      const audio = new Audio(song.mp3Url);
      audio.preload = "auto";
    });
    showSongs(allSongs); // Call showSongs with the original JSON data
  });

const customPlayerDiv = document.createElement("div");
customPlayerDiv.id = "custom-player-container";
const customPlayer = document.createElement("audio");
customPlayer.id = "custom-player";
customPlayer.controls = true;
customPlayer.controlsList = "nodownload";
customPlayerDiv.appendChild(customPlayer);
document.body.appendChild(customPlayerDiv);

customPlayer.addEventListener("ended", function () {
  const shuffledSongs = shuffleArray(allSongs);
  const randomSong = shuffledSongs[0];
  customPlayer.src = randomSong.mp3Url;
  customPlayer.play();
  updateSongInfo({
    coverUrl: randomSong.coverUrl,
    name: randomSong.name,
    artist: randomSong.artist,
  });
});

function updateSongInfo(song) {
  const songName = document.getElementById("song-name");
  const artistName = document.getElementById("artist-name");
  const albumCover = document.getElementById("player-album-cover");
  songName.textContent = song.name;
  artistName.textContent = song.artist;
  albumCover.src = song.coverUrl;
}

function addToPlaylist(song) {
  window.api.send("add-to-playlist", song);
}

