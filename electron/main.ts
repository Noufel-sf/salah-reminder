import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification } from 'electron';
import path from 'path';

// Disable hardware acceleration issues on some Windows setups if needed
// app.disableHardwareAcceleration();

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createTray() {
  // Create a sleek simple tray icon using nativeImage canvas or SVG fallback
  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>
  `;
  const iconBuffer = Buffer.from(iconSvg);
  const trayIcon = nativeImage.createFromBuffer(iconBuffer).resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('Noor - Prayer Reminder');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Noor Reminder',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 720,
    minWidth: 400,
    minHeight: 650,
    maxWidth: 520,
    maxHeight: 850,
    resizable: true,
    frame: false, // Custom frameless title bar
    transparent: false,
    backgroundColor: '#0a0f18',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // In development, load from Vite dev server URL
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Minimize to tray on close button click
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

// Window control IPC handlers
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.hide();
});

// Native Notification IPC handler
ipcMain.on('show-notification', (_, { title, body }: { title: string; body: string }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title || 'Prayer Time',
      body: body || 'It is time for prayer',
      silent: false
    });
    notification.on('click', () => {
      mainWindow?.show();
      mainWindow?.focus();
    });
    notification.show();
  }
});

// Autostart IPC handlers
ipcMain.handle('set-startup', async (_, enable: boolean) => {
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe')
  });
  return enable;
});

ipcMain.handle('get-startup', async () => {
  const settings = app.getLoginItemSettings();
  return settings.openAtLogin;
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in tray
  }
});
