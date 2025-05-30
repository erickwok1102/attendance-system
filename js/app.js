// 興趣班學員管理系統 - 主應用程式控制器

// 全局管理器實例
let studentManager;
let classManager;
let attendanceManager;
let statisticsManager;

// 應用程式初始化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 初始化數據管理器
        await dataManager.init();
        
        // 初始化各個管理器
        studentManager = new StudentManager(dataManager);
        classManager = new ClassManager(dataManager);
        attendanceManager = new AttendanceManager(dataManager);
        statisticsManager = new StatisticsManager(dataManager);
        
        // 載入初始數據
        await studentManager.loadStudents();
        await classManager.loadClasses();
        attendanceManager.init();
        
        console.log('應用程式初始化完成');
        
        // 顯示首頁
        showPage('dashboard');
        updateDashboard();
        
    } catch (error) {
        console.error('應用程式初始化失敗:', error);
        showToast('系統初始化失敗，請重新整理頁面', 'error');
    }
});

// ... existing code ...
