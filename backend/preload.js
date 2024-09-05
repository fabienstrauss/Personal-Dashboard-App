const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        on: (channel, func) => ipcRenderer.on(channel, func),
        invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
        removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),
    },
});
