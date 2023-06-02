import * as dotenv from 'dotenv'
dotenv.config()
import { app, BrowserWindow, shell, ipcMain, screen } from 'electron'
import { join } from 'path'
import { release } from 'os'
import { WebUSB } from 'usb';
const webusb = new WebUSB({
  allowAllDevices: true
});
import './api/server'
import { usbPath, usbAttach, usbDetach } from './api/routes'

//app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1');
//==============================================================
app.commandLine.appendSwitch("--touch-events");
app.commandLine.appendSwitch("--enable-touch-events");
app.commandLine.appendSwitch("touch-events", "true");
app.commandLine.appendSwitch("top-chrome-touch-ui", "true");
app.commandLine.appendSwitch("--touch-events", "enabled");
// Disable GPU Acceleration for Windows 7
//if (release().startsWith('6.1'))
app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, '../..'),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`
const indexHtml = join(ROOT_PATH.dist, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'BloomHMI',
    kiosk: true,
    autoHideMenuBar: true,
    icon: join(ROOT_PATH.public, 'icon.ico'),
    webPreferences: {
      preload,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      webSecurity: false,
    },
  })
  try {
    // works with 1.1 too
    win.webContents.debugger.attach('1.2')
  } catch (err) {
    //console.log('Debugger attach failed: ', err)
  }

  const isDebuggerAttached = win.webContents.debugger.isAttached()
  //console.log('debugger attached? ', isDebuggerAttached)

  win.webContents.debugger.on('detach', (event, reason) => {
    //console.log('Debugger detached due to: ', reason)
  });

  // This is where the magic happens!
  win.webContents.debugger.sendCommand('Emulation.setEmitTouchEventsForMouse', {
    enabled: true
  });

  win.setBackgroundColor('#282c34');
  win.once('ready-to-show', () => {
    let devInnerHeight = 1080.0 // InnerHeight at development time
    let devDevicePixelRatio = 1.0// devicepixelratio during development
    let devScaleFactor = 1.6 // ScaleFactor at development time
    let scaleFactor = screen.getPrimaryDisplay().scaleFactor
    let zoomFactor = (screen.getPrimaryDisplay().size.height / devInnerHeight) * (1 / devDevicePixelRatio) * (devScaleFactor / scaleFactor)
    //console.log(scaleFactor)
    win?.webContents.setZoomFactor(zoomFactor);
  })

  if (app.isPackaged) {
    win.loadFile(indexHtml)
  } else {
    win.loadURL(url)
    //win.webContents.openDevTools()
  }
  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(async () => {
  webusb.addEventListener('connect', usbAttach);
  webusb.addEventListener('disconnect', usbDetach);
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  webusb.addEventListener('connect', usbAttach);
  webusb.addEventListener('disconnect', usbDetach);
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

process.on("uncaughtException", (err) => {
  /*console.log(err);*/
});

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    },
  })

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg })
  } else {
    childWindow.loadURL(`${url}/#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})
