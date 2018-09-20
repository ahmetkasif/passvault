'use strict'

const { app, BrowserWindow, globalShortcut } = require('electron');
const os = require('os');
const path = require('path');
const config = require(path.join(__dirname, 'package.json'));

app.setName(config.name)
var window = null
app.on('ready', function () {
  window = new BrowserWindow({
    minWidth: 1280,
    minHeight: 720,
    title: config.name,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      defaultEncoding: 'UTF-8'
    }
  })

  window.loadURL(`file://${__dirname}/app/index.html`);
  
  let platform = os.platform()
  if (platform === 'darwin') {
    globalShortcut.register('Command+Option+I', () => {
      window.webContents.openDevTools()
    })
  } else if (platform === 'linux' || platform === 'win32') {
    globalShortcut.register('Control+Shift+I', () => {
      window.webContents.openDevTools()
    })

    globalShortcut.register('Control+R', () => {
      window.reload()
    })
  }

  window.once('ready-to-show', () => {
    window.setMenu(null)
    window.show()
  })

  window.onbeforeunload = (e) => {
    e.returnValue = false
  }

  window.on('closed', function () {
    window = null
  })
})