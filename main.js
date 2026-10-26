const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 720,
        minWidth: 800,
        minHeight: 560,
        backgroundColor: '#05080e',
        autoHideMenuBar: true,
        title: 'MazeX - Designed by Lobhas Kulkarni',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
