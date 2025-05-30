function switchTab(tabId) {
    // 隱藏所有section
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // 顯示選中的section
    document.getElementById(tabId).style.display = 'block';
    
    // 更新menu item的active狀態
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[onclick="switchTab('${tabId}')"]`).classList.add('active');
}

// 初始化時顯示第一個tab
window.onload = () => {
    const app = new App();
    switchTab('class-management');
};
