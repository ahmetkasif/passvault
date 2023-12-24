const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fileAPI', {
  checkFileExistence: async (filePath) => {
    try {
      const fileExists = await ipcRenderer.invoke('check-file-exists', filePath);
      return fileExists;
    } catch (error) {
      return false;
    }
  }
});

contextBridge.exposeInMainWorld('api', {
  sendToMain: (channel, data) => {
    const validChannels = ['close-window-request'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  exportPW: (channel, data) => {
    const validChannels = ['export-passwords'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  importPW: async (channel, data) => {
    const validChannels = ['import-passwords'];
    if (validChannels.includes(channel)) {
        try {
            const response = await ipcRenderer.invoke(channel, data);
            return response;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
  }
});

contextBridge.exposeInMainWorld('loginAPI', {
    loginRequest: async (channel, data) => {
        const validChannels = ['login-request'];
        if (validChannels.includes(channel)) {
            try {
                const result = await ipcRenderer.invoke(channel, data);
              return result;
            } catch (error) {
              return false;
            }
        }
    }
});

contextBridge.exposeInMainWorld('saveDiskAPI', {
  saveDiskRequest: (channel, data) => {
    const validChannels = ['save-disk-request'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});
