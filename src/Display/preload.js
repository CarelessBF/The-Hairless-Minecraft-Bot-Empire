const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  // system: () => ipcRenderer.invoke('dark-mode:system'),
})

let setBotUsername = async (args) => {
  let newBotUsername = await ipcRenderer.invoke('set-botusername', args);
  return newBotUsername
}

let setBotHost = async (args) => {
  let newBotHost = await ipcRenderer.invoke('set-bothost', args);
  return newBotHost
}

let setBotPort = async (args) => {
  let newBotPort = await ipcRenderer.invoke('set-botport', args);
  return newBotPort
}

contextBridge.exposeInMainWorld("getBotInfo", {
  setBotUsername: setBotUsername,
  setBotHost: setBotHost,
  setBotPort: setBotPort
})

contextBridge.exposeInMainWorld("appControl", {
  quitApp: () => ipcRenderer.send("quit-App-Main"),
  restartApp: () => ipcRenderer.send("restart-App-Main")
})

