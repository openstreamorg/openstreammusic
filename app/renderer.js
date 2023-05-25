// create and append song elements to the DOM
let allSongs = [];
let currentlyPlaying = null;
let audioPlayerEl = document.getElementById("custom-player");

// add event listener to audio element to play random song after the current song is finished
audioPlayerEl.addEventListener("ended", function () {
  // pause current audio
  currentlyPlaying.pause();
  currentlyPlaying.classList.remove("playing");

  // select a random song
  const shuffledSongs = shuffleArray(allSongs);
  const randomSong = shuffledSongs[0];

  // play the random song
  customPlayer.src = randomSong.mp3Url;
  customPlayer.play();
  currentlyPlaying = customPlayer;

  // update song info in custom player
  const songNameEl = document.getElementById("song-name");
  const artistNameEl = document.getElementById("artist-name");
  const albumCoverEl = document.getElementById("player-album-cover");
  songNameEl.innerText = randomSong.name;
  artistNameEl.innerText = randomSong.artist;
  albumCoverEl.src = randomSong.coverUrl;
});

function showSongs(songs) {
  const searchInput2 = document.getElementById("search-input").value.trim();
  const songsList = document.getElementById("songs-list");
  songsList.innerHTML = "";
  title();
  if (!songs || searchInput2.length === 0) {
    // If no songs specified, show random songs
    const shuffledSongs = shuffleArray(allSongs);
    songs = shuffledSongs.slice(0, 15); // Show 10 random songs
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

    // add event listener to play song on click
    songDiv.addEventListener("click", function () {
      // pause current audio (if there is one playing)
      if (currentlyPlaying) {
        currentlyPlaying.pause();
        currentlyPlaying.classList.remove("playing");
      }

      // play clicked song
      customPlayer.pause();
      customPlayer.currentTime = 0;
      customPlayer.src = song.mp3Url;
      customPlayer.play();
      currentlyPlaying = customPlayer;

      // update song info in custom player
      const songNameEl = document.getElementById("song-name");
      const artistNameEl = document.getElementById("artist-name");
      const albumCoverEl = document.getElementById("player-album-cover");
      songNameEl.innerText = song.name;
      artistNameEl.innerText = song.artist;
      albumCoverEl.src = song.coverUrl;
    });

    songDiv.addEventListener("contextmenu", function (event) {
      event.preventDefault(); // prevent the default context menu from showing up
    
      // create right-click menu
      const menu = document.createElement("div");
      menu.classList.add("right-click-menu");
    
      // create play button
      const playButton = document.createElement("button");
      playButton.innerText = "▶\t\t\tPlay";
      playButton.addEventListener("click", function () {
        // play selected song
        customPlayer.pause();
        customPlayer.currentTime = 0;
        customPlayer.src = song.mp3Url;
        customPlayer.play();
        currentlyPlaying = customPlayer;

        // update song info in custom player
        updateSongInfo(song);

        // remove right-click menu
        menu.remove();
      });

    
      // add play button to menu
      menu.appendChild(playButton);
      const breakx = document.createElement("br");
      menu.appendChild(breakx);
      // create add to playlist button
      const addToPlaylistButton = document.createElement("button");
      addToPlaylistButton.innerText = "Add to Play Later";
      addToPlaylistButton.addEventListener("click", function () {
        addToPlaylist(song);
    
        // remove right-click menu
        menu.remove();
      });
    
      // add add to playlist button to menu
      // menu.appendChild(addToPlaylistButton);
    
      // position menu at the mouse pointer
      menu.style.position = "fixed";
      menu.style.top = event.clientY + "px";
      menu.style.left = event.clientX + "px";
    
      // add menu to the DOM
      document.body.appendChild(menu);
    
      // add event listener to remove menu when clicking outside of it
      const removeMenu = function () {
        menu.remove();
        window.removeEventListener("click", removeMenu);
      };
      window.addEventListener("click", removeMenu);
    });
    
  });

  

  // add event listener to search input
  const searchInput = document.getElementById("search-input");
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

  // If search results are being displayed, update the title to "Search results"
  if (searchInput.length > 0) {
    titleEl.innerText = "Search results";
  }
  // Otherwise, set the title back to "Listen to something new"
  else {
    titleEl.innerText = "Listen to something new";
  }
}

// fetch all songs
fetch("https://raw.githubusercontent.com/openstreamorg/openstreammusic-data/main/songs.json")
  .then((response) => response.json())
  .then((data) => {
    allSongs = data.songs;
    console.log(allSongs);
    // preload audio files
    allSongs.forEach((song) => {
      const audio = new Audio(song.mp3Url);
      audio.preload = "auto";
    });
    showSongs();

  });

// add custom player
const customPlayerDiv = document.createElement("div");
customPlayerDiv.id = "custom-player-container";
const customPlayer = document.createElement("audio");
customPlayer.id = "custom-player";
customPlayer.controls = true;
customPlayer.controlsList = "nodownload"; // add this line to disable download button
customPlayerDiv.appendChild(customPlayer);
document.body.appendChild(customPlayerDiv);

function updateSongInfo(song) {
  const songName = document.getElementById("song-name");
  const artistName = document.getElementById("artist-name");
  const albumCover = document.getElementById("player-album-cover");
  songName.textContent = song.name;
  artistName.textContent = song.artist;
  albumCover.src = song.coverUrl;
}

function songDivs(songs) {
  return songs.map((song) => {
    const songDiv = document.createElement("div");
    songDiv.classList.add("song");

    const coverImg = document.createElement("img");
    coverImg.src = song.coverUrl;
    coverImg.classList.add("cover");

    const songInfo = document.createElement("div");
    songInfo.classList.add("song-info");

    const songName = document.createElement("div");
    songName.innerText = song.name;
    songName.classList.add("song-name");

    const artistName = document.createElement("div");
    artistName.innerText = song.artist;
    artistName.classList.add("artist-name");

    songInfo.appendChild(songName);
    songInfo.appendChild(artistName);
    songDiv.appendChild(coverImg);
    songDiv.appendChild(songInfo);

    // add event listener to play song on click
    songDiv.addEventListener("click", function () {
      // pause current audio (if there is one playing)
      if (currentlyPlaying) {
        currentlyPlaying.pause();
        currentlyPlaying.classList.remove("playing");
      }

      // play clicked song
      customPlayer.pause();
      customPlayer.currentTime = 0;
      customPlayer.src = song.mp3Url;
      customPlayer.play();
      currentlyPlaying = customPlayer;

      // update song info
      updateSongInfo(song);
    });


    return songDiv;
  });
}

customPlayer.addEventListener("play", function () {
  currentlyPlaying = customPlayer;
});
customPlayer.addEventListener("pause", function () {
  currentlyPlaying = null;
});

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
// Send a message to the main process to add a song to the playlist
function addToPlaylist(song) {
  window.api.send('add-to-playlist', song);
}

// Receive a message from the main process with the updated playlist
/*
window.api.receive('update-playlist', function(playlist) {
  var playlistElement = document.getElementById('playlist');
  var playlistHTML = '<ul>';
  for (var i = 0; i < playlist.length; i++) {
    playlistHTML += '<li onclick="loadSong(' + i + ')">' + playlist[i].name + '</li>';
  }
  playlistHTML += '</ul>';
  playlistElement.innerHTML = playlistHTML;
});
*/
