const { app, BrowserWindow, session, ipcMain} = require('electron')
const path = require('path')
let mainWindow = null
function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false, // 安全建议：静态页面不需要 Node 集成
            contextIsolation: true
        }
    })
    // 加载本地 HTML 文件
    mainWindow.loadFile('device/index.html')
    // 如果你的页面在远程服务器上，用 win.loadURL('https://...')
}

let selectorWindow = null
let selectorcallback = null

function openselector(list) {
    if (selectorWindow) return; // 防止重复打开

    selectorWindow = new BrowserWindow({
        width: 400,
        height: 500,
        parent: mainWindow, // 设置父窗口，使弹窗始终在主窗口之上
        modal: true,        // 模态窗口，阻塞父窗口操作
        frame: false,       // 无边框，方便自定义标题栏
        webPreferences: {
            preload: path.join(__dirname, 'selector/preload.js'),
            contextIsolation: true
        }
    });

    selectorWindow.loadFile('selector/selector.html');

    selectorWindow.webContents.on('dom-ready', () => {
        console.log('页面加载完成')
        selectorWindow.webContents.send('selection-list', list);
    })
    
    // 窗口关闭时清理引用
    selectorWindow.on('closed', () => {
        selectorWindow = null;
    });
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // 1. 监听设备选择事件
  mainWindow.webContents.session.on('select-hid-device', (event, details, callback) => {
    // details.deviceList: HIDDevice对象数组
    // details.frame: 发起请求的帧信息
    
    console.log('HID 设备请求:', details.deviceList);

    if(details.deviceList.length > 1) {
        let devices = details.deviceList.find(device => device.vendorId === 3034 && device.productId === 65491);
        callback(devices.deviceId);
    } else {
        callback(details.deviceList.length > 0 ? details.deviceList[0].deviceId : '');
    }
    // if(details.deviceList.length > 1) {
    //     mainWindow.webContents.send('app-suspended');
    //     selectorcallback = callback
    //     openselector(details.deviceList)
    // } else {
    //     callback(details.deviceList.length > 0 ? details.deviceList[0].deviceId : '');
    // }
    
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 2. 接收子窗口传来的选择结果
ipcMain.on('selector-result', (event, data) => {
  if (selectorWindow) {
    selectorWindow.close(); // 关闭弹窗
    
    // 将结果发送给主窗口的渲染进程
    console.log("接收到的设备ID:",data)
    selectorcallback(data)
    selectorcallback = null
    mainWindow.webContents.send('app-resumed');
  }
});