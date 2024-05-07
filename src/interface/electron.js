const { ipcRenderer } = require("electron");

const sendEvent = (eventName, data = '') => ipcRenderer.send(eventName, data);
const receiveEvent = (eventName, callback) => ipcRenderer.on(eventName, callback);

module.exports = {
    sendEvent,
    receiveEvent
};