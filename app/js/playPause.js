const { ipcRenderer } = require('electron');

module.exports = {

    startPing(){
        ipcRenderer.send('start-ping');
    },

    stopPing() {
        ipcRenderer.send('stop-ping');
    }   
}