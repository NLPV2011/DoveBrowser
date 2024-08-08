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
    frame: false,
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

  mainWindow.on('resize', updateTabBounds);
  mainWindow.on('maximize', updateTabBounds);
  mainWindow.on('unmaximize', updateTabBounds);
}

ipcMain.on('window-control', (event, action) => {
  switch (action) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    case 'close':
      mainWindow.close();
      break;
  }
});

function createTab(url) {
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  tabs.push({ view, title: 'New Tab' });
  currentTabIndex = tabs.length - 1;

  mainWindow.setBrowserView(view);
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

  view.webContents.on('page-title-updated', (event, title) => {
    tabs[currentTabIndex].title = title;
    updateTabs();
  });

  updateTabs();
}

function updateTabBounds() {
  const bounds = mainWindow.getContentBounds();
  const tabsHeight = 48; // Height of title bar including tabs and window controls
  const navHeight = 48; // Height of navigation bar
  const spacerHeight = 10; // Height of spacer
  const totalTopHeight = tabsHeight + navHeight + spacerHeight;

  tabs.forEach((tab, index) => {
    if (index === currentTabIndex) {
      tab.view.setBounds({
        x: 0,
        y: totalTopHeight,
        width: bounds.width,
        height: bounds.height - totalTopHeight
      });
      tab.view.setAutoResize({ width: true, height: true });
    } else {
      tab.view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
  });
}

function updateTabs() {
  const tabTitles = tabs.map(tab => tab.title);
  mainWindow.webContents.send('update-tabs', tabTitles, currentTabIndex);
}

ipcMain.on('switch-tab', (event, index) => {
  if (index < 0 || index >= tabs.length) return;
  currentTabIndex = index;
  mainWindow.setBrowserView(tabs[currentTabIndex].view);
  updateTabBounds();
  updateTabs();
});

ipcMain.on('new-tab', (event, url) => {
  createTab(url);
});

ipcMain.on('close-tab', (event, index) => {
  if (index < 0 || index >= tabs.length) return;
  const tab = tabs[index].view;
  tab.webContents.destroy();
  tabs.splice(index, 1);
  currentTabIndex = Math.min(currentTabIndex, tabs.length - 1);
  if (tabs.length > 0) {
    mainWindow.setBrowserView(tabs[currentTabIndex].view);
  } else {
    mainWindow.setBrowserView(null);
  }
  updateTabBounds();
  updateTabs();
});

ipcMain.on('navigate', (event, action, url) => {
  const currentTab = tabs[currentTabIndex].view;
  if (!currentTab) return;
  switch (action) {
    case 'back':
      if (currentTab.webContents.canGoBack()) {
        currentTab.webContents.goBack();
      }
      break;
    case 'forward':
      if (currentTab.webContents.canGoForward()) {
        currentTab.webContents.goForward();
      }
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

ipcMain.on('open-settings', () => {
  createTab(`file://${__dirname}/src/settings.html`);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('new-window', () => {
  createWindow();
});