const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    Menu
} = require('electron');
const {
    init
} = require("./bot-index.js")
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

ipcMain.on('start', async (event, fileGroup, visibleMode, apiKeyValue) => {
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
        await init(logToTextarea, logToTable, fileGroup, visibleMode, apiKeyValue).catch((err) => logToTextarea(err));
        logToTextarea("Done")

        event.sender.send("enabled")
    } catch (error) {
        logToTextarea(error)
    }
});

ipcMain.on('save-excel-data', (event, data) => {
    const options = {
        title: 'Save an Excel',
        filters: [{
            name: 'Excel',
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