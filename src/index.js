const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    Menu
} = require('electron');
const {
    init,
    stopProccess
} = require("./bot-index.js")
const {
    autoUpdater
} = require('electron-updater');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 580,
        height: 724,
        icon: `./assets/logos.ico`,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#ffff',
            symbolColor: '#313866',
        },
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: !app.isPackaged
        }
    });
    mainWindow.loadFile('src/index.html');
    app.isPackaged && Menu.setApplicationMenu(null);

    autoUpdater.on('download-progress', (progress) => {
        mainWindow.webContents.send('update_progress', progress.percent);
    });

    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.on('update-available', () => {
        updateCheckInProgress = false;
        mainWindow.webContents.send('update_available');
    });

    autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('update_downloaded');
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('refreshWindow', () => {
    mainWindow.reload();
});

ipcMain.on('start', async (event, data) => {
    const logs = [];
    const reports = [];

    const logToTextarea = (message) => {
        logs.push(message);
        event.sender.send('log', logs.join('\n'));
    };

    const logToTable = (search, hasil) => {
        reports.push({
            search,
            hasil
        });
        event.sender.send('logToTable', reports);
    };

    try {
        logToTextarea("Start")
        event.sender.send("disabled")
        await init(logToTextarea, logToTable, data)
        logToTextarea("Done")

        event.sender.send("enabled")
    } catch (error) {
        logToTextarea(error)
    }
});

ipcMain.on('stop', (event) => {
    const logs = [];

    const logToTextarea = (msg) => {
        logs.push(msg);
        event.sender.send("log", logs.join("\n"));
    };

    stopProccess(logToTextarea);
    event.sender.send("enabled");
});

ipcMain.on('save-excel-data', (event, data) => {
    const options = {
        title: 'Save the data',
        defaultPath: `data-index-checker.xlsx`,
        filters: [{
            name: '.xlsx',
            extensions: ['xlsx']
        }]
    };

    dialog.showSaveDialog(options).then(result => {
        if (!result.canceled) {
            fs.writeFileSync(result.filePath, new Uint8Array(data));
            dialog.showMessageBox({
                type: 'info',
                title: 'Alert',
                message: 'Success save the file report',
                buttons: ['OK']
            });
        } else {
            dialog.showMessageBox({
                type: 'info',
                title: 'Alert',
                message: 'Failed save the file report',
                buttons: ['OK']
            });
        }
    }).catch(err => {
        console.error(err);
    });
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', {
        version: app.getVersion()
    });
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});