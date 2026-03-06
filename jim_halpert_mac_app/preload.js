// Preload — exposes storage IPC to renderer securely
'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('prankStorage', {
  load: () => ipcRenderer.invoke('pranks:load'),
  save: (pranks) => ipcRenderer.invoke('pranks:save', pranks),
});
