// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  
  // 子窗口监听：接收选择结果
  onSelectionList: (callback) => ipcRenderer.on('selection-list', (_event, data) => callback(data)),

  // 子窗口调用：提交选择并关闭
  submitSelection: (data) => ipcRenderer.send('selector-result', data)
});
