class Tab {
    constructor(url = 'about:blank') {
        this.url = url;
        this.history = [url];
        this.currentIndex = 0;
    }
}

class Browser {
    constructor() {
        this.tabs = [new Tab()];
        this.activeTabIndex = 0;
        this.setupEventListeners();
        this.renderTabs();
        this.loadActiveTab();
    }

    setupEventListeners() {
        document.getElementById('add-tab').addEventListener('click', () => this.addTab());
        document.getElementById('back').addEventListener('click', () => this.goBack());
        document.getElementById('forward').addEventListener('click', () => this.goForward());
        document.getElementById('refresh').addEventListener('click', () => this.refresh());
        document.getElementById('url-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.navigateTo(e.target.value);
        });
    }

    addTab() {
        this.tabs.push(new Tab());
        this.activeTabIndex = this.tabs.length - 1;
        this.renderTabs();
        this.loadActiveTab();
    }

    closeTab(index) {
        if (this.tabs.length === 1) return;
        this.tabs.splice(index, 1);
        if (this.activeTabIndex >= index) {
            this.activeTabIndex = Math.max(0, this.activeTabIndex - 1);
        }
        this.renderTabs();
        this.loadActiveTab();
    }

    setActiveTab(index) {
        this.activeTabIndex = index;
        this.renderTabs();
        this.loadActiveTab();
    }

    renderTabs() {
        const tabList = document.getElementById('tab-list');
        tabList.innerHTML = '';
        this.tabs.forEach((tab, index) => {
            const tabElement = document.createElement('div');
            tabElement.className = `tab ${index === this.activeTabIndex ? 'active' : ''}`;
            tabElement.textContent = `Tab ${index + 1}`;
            tabElement.addEventListener('click', () => this.setActiveTab(index));
            
            const closeButton = document.createElement('span');
            closeButton.textContent = '×';
            closeButton.style.marginLeft = '5px';
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(index);
            });
            
            tabElement.appendChild(closeButton);
            tabList.appendChild(tabElement);
        });
    }

    loadActiveTab() {
        const activeTab = this.tabs[this.activeTabIndex];
        document.getElementById('url-input').value = activeTab.url;
        document.getElementById('content-frame').src = activeTab.url;
    }

    navigateTo(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        const activeTab = this.tabs[this.activeTabIndex];
        activeTab.history = activeTab.history.slice(0, activeTab.currentIndex + 1);
        activeTab.history.push(url);
        activeTab.currentIndex = activeTab.history.length - 1;
        activeTab.url = url;
        this.loadActiveTab();
    }

    goBack() {
        const activeTab = this.tabs[this.activeTabIndex];
        if (activeTab.currentIndex > 0) {
            activeTab.currentIndex--;
            activeTab.url = activeTab.history[activeTab.currentIndex];
            this.loadActiveTab();
        }
    }

    goForward() {
        const activeTab = this.tabs[this.activeTabIndex];
        if (activeTab.currentIndex < activeTab.history.length - 1) {
            activeTab.currentIndex++;
            activeTab.url = activeTab.history[activeTab.currentIndex];
            this.loadActiveTab();
        }
    }

    refresh() {
        this.loadActiveTab();
    }
}

const browser = new Browser();