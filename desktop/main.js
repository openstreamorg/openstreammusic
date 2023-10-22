const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const url = require("url");
const https = require("https");
const YoutubeMusicApi = require('youtube-music-api');
const api = new YoutubeMusicApi();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: __dirname + '/images/logo.ico',
        minWidth: 800,
        minHeight: 550,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    Menu.setApplicationMenu(null);

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true,
        })
    );

    mainWindow.on("closed", function() {
        mainWindow = null;
    });
}

app.on("ready", () => {
    createWindow();

    https.get(
        "https://raw.githubusercontent.com/openstreamorg/openstreammusic-data/main/songs.json",
        (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                const songs = JSON.parse(data).songs;
                mainWindow.webContents.send("songs", songs);
            });
        }
    );
});

app.on("window-all-closed", function() {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function() {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on("play", (event, song) => {
    mainWindow.webContents.send("playSong", song);
});

ipcMain.on('add-to-playlist', (event, song) => {
    playlist.push(song);
    mainWindow.webContents.send('update-playlist', playlist);
});