const { app, BrowserWindow, Menu, ipcMain, globalShortcut, dialog } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const dirPath = path.join(__dirname, '../../src');
const config = require(path.join(__dirname, '../../package.json'));
const os = require('os');
const moment = require('moment');
const CryptoJS = require("crypto-js");

const dbvaultname = "passvaultDB"

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        width: 1280,
        height: 720,
        icon: 'src/images/icon.ico',
        title: config.name,
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    
    const userDataPath = app.getPath('userData');
    filePath = path.join(userDataPath, dbvaultname);

    ipcMain.handle('check-file-exists', (event) => {
        const fileExists = fs.existsSync(filePath);
        return fileExists;
    });

    ipcMain.on('close-window-request', (event, message) => {
        mainWindow.close();
    });

    ipcMain.on('export-passwords', (event, dataObject) => {
        exportPasswords(dataObject);
    });

    ipcMain.handle('import-passwords', async (event, vaultpass) => {
        try{
            var response = await importPasswords(vaultpass);
            console.log(response);
            return {"result": true, "dataObject": response.dataObject};
        }catch (error) {
            return {"result": false, "error": error};
        } 
    });

    ipcMain.handle('login-request', (event, vaultpass) => {
        filePath = path.join(userDataPath, dbvaultname);

        try{
            var ciphertext = fs.readFileSync(filePath);
            var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), vaultpass);
            dataObject = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            return {"result": true, "dataObject": dataObject};
        }catch (error) {
            return {"result": false, "dataObject": null};
        }
    });

    ipcMain.on('save-disk-request', (event, dataObject) => {
        filePath = path.join(userDataPath, dbvaultname);
        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(dataObject), dataObject.user.vaultpass).toString();
        fs.writeFileSync(filePath, ciphertext);
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function loadDisk(vaultpass) {
    var ciphertext = fs.readFileSync(currentpath);
    var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), vaultpass);
    dataObject = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return;
}

function exportPasswords(dataObject) {
    dialog.showSaveDialog({
        title: 'Dışarı Aktar',
        defaultPath: 'passvault.enc',
        filters: [{ name: 'Encrypted Text Files', extensions: ['enc'] }]
    }).then((file) => {
    if (!file.canceled && file.filePath) {
        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(dataObject), dataObject.user.vaultpass).toString();

        fs.writeFile(file.filePath, ciphertext, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('File saved successfully!');
        }
        });
    }
    }).catch((err) => {
        console.error('Dialog error:', err);
    });

    return;
}

function importPasswords(vaultpass) {
    return new Promise((resolve, reject) => {
        dialog.showOpenDialog({
            title: 'İçeri Aktar',
            properties: ['openFile']
        }).then((file) => {
            if (!file.canceled && file.filePaths.length > 0) {
                // User selected a file, proceed to read
                fs.readFile(file.filePaths[0], 'utf-8', (err, data) => {
                if (err) {
                    resolve({'result': false});
                } else {
                    var bytes = CryptoJS.AES.decrypt(data.toString(), vaultpass);
                    dataObject = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    resolve({'result': true, 'dataObject': dataObject});
                }
                });
            }
        }).catch((err) => {
            resolve({'result': false});
        });
    })
}