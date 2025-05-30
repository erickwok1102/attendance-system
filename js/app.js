// 主應用程序
class App {
    constructor() {
        this.dataManager = new DataManager();
        this.init();
    }

    async init() {
        try {
            const data = await this.dataManager.getData();
            console.log('Data loaded:', data);
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }
}

// 啟動應用
window.onload = () => {
    const app = new App();
};
