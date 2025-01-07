import { app, shell, BrowserWindow, ipcMain, globalShortcut, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Store from 'electron-store'
import icon from '../../resources/icon.png?asset'

interface WindowBounds {
  width: number
  height: number
  xPercent?: number
  yPercent?: number
}

const store = new Store<WindowBounds>()

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const defaultBounds: WindowBounds = { width: 900, height: 670 }
  const savedBounds = store.get('windowBounds', defaultBounds)

  // Create the browser window.
  mainWindow = new BrowserWindow({
    ...savedBounds,
    show: false,
    autoHideMenuBar: true,
    transparent: true,
    // vibrancy: 'fullscreen-ui', // on MacOS
    // backgroundMaterial: 'acrylic', // on Windows 11
    alwaysOnTop: true,
    frame: false,
    focusable: true,
    skipTaskbar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      spellcheck: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('resize', () => {
    if (mainWindow) {
      store.set('windowBounds', mainWindow.getBounds())
    }
  })

  // In the move event handler, convert absolute position to percentages
  mainWindow.on('move', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds()
      const display = screen.getDisplayMatching(bounds)
      const xPercent = (bounds.x - display.bounds.x) / display.bounds.width
      const yPercent = (bounds.y - display.bounds.y) / display.bounds.height

      store.set('windowBounds', {
        width: bounds.width,
        height: bounds.height,
        xPercent,
        yPercent
      })
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// app.commandLine.appendSwitch('--enable-transparent-visuals')

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('hide-window', () => {
    console.log('hiding window')
    if (mainWindow) {
      mainWindow.hide()
    }
  })

  createWindow()

  // In the toggle handler, restore position using percentages
  globalShortcut.register('Alt+N', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        const cursorPoint = screen.getCursorScreenPoint()
        const display = screen.getDisplayNearestPoint(cursorPoint)
        const savedBounds = store.get('windowBounds', {
          width: 900,
          height: 670,
          xPercent: 0,
          yPercent: 0
        }) as WindowBounds

        // Calculate absolute position from percentages
        const newX = display.bounds.x + (savedBounds.xPercent ?? 0) * display.bounds.width
        const newY = display.bounds.y + (savedBounds.yPercent ?? 0) * display.bounds.height

        // Ensure window stays within screen bounds
        const boundedX = Math.min(
          Math.max(newX, display.bounds.x),
          display.bounds.x + display.bounds.width - savedBounds.width
        )
        const boundedY = Math.min(
          Math.max(newY, display.bounds.y),
          display.bounds.y + display.bounds.height - savedBounds.height
        )

        mainWindow.setBounds({
          x: Math.round(boundedX),
          y: Math.round(boundedY),
          width: savedBounds.width,
          height: savedBounds.height
        })

        mainWindow.show()
      }
    }
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
