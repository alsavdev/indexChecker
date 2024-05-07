const { ipcRenderer } = require("electron");

function getPersonalData() {
    return new Promise((resolve, reject) => {
        ipcRenderer.send("get-personal-data");

        ipcRenderer.on("get-personal-data", (event, arg) => {
            resolve(arg);
        });
    });
}

module.exports = getPersonalData;
