// playlist.js

let playLaterSongs = [];

function addToPlayLater(song) {
  playLaterSongs.push(song);
}

function showPlayLater() {
  const playlist = document.getElementById("playlist");
  playlist.innerHTML = "";
  
  playLaterSongs.forEach((song) => {
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
    playlist.appendChild(songDiv);
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
    
      // create remove from playlist button
      const removeFromPlaylistButton = document.createElement("button");
      removeFromPlaylistButton.innerText = "Remove from Play Later";
      removeFromPlaylistButton.addEventListener("click", function () {
        playLaterSongs = playLaterSongs.filter((playLaterSong) => {
          return playLaterSong.mp3Url !== song.mp3Url;
        });
        showPlayLater();
      });
    
      // add remove from playlist button to menu
      menu.appendChild(removeFromPlaylistButton);
    
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
}

// Send a message to the main process to add a song to the playlist
function addToPlaylist(song) {
    window.api.send('add-to-playlist', song);
  }
  
  // Receive a message from the main process with the updated playlist
  window.api.receive('update-playlist', function(playlist) {
    var playlistElement = document.getElementById('playlist');
    var playlistHTML = '<ul>';
    for (var i = 0; i < playlist.length; i++) {
      playlistHTML += '<li onclick="loadSong(' + i + ')">' + playlist[i].name + '</li>';
    }
    playlistHTML += '</ul>';
    playlistElement.innerHTML = playlistHTML;
  });
  