const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    Menu
} = require("electron");
const {
    init,
    stopProccess
} = require("./bot-index.js");
const {
    autoUpdater
} = require("electron-updater");
const path = require("path");
const fs = require("fs");
// const { mac } = require('getmac');
const mac  = require('getmac')

const authWindowSize = [500, 210]
let mainWindow, authWindow;
const productName = "Alsav Index Checker"

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 580,
        height: 724,
        title: productName,
        icon: `./assets/logos.ico`,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#ffff",
            symbolColor: "#313866",
        },
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: !app.isPackaged,
        },
    });
    mainWindow.loadFile("src/pages/index.html");
    app.isPackaged && Menu.setApplicationMenu(null);

    if (process.env.UPDATER === "true") {
        autoUpdater.on("download-progress", (progress) => {
            mainWindow.webContents.send("update_progress", progress.percent);
        });

        autoUpdater.checkForUpdatesAndNotify();
        autoUpdater.on("update-available", () => {
            updateCheckInProgress = false;
            mainWindow.webContents.send("update_available");
        });

        autoUpdater.on("update-downloaded", () => {
            mainWindow.webContents.send("update_downloaded");
        });
    }
}

function createAuthWindow() {
    authWindow = new BrowserWindow({
        width: authWindowSize[0],
        height: authWindowSize[1],
        icon: `./assets/logos.ico`,
        autoHideMenuBar: true,
        title: productName,
        resizable: !app.isPackaged,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: !app.isPackaged,
        },
    });
    authWindow.loadFile("src/pages/gate.html");
    app.isPackaged && Menu.setApplicationMenu(null);
}

app.whenReady().then(createAuthWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createAuthWindow();
    }
});

ipcMain.on("start", async (event, data) => {
    const logs = [];
    const reports = [];

    const logToTextarea = (message) => {
        logs.push(message);
        event.sender.send("log", logs.join("\n"));
    };

    const logToTable = (search, hasil) => {
        reports.push({
            search,
            hasil,
        });
        event.sender.send("logToTable", reports);
    };

    try {
        logToTextarea("Start");
        event.sender.send("disabled");
        await init(logToTextarea, logToTable, data);
        logToTextarea("Done");

        event.sender.send("enabled");
    } catch (error) {
        logToTextarea(error);
    }
});

ipcMain.on("stop", (event) => {
    const logs = [];

    const logToTextarea = (msg) => {
        logs.push(msg);
        event.sender.send("log", logs.join("\n"));
    };

    stopProccess(logToTextarea);
    event.sender.send("enabled");
});

ipcMain.on("save-excel-data", (event, data) => {
    const options = {
        title: "Save the data",
        defaultPath: `data-index-checker.xlsx`,
        filters: [{
            name: ".xlsx",
            extensions: ["xlsx"],
        }, ],
    };

    dialog
        .showSaveDialog(options)
        .then((result) => {
            if (!result.canceled) {
                fs.writeFileSync(result.filePath, new Uint8Array(data));
                dialog.showMessageBox({
                    type: "info",
                    title: "Alert",
                    message: "Success save the file report",
                    buttons: ["OK"],
                });
            } else {
                dialog.showMessageBox({
                    type: "info",
                    title: "Alert",
                    message: "Failed save the file report",
                    buttons: ["OK"],
                });
            }
        })
        .catch((err) => {
            console.error(err);
        });
});

ipcMain.on("app_version", (event) => {
    event.sender.send("app_version", {
        version: app.getVersion(),
    });
});

ipcMain.on('get-personal-data', (event, args) => {
  event.reply('get-personal-data', {mac : mac.isMAC(mac.default()) ? mac.default() : null, app_id : app.getName()});
})

ipcMain.on("restart_app", () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('license-valid', () => {
    authWindow.close();
    createWindow();
})