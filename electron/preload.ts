import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  showNotification: (title: string, body: string) => void;
  setStartup: (enable: boolean) => Promise<boolean>;
  getStartup: () => Promise<boolean>;
}

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  showNotification: (title: string, body: string) => {
    ipcRenderer.send('show-notification', { title, body });
  },
  setStartup: (enable: boolean) => ipcRenderer.invoke('set-startup', enable),
  getStartup: () => ipcRenderer.invoke('get-startup')
});
