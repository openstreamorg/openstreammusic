const YoutubeMusicApi = require('ytm-get-api');
const api = new YoutubeMusicApi();

// Import the YouTube Music API module
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

let songQueue = [];
let isFirstPlay = true; // Add this variable to track the first play
let favorites = []; // Initialize the favorites array here
hideLoadingAnimation();

const songQueueElement = document.getElementById("song-queue");

initializeFavorites();

// Clear the existing content
songQueueElement.innerHTML = "";

// Create a title element
const songTitle = document.createElement("div");

const songQueueTitle = document.createElement("h3");
songQueueTitle.textContent = 'Your Queue';
songTitle.appendChild(songQueueTitle);

const songQueueInfo = document.createElement("p");
songQueueInfo.textContent = 'Nothing here yet! Add some songs to start playing.';
songTitle.appendChild(songQueueInfo);

// Append the title to the song queue container
songQueueElement.appendChild(songTitle);


function donothing() {
    // nothing
}

function wait(waitsecs) {
    setTimeout(donothing(), 'waitsecs');
}

function updateOnlineStatus() {
    if (navigator.onLine) {
        // User is online, hide the offline status and show the online status
        document.getElementById("offline-status").style.display = "none";
        const loadingContainer = document.getElementById("loading-container");
        const songsList = document.getElementById("songs-list");
        const titleEl = document.getElementById("page-title");
        songsList.style.display = "flex";
        titleEl.style.display = "block";
        loadingContainer.style.display = "none";
    } else {
        // User is offline, hide the online status and show the offline status
        document.getElementById("offline-status").style.display = "block";
        const loadingContainer = document.getElementById("loading-container");
        const songsList = document.getElementById("songs-list");
        const titleEl = document.getElementById("page-title");
        songsList.style.display = "none";
        titleEl.style.display = "none";
        loadingContainer.style.display = "none";
    }
}

// Initial update
updateOnlineStatus();

// Add event listeners to monitor changes in online status
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

function showLoadingAnimation() {
    const loadingContainer = document.getElementById("loading-container");
    const songsList = document.getElementById("songs-list");
    const titleEl = document.getElementById("page-title");
    songsList.style.display = "none";
    titleEl.style.display = "none";
    loadingContainer.style.display = "block";
}

// Function to hide the loading animation
function hideLoadingAnimation() {
    const loadingContainer = document.getElementById("loading-container");
    const songsList = document.getElementById("songs-list");
    const titleEl = document.getElementById("page-title");
    songsList.style.display = "flex";
    titleEl.style.display = "block";
    loadingContainer.style.display = "none";
}

// Function to set a cookie for favorites
function setFavoritesCookie() {
    try {
        const jsonFavorites = JSON.stringify(favorites);
        localStorage.setItem("favorites", jsonFavorites);
    } catch (error) {
        console.error("Error setting favorites cookie:", error);
    }
}

// Function to read favorites from the cookie
function getFavoritesFromCookie() {
    try {
        const cookies = localStorage.getItem("favorites");
        if (cookies) {
            favorites = JSON.parse(cookies);
            displayFavorites(favorites); // Refresh the favorites display
        }
        const titleEl = document.getElementById("page-title");
        titleEl.innerText = "Your Favourites";
    } catch (error) {
        console.error("Error reading favorites from cookie:", error);
    }
}

// Function to add a song to favorites
function addToFavorites(song) {
    favorites.push(song);
    setFavoritesCookie(); // Update the cookie
}

// Function to remove a song from favorites
function removeFromFavorites(song) {
    const songIndex = favorites.findIndex((favorite) => favorite.id === song.id);
    if (songIndex !== -1) {
        favorites.splice(songIndex, 1);
        displayFavorites(); // Refresh the favorites display
        setFavoritesCookie(); // Update the cookie
    }
}

// Function to display favorites
function displayFavorites(songs) {
    const songsList = document.getElementById("songs-list");
    songsList.innerHTML = "";
    title();

    if (songs) { // Check if songs are provided
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

            songDiv.addEventListener("click", function() {
                playSong(song);
            });

            songDiv.addEventListener("contextmenu", function(event) {
                event.preventDefault();

                const menu = document.createElement("div");
                menu.classList.add("right-click-menu");

                const playButton = document.createElement("button");
                playButton.innerText = "▶\t\t\tPlay";
                playButton.addEventListener("click", function() {
                    playSong(song);
                    menu.remove();
                });

                menu.appendChild(playButton);

                const removeFromFavoritesButton = document.createElement("button");
                removeFromFavoritesButton.innerText = "★\t\t\tRemove from Favorites";
                removeFromFavoritesButton.addEventListener("click", function() {
                    removeFromFavorites(song);
                    menu.remove();
                });
                menu.appendChild(removeFromFavoritesButton);

                if (song.mp3Url) {
                    // If the song has an mp3Url, play it directly
                    const songIndexInQueue = songQueue.findIndex((queuedSong) => queuedSong.mp3Url === song.mp3Url);
                    if (songIndexInQueue !== -1) {
                        // If the song is already in the queue, provide the option to remove it
                        const removeFromQueueButton = document.createElement("button");
                        removeFromQueueButton.innerText = "🗑️\t\t\tRemove from Queue";
                        removeFromQueueButton.addEventListener("click", function() {
                            // Remove the song from the queue using its index
                            songQueue.splice(songIndexInQueue, 1);
                            displaySongQueue(); // Refresh the queue display
                            menu.remove();
                        });
                        menu.appendChild(removeFromQueueButton);
                    } else {
                        // If the song is not in the queue, provide the option to add it
                        const playNextButton = document.createElement("button");
                        playNextButton.innerText = "☰\t\t\tAdd to Queue";
                        playNextButton.addEventListener("click", function() {
                            addSongToQueue(song);
                            menu.remove();
                        });
                        menu.appendChild(playNextButton);
                    }
                } else if (song.videoId) {
                    const songIndexInQueue = songQueue.findIndex((queuedSong) => queuedSong.videoId === song.videoId);
                    if (songIndexInQueue !== -1) {
                        // If the song is already in the queue, provide the option to remove it
                        const removeFromQueueButton = document.createElement("button");
                        removeFromQueueButton.innerText = "🗑️\t\t\tRemove from Queue";
                        removeFromQueueButton.addEventListener("click", function() {
                            // Remove the song from the queue using its index
                            songQueue.splice(songIndexInQueue, 1);
                            displaySongQueue(); // Refresh the queue display
                            menu.remove();
                        });
                        menu.appendChild(removeFromQueueButton);
                    } else {
                        // If the song is not in the queue, provide the option to add it
                        const playNextButton = document.createElement("button");
                        playNextButton.innerText = "☰\t\t\tAdd to Queue";
                        playNextButton.addEventListener("click", function() {
                            addSongToQueue(song);
                            menu.remove();
                        });
                        menu.appendChild(playNextButton);
                    }
                } else {
                    console.error("Invalid song format. It must have either mp3Url or videoId.");
                }

                const breakx = document.createElement("br");
                menu.appendChild(breakx);
                const addToPlaylistButton = document.createElement("button");
                addToPlaylistButton.innerText = "Add to Playlist";
                addToPlaylistButton.addEventListener("click", function() {
                    addToPlaylist(song);
                    menu.remove();
                });

                menu.style.position = "fixed";
                menu.style.top = event.clientY + "px";
                menu.style.left = event.clientX + "px";

                document.body.appendChild(menu);

                const removeMenu = function() {
                    menu.remove();
                    window.removeEventListener("click", removeMenu);
                };
                window.addEventListener("click", removeMenu);
            });
        });
    }
}

// Function to initialize favorites from the cookie
function initializeFavorites() {
    getFavoritesFromCookie(); // Initialize favorites from the cookie
    // Display favorites initially
    displayFavorites(favorites);
    // Other initialization code
}


// Existing code for playing and displaying songs
let allSongs = [];
let currentlyPlaying = null;
let audioPlayerEl = document.getElementById("custom-player");
audioPlayerEl.addEventListener("ended", function() {
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

        songDiv.addEventListener("click", function() {
            playSong(song); // Use the new playSong function
        });

        songDiv.addEventListener("contextmenu", function(event) {
            event.preventDefault();

            const menu = document.createElement("div");
            menu.classList.add("right-click-menu");

            const playButton = document.createElement("button");
            playButton.innerText = "▶\t\t\tPlay";
            playButton.addEventListener("click", function() {
                playSong(song); // Use the new playSong function

                menu.remove();
            });

            menu.appendChild(playButton);

            const addToFavoritesButton = document.createElement("button");
            addToFavoritesButton.innerText = "★\t\t\tAdd to Favorites";
            addToFavoritesButton.addEventListener("click", function() {
                addToFavorites(song); // Use the addToFavorites function to add the song to favorites

                menu.remove();
            });
            menu.appendChild(addToFavoritesButton);
            if (song.mp3Url) {
                // If the song has an mp3Url, play it directly
                const songIndexInQueue = songQueue.findIndex((queuedSong) => queuedSong.mp3Url === song.mp3Url);
                if (songIndexInQueue !== -1) {
                    // If the song is already in the queue, provide the option to remove it
                    const removeFromQueueButton = document.createElement("button");
                    removeFromQueueButton.innerText = "🗑️\t\t\tRemove from Queue";
                    removeFromQueueButton.addEventListener("click", function() {
                        // Remove the song from the queue using its index
                        songQueue.splice(songIndexInQueue, 1);
                        displaySongQueue(); // Refresh the queue display
                        menu.remove();
                    });
                    menu.appendChild(removeFromQueueButton);
                } else {
                    // If the song is not in the queue, provide the option to add it
                    const playNextButton = document.createElement("button");
                    playNextButton.innerText = "☰\t\t\tAdd to Queue";
                    playNextButton.addEventListener("click", function() {
                        addSongToQueue(song);
                        menu.remove();
                    });
                    menu.appendChild(playNextButton);
                }
            } else if (song.videoId) {
                const songIndexInQueue = songQueue.findIndex((queuedSong) => queuedSong.videoId === song.videoId);
                if (songIndexInQueue !== -1) {
                    // If the song is already in the queue, provide the option to remove it
                    const removeFromQueueButton = document.createElement("button");
                    removeFromQueueButton.innerText = "🗑️\t\t\tRemove from Queue";
                    removeFromQueueButton.addEventListener("click", function() {
                        // Remove the song from the queue using its index
                        songQueue.splice(songIndexInQueue, 1);
                        displaySongQueue(); // Refresh the queue display
                        menu.remove();
                    });
                    menu.appendChild(removeFromQueueButton);
                } else {
                    // If the song is not in the queue, provide the option to add it
                    const playNextButton = document.createElement("button");
                    playNextButton.innerText = "☰\t\t\tAdd to Queue";
                    playNextButton.addEventListener("click", function() {
                        addSongToQueue(song);
                        menu.remove();
                    });
                    menu.appendChild(playNextButton);
                }
            } else {
                console.error("Invalid song format. It must have either mp3Url or videoId.");
            }
            // Find the index of the song in the queue
            const songVideoUrl = songQueue.findIndex((queuedSong) => queuedSong.videoId === song.videoId);


            const breakx = document.createElement("br");
            menu.appendChild(breakx);
            const addToPlaylistButton = document.createElement("button");
            addToPlaylistButton.innerText = "Add to Playlist";
            addToPlaylistButton.addEventListener("click", function() {
                addToPlaylist(song);

                menu.remove();
            });

            menu.style.position = "fixed";
            menu.style.top = event.clientY + "px";
            menu.style.left = event.clientX + "px";

            document.body.appendChild(menu);

            const removeMenu = function() {
                menu.remove();
                window.removeEventListener("click", removeMenu);
            };
            window.addEventListener("click", removeMenu);
        });
    });
}

function displaySongs(songs) {
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

        songDiv.addEventListener("click", function() {
            playSong(song); // Use the new playSong function
        });

        songDiv.addEventListener("contextmenu", function(event) {
            event.preventDefault();

            const menu = document.createElement("div");
            menu.classList.add("right-click-menu");

            const playButton = document.createElement("button");
            playButton.innerText = "▶\t\t\tPlay";
            playButton.addEventListener("click", function() {
                playSong(song); // Use the new playSong function

                menu.remove();
            });

            menu.appendChild(playButton);

            const addToFavoritesButton = document.createElement("button");
            addToFavoritesButton.innerText = "★\t\t\tAdd to Favorites";
            addToFavoritesButton.addEventListener("click", function() {
                addToFavorites(song); // Use the addToFavorites function to add the song to favorites

                menu.remove();
            });
            menu.appendChild(addToFavoritesButton);
            if (song.mp3Url) {
                // If the song has an mp3Url, play it directly
                const songIndexInQueue = songQueue.findIndex((queuedSong) => queuedSong.mp3Url === song.mp3Url);
                if (songIndexInQueue !== -1) {
                    // If the song is already in the queue, provide the option to remove it
                    const removeFromQueueButton = document.createElement("button");
                    removeFromQueueButton.innerText = "🗑️\t\t\tRemove from Queue";
                    removeFromQueueButton.addEventListener("click", function() {
                        // Remove the song from the queue using its index
                        songQueue.splice(songIndexInQueue, 1);
                        displaySongQueue(); // Refresh the queue display
                        menu.remove();
                    });
                    menu.appendChild(removeFromQueueButton);
                } else {
                    // If the song is not in the queue, provide the option to add it
                    const playNextButton = document.createElement("button");
                    playNextButton.innerText = "☰\t\t\tAdd to Queue";
                    playNextButton.addEventListener("click", function() {
                        addSongToQueue(song);
                        menu.remove();
                    });
                    menu.appendChild(playNextButton);
                }
            } else if (song.videoId) {
                const songIndexInQueue = songQueue.findIndex((queuedSong) => queuedSong.videoId === song.videoId);
                if (songIndexInQueue !== -1) {
                    // If the song is already in the queue, provide the option to remove it
                    const removeFromQueueButton = document.createElement("button");
                    removeFromQueueButton.innerText = "🗑️\t\t\tRemove from Queue";
                    removeFromQueueButton.addEventListener("click", function() {
                        // Remove the song from the queue using its index
                        songQueue.splice(songIndexInQueue, 1);
                        displaySongQueue(); // Refresh the queue display
                        menu.remove();
                    });
                    menu.appendChild(removeFromQueueButton);
                } else {
                    // If the song is not in the queue, provide the option to add it
                    const playNextButton = document.createElement("button");
                    playNextButton.innerText = "☰\t\t\tAdd to Queue";
                    playNextButton.addEventListener("click", function() {
                        addSongToQueue(song);
                        menu.remove();
                    });
                    menu.appendChild(playNextButton);
                }
            } else {
                console.error("Invalid song format. It must have either mp3Url or videoId.");
            }
            // Find the index of the song in the queue
            const songVideoUrl = songQueue.findIndex((queuedSong) => queuedSong.videoId === song.videoId);


            const breakx = document.createElement("br");
            menu.appendChild(breakx);
            const addToPlaylistButton = document.createElement("button");
            addToPlaylistButton.innerText = "Add to Playlist";
            addToPlaylistButton.addEventListener("click", function() {
                addToPlaylist(song);

                menu.remove();
            });

            menu.style.position = "fixed";
            menu.style.top = event.clientY + "px";
            menu.style.left = event.clientX + "px";

            document.body.appendChild(menu);

            const removeMenu = function() {
                menu.remove();
                window.removeEventListener("click", removeMenu);
            };
            window.addEventListener("click", removeMenu);
        });
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

async function getUrl(id) {
    let url = "http://www.youtube.com/watch?v=" + id;
    const ytdl = require('ytdl-core');
    let e = await ytdl.getInfo(url);
    let format = ytdl.chooseFormat(e.formats, { quality: 'highestaudio', filter: 'audioonly' });
    return format.url;
}

async function searchMusic(query) {
    try {
        showLoadingAnimation();
        // Search the API
        api.initalize();
        const apiResults = await api.search(query);

        // Filter and process API results
        const apiSongs = apiResults.content
            .filter(item => item.type === 'song')
            .map(item => {
                return {
                    name: item.name,
                    artist: item.artist.name,
                    coverUrl: item.thumbnails[1].url,
                    mp3Url: item.mp3Url, // Include mp3Url from the API
                };
            });

        // Fetch the JSON data from your local file
        const response = await fetch("https://raw.githubusercontent.com/openstreamorg/openstreammusic-data/main/songs.json");
        if (!response.ok) {
            throw new Error("Failed to fetch JSON data.");
        }

        const data = await response.json();

        // Filter the songs based on the query from the JSON file
        const jsonSongs = data.songs
            .filter(item => item.type === 'song' && item.name.toLowerCase().includes(query.toLowerCase()))
            .map(item => {
                return {
                    name: item.name,
                    artist: item.artist.name,
                    coverUrl: item.thumbnails[1].url,
                    mp3Url: item.mp3Url, // Include mp3Url from the JSON file
                };
            });

        // Combine results from both sources
        const combinedResults = [...apiSongs, ...jsonSongs];

        showSongs(combinedResults);
        hideLoadingAnimation();
    } catch (error) {
        console.error("Error searching music:", error);
        hideLoadingAnimation();
    }
}


// Add this at the end of the onlineChecks function
function onlineChecks() {
    if (navigator.onLine) {
        fetch("https://raw.githubusercontent.com/openstreamorg/openstreammusic-data/main/songs.json")
            .then((response) => response.json())
            .then((data) => {
                allSongs = data.songs;
                allSongs.forEach((song) => {
                    const audio = new Audio(song.mp3Url);
                    audio.preload = "auto";
                });

                // Initialize favorites from the cookie and display them
                getFavoritesFromCookie();

                api.initalize();
            })
            .catch((error) => {
                console.error("Error loading songs:", error);
                hideLoadingAnimation(); // Ensure loading animation is hidden in case of an error
            });
    } else {
        updateOnlineStatus();
    }
}

onlineChecks();
window.addEventListener("online", onlineChecks);
window.addEventListener("offline", onlineChecks);

const customPlayerDiv = document.createElement("div");
customPlayerDiv.id = "custom-player-container";
const customPlayer = document.createElement("audio");
customPlayer.id = "custom-player";
customPlayer.controls = true;
customPlayer.controlsList = "nodownload";
customPlayerDiv.appendChild(customPlayer);
document.body.appendChild(customPlayerDiv);

customPlayer.addEventListener("ended", function() {
    playNextSong();
});

function playNextSong() {
    if (songQueue.length > 0) {
        removeSongFromQueue(0);
        const nextSong = songQueue.shift();
        playSong(nextSong); // Use the playSong function to play the next song
        displaySongQueue();
    } else {
        const shuffledSongs = shuffleArray(allSongs);
        const randomSong = shuffledSongs[0];
        playSong(randomSong); // Use the playSong function to play a random song
        displaySongQueue();
    }
}

/*
function updateSongInfo(song) {
    const songName = document.getElementById("song-name");
    const artistName = document.getElementById("artist-name");
    const albumCover = document.getElementById("player-album-cover");
    songName.textContent = song.name;
    artistName.textContent = song.artist;
    albumCover.src = song.coverUrl;
}*/



searchButton.addEventListener("click", function() {
    const searchQuery = searchInput.value.trim();
    if (searchQuery.length > 0) {
        searchMusic(searchQuery);
    } else {
        // Handle empty search query
        console.log("Search query is empty");
    }
});

searchInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        const searchQuery = searchInput.value.trim();
        if (searchQuery.length > 0) {
            searchMusic(searchQuery);
        } else {
            // Handle empty search query
            console.log("Search query is empty");
        }
    }
});
searchInput.addEventListener("input", function(event) {
    const searchQuery = event.target.value.trim();
    if (searchQuery.length === 0) {
        showSongs(allSongs);
    }
});

function displaySongQueue() {
    // Get the song queue container element
    const songQueueElement = document.getElementById("song-queue");

    // Clear the existing content
    songQueueElement.innerHTML = "";

    // Create a title element
    const songTitle = document.createElement("div");

    const songQueueTitle = document.createElement("h3");
    songQueueTitle.textContent = 'Your Queue';
    songTitle.appendChild(songQueueTitle);

    // Append the title to the song queue container
    songQueueElement.appendChild(songTitle);

    // Loop through the song queue
    songQueue.forEach((song, index) => {
        // Create a div for each song
        const songDiv = document.createElement("div");
        songDiv.classList.add("queue-song");

        // Create a span for the song name

        const songName = document.createElement("span");
        songName.textContent = `${song.name} `;
        songDiv.appendChild(songName);
        songName.style.fontWeight = "bold";

        // Add a line break for separation
        const songBr = document.createElement("br");
        songDiv.appendChild(songBr);

        // Create a span for the artist
        const songArtist = document.createElement("span");
        songArtist.textContent = song.artist;
        songDiv.appendChild(songArtist);

        // Create a button to remove the song from the queue
        const removeButton = document.createElement("button");
        removeButton.textContent = "x";
        removeButton.style.float = "right";
        removeButton.style.verticalAlign = "baseline";

        // Add a click event listener to remove the song
        removeButton.addEventListener("click", () => {
            removeSongFromQueue(index);
        });

        // Add the remove button to the song div
        songDiv.appendChild(removeButton);

        // Add the song div to the song queue container
        songQueueElement.appendChild(songDiv);
    });
}



function removeSongFromQueue(index) {
    if (index >= 0 && index < songQueue.length) {
        songQueue.splice(index, 1);
        displaySongQueue(); // Refresh the queue display
    }
}

// Example usage of adding a song to the queue
// This can be called when the "Add to Queue" button is clicked
function addSongToQueue(song) {
    const isFirstSong = songQueue.length === 0;

    songQueue.push(song);
    displaySongQueue(); // Refresh the queue display

    if (isFirstSong) {
        // If it's the first song in the queue, start playing it
        isFirstPlay = false;
        playSong(song); // Use the new playSong function
    }
}

async function playSong(song) {
    if (currentlyPlaying) {
        currentlyPlaying.pause();
        currentlyPlaying.classList.remove("playing");
    }

    customPlayer.pause();
    customPlayer.currentTime = 0;
    const songNameEl = document.getElementById("song-name");
    const artistNameEl = document.getElementById("artist-name");
    const albumCoverEl = document.getElementById("player-album-cover");
    songNameEl.innerText = song.name;
    artistNameEl.innerText = song.artist;
    albumCoverEl.src = song.coverUrl;

    if (song.mp3Url) {
        // If the song has an mp3Url, play it directly
        customPlayer.src = song.mp3Url;
        customPlayer.play();
        currentlyPlaying = customPlayer;
    } else if (song.videoId) {
        // If the song has a videoId, convert it to a URL and play it
        try {
            const mp3Url = await getUrl(song.videoId);
            customPlayer.src = mp3Url;
            customPlayer.play();
            currentlyPlaying = customPlayer;
        } catch (error) {
            console.error("Error getting mp3Url for the song:", error);
        }
    } else {
        console.error("Invalid song format. It must have either mp3Url or videoId.");
    }
}