const {app, BrowserWindow, Menu, globalShortcut} = require('electron')

process.env.NODE_ENV = 'development'

let window
const isDev = process.env.NODE_ENV === 'development' ? true : false
const isMac = process.platform === 'darwin' ? true : false

const main = () => {
  window = new BrowserWindow({
    title: 'App Shrink',
    widht: 500,
    height: 600,
    icon: './static/assets/Icon_256x256.png',
    resizable: isDev
  })

  window.loadURL(`file://${__dirname}/static/index.html`)
}

const menu = [
  ...(isMac ? [{role: 'appMenu'}] : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: isMac ? 'Command+W' : 'Ctrl+W',
        click: () => app.quit()
      }
    ]
  }
]

app.on('ready', () => {
  main()

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  globalShortcut.register('CmdOrCtrl+R', () => window.reload())
  globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () =>
    window.toggleDevTools()
  )

  window.on('ready', () => (window = null))
})

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      main()
    }
  })
})

app.allowRendererProcessReuse = true
