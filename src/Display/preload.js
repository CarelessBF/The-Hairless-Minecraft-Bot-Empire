const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system'),
})

let getBotUsername = async () => {
  let newBotUsername = await ipcRenderer.invoke('get-botUsername');
  console.log(newBotUsername)
  return newBotUsername
}

contextBridge.exposeInMainWorld('getBotInfo', {
  getBotUsername: getBotUsername
})

