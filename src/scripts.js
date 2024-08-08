const { ipcRenderer } = require('electron');

document.getElementById('newTab').addEventListener('click', () => {
  ipcRenderer.send('new-tab', 'https://www.google.com');
});

ipcRenderer.on('update-tabs', (event, tabTitles, activeIndex) => {
  const tabBar = document.getElementById('tabBar');
  tabBar.innerHTML = '';
  tabTitles.forEach((title, index) => {
    const tab = document.createElement('div');
    tab.classList.add('tab');
    if (index === activeIndex) {
      tab.classList.add('active');
    }
    tab.textContent = title;
    tab.addEventListener('click', () => {
      ipcRenderer.send('switch-tab', index);
    });
    const closeBtn = document.createElement('span');
    closeBtn.classList.add('close-btn');
    closeBtn.innerHTML = '<i class="material-icons">close</i>';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ipcRenderer.send('close-tab', index);
    });
    tab.appendChild(closeBtn);
    tabBar.appendChild(tab);
  });
  const newTab = document.createElement('div');
  newTab.id = 'newTab';
  newTab.classList.add('tab', 'new-tab');
  newTab.innerHTML = '<i class="material-icons">add</i>';
  tabBar.appendChild(newTab);
  newTab.addEventListener('click', () => {
    ipcRenderer.send('new-tab', 'https://www.google.com');
  });
});

document.getElementById('backBtn').addEventListener('click', () => {
  ipcRenderer.send('navigate', 'back');
});

document.getElementById('forwardBtn').addEventListener('click', () => {
  ipcRenderer.send('navigate', 'forward');
});

document.getElementById('refreshBtn').addEventListener('click', () => {
  ipcRenderer.send('navigate', 'refresh');
});

document.getElementById('homeBtn').addEventListener('click', () => {
  ipcRenderer.send('navigate', 'home');
});

document.getElementById('urlBar').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    ipcRenderer.send('navigate', 'go', event.target.value);
  }
});

ipcRenderer.on('update-navigation', (event, { canGoBack, canGoForward, isLoading, url }) => {
  document.getElementById('backBtn').disabled = !canGoBack;
  document.getElementById('forwardBtn').disabled = !canGoForward;
  document.getElementById('refreshBtn').disabled = isLoading;
  document.getElementById('urlBar').value = url || '';
});

document.getElementById('minimizeBtn').addEventListener('click', () => {
  ipcRenderer.send('window-control', 'minimize');
});

document.getElementById('maximizeBtn').addEventListener('click', () => {
  ipcRenderer.send('window-control', 'maximize');
});

document.getElementById('closeBtn').addEventListener('click', () => {
  ipcRenderer.send('window-control', 'close');
});

// Dropdown menu functionality
const dropdownBtn = document.getElementById('moreBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

dropdownBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('show');
});

// Close the dropdown menu if the user clicks outside of it
window.addEventListener('click', (event) => {
  if (!event.target.matches('.navBtn')) {
    if (dropdownMenu.classList.contains('show')) {
      dropdownMenu.classList.remove('show');
    }
  }
});

// Add event listeners for dropdown menu items
document.getElementById('settingsMenuItem').addEventListener('click', () => {
  ipcRenderer.send('open-settings');
  dropdownMenu.classList.remove('show');
});

document.getElementById('downloadsMenuItem').addEventListener('click', () => {
  // Implement downloads functionality
  console.log('Downloads clicked');
  dropdownMenu.classList.remove('show');
});

document.getElementById('newWindowMenuItem').addEventListener('click', () => {
  ipcRenderer.send('new-window');
  dropdownMenu.classList.remove('show');
});

document.getElementById('newTabMenuItem').addEventListener('click', () => {
  ipcRenderer.send('new-tab', 'https://www.google.com');
  dropdownMenu.classList.remove('show');
});

document.getElementById('historyMenuItem').addEventListener('click', () => {
  // Implement history functionality
  console.log('History clicked');
  dropdownMenu.classList.remove('show');
});

document.getElementById('bookmarksMenuItem').addEventListener('click', () => {
  // Implement bookmarks functionality
  console.log('Bookmarks clicked');
  dropdownMenu.classList.remove('show');
});