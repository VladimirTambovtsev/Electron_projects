const path = require('path')
const os = require('os')
const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell
} = require('electron')
const {log} = require('electron-log')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const slash = require('slash')

process.env.NODE_ENV = 'development'

let window
let aboutWindow
const isDev = process.env.NODE_ENV === 'development' ? true : false
const isMac = process.platform === 'darwin' ? true : false
const isWindows = process.platform === 'win32' ? true : false

const createMainWindow = () => {
  window = new BrowserWindow({
    title: 'App Shrink',
    widht: 500,
    height: 600,
    // icon: './static/assets/Icon_256x256.png',
    resizable: isDev,
    webPreferences: {
      nodeIntegration: true
    }
  })

  window.loadURL(`file://${__dirname}/static/index.html`)
}

const createAboutWindow = () => {
  aboutWindow = new BrowserWindow({
    title: 'About',
    widht: 300,
    height: 300,
    // icon: './static/assets/Icon_256x256.png',
    resizable: false,
    backgroundColor: 'white'
  })

  aboutWindow.loadURL(`file://${__dirname}/static/about.html`)
}

const menu = [
  ...(isMac
    ? [
        {
          role: app.menu,
          submenu: [
            {
              label: 'About',
              click: () => createAboutWindow()
            }
          ]
        }
      ]
    : []),
  ...(isWindows
    ? {
        label: 'Help',
        submenu: [{label: 'About', click: createAboutWindow()}]
      }
    : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: isMac ? 'Command+W' : 'Ctrl+W',
        click: () => app.quit()
      }
    ]
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            {
              role: 'reload',
              role: 'forcereload',
              role: 'separator',
              role: 'toggledevtools'
            }
          ]
        }
      ]
    : [])
]

app.on('ready', () => {
  createMainWindow()

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
      createMainWindow()
    }
  })
})

app.allowRendererProcessReuse = true

ipcMain.on('image:minimize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageshrink')
  shrinkImage(options)
  console.log(options)
})

async function shrinkImage({imgPath, quality, dest}) {
  try {
    const pngQuality = quality / 100

    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({quality}),
        imageminPngquant({quality: [pngQuality, pngQuality]})
      ]
    })

    console.log(files)
    log.info(files)

    shell.openPath(dest)

    window.webContents.send('image:done')
  } catch (error) {
    console.error(error)
    log.error(err)
  }
}
