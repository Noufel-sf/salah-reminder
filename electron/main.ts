import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification, globalShortcut, screen } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let widgetWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

interface TrayData {
  tooltip: string;
  nextPrayerName: string;
  nextPrayerTime: string;
  remainingText: string;
  isMuted?: boolean;
}

let lastTrayData: TrayData = {
  tooltip: 'رمضان برو - منبّه الصلاة والأذكار',
  nextPrayerName: '',
  nextPrayerTime: '',
  remainingText: '',
  isMuted: false
};

function getAppIcon(): { image: Electron.NativeImage; filePath: string } | null {
  const possiblePaths = [
    path.join(__dirname, '../public/icon.png'),
    path.join(__dirname, '../dist/icon.png'),
    path.join(process.cwd(), 'public/icon.png'),
    path.join(process.cwd(), 'dist/icon.png'),
    path.join(__dirname, 'icon.png')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const img = nativeImage.createFromPath(p);
        if (!img.isEmpty()) {
          return { image: img, filePath: p };
        }
      } catch {
        // continue
      }
    }
  }
  return null;
}

function updateTrayMenu(data?: TrayData) {
  if (!tray) return;
  if (data) lastTrayData = data;

  const tooltip = lastTrayData.nextPrayerName
    ? `رمضان برو | ${lastTrayData.nextPrayerName} بعد ${lastTrayData.remainingText} (${lastTrayData.nextPrayerTime})`
    : (lastTrayData.tooltip || 'رمضان برو - منبّه الصلاة والأذكار');

  tray.setToolTip(tooltip);

  const menuTemplate: Electron.MenuItemConstructorOptions[] = [];

  if (lastTrayData.nextPrayerName) {
    menuTemplate.push({
      label: `🕌 ${lastTrayData.nextPrayerName}: بعد ${lastTrayData.remainingText} (${lastTrayData.nextPrayerTime})`,
      enabled: false
    });
    menuTemplate.push({ type: 'separator' });
  }

  const isWidgetOpen = widgetWindow && !widgetWindow.isDestroyed() && widgetWindow.isVisible();

  menuTemplate.push(
    {
      label: '🖥️ فتح التطبيق الرئيسي',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: isWidgetOpen ? '🪟 إخفاء الودجت العائم' : '🪟 إظهار الودجت العائم لسطح المكتب',
      click: () => {
        toggleWidgetWindow();
      }
    },
    {
      label: '📿 تسبيح سريع (+1)',
      click: () => {
        mainWindow?.webContents.send('tray-quick-tasbih');
        widgetWindow?.webContents.send('tray-quick-tasbih');
      }
    },
    {
      label: lastTrayData.isMuted ? '🔊 إلغاء كتم الصوت' : '🔇 كتم أصوات التنبيهات',
      click: () => {
        mainWindow?.webContents.send('tray-toggle-mute');
      }
    },
    { type: 'separator' },
    {
      label: '🚪 إغلاق التطبيق نهائياً',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  );

  tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
}

function createTray() {
  const iconData = getAppIcon();
  let trayIcon: Electron.NativeImage;

  if (iconData) {
    trayIcon = iconData.image.resize({ width: 16, height: 16 });
  } else {
    const iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
      </svg>
    `;
    trayIcon = nativeImage.createFromBuffer(Buffer.from(iconSvg)).resize({ width: 16, height: 16 });
  }

  tray = new Tray(trayIcon);
  updateTrayMenu();

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

function createWidgetWindow() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.show();
    widgetWindow.focus();
    updateTrayMenu();
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const widgetWidth = 330;
  const widgetHeight = 76;
  const x = screenWidth - widgetWidth - 24;
  const y = screenHeight - widgetHeight - 24;

  const preloadPath = fs.existsSync(path.join(__dirname, 'preload.cjs'))
    ? path.join(__dirname, 'preload.cjs')
    : path.join(__dirname, 'preload.js');

  widgetWindow = new BrowserWindow({
    width: widgetWidth,
    height: widgetHeight,
    x,
    y,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  const widgetUrl = process.env.VITE_DEV_SERVER_URL
    ? `${process.env.VITE_DEV_SERVER_URL}#widget`
    : `file://${path.join(__dirname, '../dist/index.html')}#widget`;

  widgetWindow.loadURL(widgetUrl);

  widgetWindow.on('closed', () => {
    widgetWindow = null;
    updateTrayMenu();
  });

  updateTrayMenu();
}

function toggleWidgetWindow() {
  if (widgetWindow && !widgetWindow.isDestroyed() && widgetWindow.isVisible()) {
    widgetWindow.close();
    widgetWindow = null;
  } else {
    createWidgetWindow();
  }
  updateTrayMenu();
}

function createWindow() {
  const iconData = getAppIcon();

  const preloadPath = fs.existsSync(path.join(__dirname, 'preload.cjs'))
    ? path.join(__dirname, 'preload.cjs')
    : path.join(__dirname, 'preload.js');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    resizable: true,
    maximizable: true,
    fullscreenable: true,
    frame: false, // Custom frameless title bar
    backgroundColor: '#101915',
    show: false,
    icon: iconData?.filePath || iconData?.image,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

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
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  win?.minimize();
});

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  win?.hide();
});

// Tray & Widget IPC handlers
ipcMain.on('update-tray', (_, data: TrayData) => {
  updateTrayMenu(data);
});

ipcMain.on('toggle-widget', () => {
  toggleWidgetWindow();
});

ipcMain.on('close-widget', () => {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.close();
    widgetWindow = null;
  }
});

ipcMain.on('open-main', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

// Native Notification IPC handler
ipcMain.on('show-notification', (_, { title, body }: { title: string; body: string }) => {
  if (Notification.isSupported()) {
    const iconData = getAppIcon();
    const notification = new Notification({
      title: title || 'Prayer Time',
      body: body || 'It is time for prayer',
      icon: iconData?.filePath,
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

  // Global Hotkey: Ctrl + Shift + P to toggle show/hide from anywhere in Windows
  try {
    globalShortcut.register('CommandOrControl+Shift+P', () => {
      if (mainWindow) {
        if (mainWindow.isVisible() && mainWindow.isFocused()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  } catch (err) {
    console.error('Failed to register global shortcut:', err);
  }

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

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in tray
  }
});
