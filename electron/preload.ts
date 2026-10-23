import { contextBridge, ipcRenderer } from 'electron';

export interface TrayUpdatePayload {
  tooltip: string;
  nextPrayerName: string;
  nextPrayerTime: string;
  remainingText: string;
  isMuted?: boolean;
}

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  showNotification: (title: string, body: string) => void;
  setStartup: (enable: boolean) => Promise<boolean>;
  getStartup: () => Promise<boolean>;
  updateTray: (data: TrayUpdatePayload) => void;
  toggleWidget: () => void;
  closeWidget: () => void;
  openMain: () => void;
  onQuickTasbih: (callback: () => void) => () => void;
  onToggleMute: (callback: () => void) => () => void;
}

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  showNotification: (title: string, body: string) => {
    ipcRenderer.send('show-notification', { title, body });
  },
  setStartup: (enable: boolean) => ipcRenderer.invoke('set-startup', enable),
  getStartup: () => ipcRenderer.invoke('get-startup'),
  updateTray: (data: TrayUpdatePayload) => {
    ipcRenderer.send('update-tray', data);
  },
  toggleWidget: () => ipcRenderer.send('toggle-widget'),
  closeWidget: () => ipcRenderer.send('close-widget'),
  openMain: () => ipcRenderer.send('open-main'),
  onQuickTasbih: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('tray-quick-tasbih', handler);
    return () => ipcRenderer.removeListener('tray-quick-tasbih', handler);
  },
  onToggleMute: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('tray-toggle-mute', handler);
    return () => ipcRenderer.removeListener('tray-toggle-mute', handler);
  }
});
