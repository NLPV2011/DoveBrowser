const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tabs = [];
let currentTabIndex = 0;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'Dove',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    createTab('https://www.google.com');
  });
}

function createTab(url) {
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.addBrowserView(view);
  updateTabBounds();
  view.webContents.loadURL(url);

  view.webContents.on('did-start-loading', () => {
    mainWindow.webContents.send('update-navigation', {
      canGoBack: view.webContents.canGoBack(),
      canGoForward: view.webContents.canGoForward(),
      isLoading: true,
      url: view.webContents.getURL()
    });
  });

  view.webContents.on('did-stop-loading', () => {
    mainWindow.webContents.send('update-navigation', {
      canGoBack: view.webContents.canGoBack(),
      canGoForward: view.webContents.canGoForward(),
      isLoading: false,
      url: view.webContents.getURL()
    });
  });

  tabs.push(view);
  currentTabIndex = tabs.length - 1;
  updateTabs();
}

function updateTabBounds() {
  const bounds = mainWindow.getContentBounds();
  const controlsHeight = 40; // Chiều cao của thanh điều khiển
  const tabsHeight = 35; // Chiều cao của thanh tab
  const navHeight = 40; // Chiều cao của thanh điều hướng
  const totalTopHeight = controlsHeight + tabsHeight + navHeight;

  tabs.forEach((tab, index) => {
    if (index === currentTabIndex) {
      tab.setBounds({ 
        x: 0, 
        y: totalTopHeight, 
        width: bounds.width, 
        height: bounds.height - totalTopHeight 
      });
    } else {
      tab.setBounds({ x: 0, y: totalTopHeight, width: 0, height: 0 });
    }
  });
}

function updateTabs() {
  updateTabBounds();
  mainWindow.webContents.send('update-tabs', tabs.map(tab => tab.webContents.getURL()));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on('new-tab', (event, url) => {
  createTab(url);
});

ipcMain.on('switch-tab', (event, index) => {
  currentTabIndex = index;
  updateTabs();
  const currentTab = tabs[currentTabIndex];
  mainWindow.webContents.send('update-navigation', {
    canGoBack: currentTab.webContents.canGoBack(),
    canGoForward: currentTab.webContents.canGoForward(),
    isLoading: false,
    url: currentTab.webContents.getURL()
  });
});

ipcMain.on('close-tab', (event, index) => {
  if (tabs.length > 1) {
    mainWindow.removeBrowserView(tabs[index]);
    tabs.splice(index, 1);
    if (currentTabIndex >= tabs.length) currentTabIndex = tabs.length - 1;
    updateTabs();
  }
});

ipcMain.on('window-resized', (event, width, height) => {
  updateTabBounds();
});

ipcMain.on('navigate', (event, action, url) => {
  const currentTab = tabs[currentTabIndex];
  switch(action) {
    case 'back':
      if (currentTab.webContents.canGoBack()) currentTab.webContents.goBack();
      break;
    case 'forward':
      if (currentTab.webContents.canGoForward()) currentTab.webContents.goForward();
      break;
    case 'refresh':
      currentTab.webContents.reload();
      break;
    case 'home':
      currentTab.webContents.loadURL('https://www.google.com');
      break;
    case 'go':
      currentTab.webContents.loadURL(url);
      break;
  }
});