// 興趣班學員管理系統 - 主應用程式控制器

// 全局管理器實例
let studentManager;
let classManager;
let attendanceManager;
let statisticsManager;

// 應用程式初始化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('開始初始化應用程式...');
        
        // 初始化數據管理器
        console.log('初始化數據管理器...');
        await dataManager.init();
        console.log('數據管理器初始化完成');
        
        // 初始化各個管理器
        console.log('創建管理器實例...');
        studentManager = new StudentManager(dataManager);
        classManager = new ClassManager(dataManager);
        attendanceManager = new AttendanceManager(dataManager);
        statisticsManager = new StatisticsManager(dataManager);
        console.log('管理器實例創建完成');
        
        // 載入初始數據
        console.log('載入初始數據...');
        await studentManager.loadStudents();
        await classManager.loadClasses();
        attendanceManager.init();
        console.log('初始數據載入完成');
        
        // 創建主應用程式實例
        console.log('創建主應用程式實例...');
        window.app = new App();
        await window.app.init();
        console.log('主應用程式實例創建完成');
        
        console.log('✅ 應用程式初始化完成');
        
    } catch (error) {
        console.error('❌ 應用程式初始化失敗:', error);
        alert('系統初始化失敗，請重新整理頁面。錯誤: ' + error.message);
    }
});

// 主應用程式控制器
class App {
    constructor() {
        this.dataManager = dataManager;
        this.studentManager = studentManager;
        this.classManager = classManager;
        this.attendanceManager = attendanceManager;
        this.statisticsManager = statisticsManager;
        
        this.currentTab = 'students';
        this.isMobileMenuOpen = false;
        this.isLoading = false;
        
        // 不在構造函數中調用init，由外部調用
    }

    async init() {
        try {
            // 設置事件監聽器
            this.setupEventListeners();
            
            // 初始化UI
            this.initializeUI();
            
            // 載入初始數據
            await this.loadInitialData();
            
            console.log('App類初始化完成');
        } catch (error) {
            console.error('App類初始化失敗:', error);
            this.showToast('應用程式初始化失敗', 'error');
        }
    }

    setupEventListeners() {
        // 窗口大小變化事件
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 鍵盤事件
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // 點擊外部關閉模態框
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    initializeUI() {
        // 設置當前日期
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });

        // 初始化頁面
        this.switchTab('students');
    }

    async loadInitialData() {
        try {
            this.showLoading(true);
            
            // 渲染學員數據（數據已經在外部載入）
            this.renderStudents();
            
            // 渲染課堂數據（數據已經在外部載入）
            this.renderClasses();
            
            // 更新選擇框選項
            this.updateSelectOptions();
            
        } catch (error) {
            console.error('載入初始數據失敗:', error);
            this.showToast('載入數據失敗', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 頁面切換
    switchTab(tabName) {
        // 隱藏所有頁面
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 顯示選中的頁面
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // 更新導航狀態
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        this.currentTab = tabName;
        
        // 關閉移動端菜單
        if (this.isMobileMenuOpen) {
            this.toggleMobileMenu();
        }
        
        // 載入頁面特定數據
        this.loadTabData(tabName);
    }

    async loadTabData(tabName) {
        switch (tabName) {
            case 'students':
                this.renderStudents();
                break;
            case 'classes':
                this.renderClasses();
                break;
            case 'attendance':
                this.loadAttendanceData();
                break;
            case 'statistics':
                this.loadStatisticsData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    // 移動端菜單切換
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        if (this.isMobileMenuOpen) {
            sidebar.classList.add('show');
        } else {
            sidebar.classList.remove('show');
        }
    }

    // 學員管理
    renderStudents() {
        const studentGrid = document.getElementById('studentGrid');
        const students = this.studentManager.getAllStudents();
        
        if (students.length === 0) {
            studentGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users fa-3x"></i>
                    <h3>還沒有學員</h3>
                    <p>點擊上方的「新增學員」按鈕來添加第一個學員</p>
                </div>
            `;
            return;
        }
        
        studentGrid.innerHTML = students.map(student => `
            <div class="student-card">
                <div class="student-header">
                    <div class="student-name">${student.name}</div>
                    <div class="student-class">${student.className || '未分班'}</div>
                </div>
                <div class="student-info">
                    ${student.phone ? `
                        <div class="student-info-item">
                            <i class="fas fa-phone"></i>
                            <span>${student.phone}</span>
                        </div>
                    ` : ''}
                    ${student.email ? `
                        <div class="student-info-item">
                            <i class="fas fa-envelope"></i>
                            <span>${student.email}</span>
                        </div>
                    ` : ''}
                    ${student.emergencyContact ? `
                        <div class="student-info-item">
                            <i class="fas fa-user-shield"></i>
                            <span>${student.emergencyContact}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="student-actions">
                    <button class="btn btn-secondary" onclick="app.editStudent('${student.id}')">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="btn btn-danger" onclick="app.deleteStudent('${student.id}')">
                        <i class="fas fa-trash"></i> 刪除
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 課堂管理
    renderClasses() {
        const classList = document.getElementById('classList');
        const classes = this.classManager.getAllClasses();
        
        if (classes.length === 0) {
            classList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chalkboard-teacher fa-3x"></i>
                    <h3>還沒有課堂</h3>
                    <p>點擊上方的「新增班組」按鈕來創建第一個課堂</p>
                </div>
            `;
            return;
        }
        
        classList.innerHTML = classes.map(classItem => `
            <div class="class-item">
                <div class="class-header">
                    <div class="class-name">${classItem.name}</div>
                </div>
                <div class="class-schedule-info">
                    <div class="time-badge">${classItem.startTime} - ${classItem.endTime}</div>
                    <div class="day-badge">${this.getDayName(classItem.dayOfWeek)}</div>
                </div>
                ${classItem.description ? `
                    <div class="class-description">
                        <p>${classItem.description}</p>
                    </div>
                ` : ''}
                <div class="class-actions-buttons">
                    <button class="btn btn-secondary" onclick="app.editClass('${classItem.id}')">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="btn btn-info" onclick="app.manageClassStudents('${classItem.id}')">
                        <i class="fas fa-users"></i> 管理學員
                    </button>
                    <button class="btn btn-danger" onclick="app.deleteClass('${classItem.id}')">
                        <i class="fas fa-trash"></i> 刪除
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 點名系統
    loadAttendanceData() {
        this.updateSelectOptions();
    }

    async loadAttendanceList() {
        const classId = document.getElementById('attendanceClass').value;
        const date = document.getElementById('attendanceDate').value;
        
        if (!classId || !date) {
            document.getElementById('attendanceList').innerHTML = '';
            document.getElementById('attendanceSummary').style.display = 'none';
            document.getElementById('attendanceActions').style.display = 'none';
            return;
        }
        
        try {
            const students = this.studentManager.getStudentsByClass(classId);
            const attendance = await this.attendanceManager.getAttendance(classId, date);
            
            this.renderAttendanceList(students, attendance);
            this.updateAttendanceSummary(students, attendance);
            
            document.getElementById('attendanceSummary').style.display = 'block';
            document.getElementById('attendanceActions').style.display = 'block';
            
        } catch (error) {
            console.error('載入點名列表失敗:', error);
            this.showToast('載入點名列表失敗', 'error');
        }
    }

    renderAttendanceList(students, attendance) {
        const attendanceList = document.getElementById('attendanceList');
        
        attendanceList.innerHTML = students.map(student => {
            const studentAttendance = attendance.find(a => a.studentId === student.id);
            const status = studentAttendance ? studentAttendance.status : null;
            
            return `
                <div class="attendance-item">
                    <div class="student-attendance-info">
                        <div class="attendance-avatar">
                            ${student.name.charAt(0)}
                        </div>
                        <div>
                            <div class="student-name">${student.name}</div>
                            <div class="student-class">${student.className}</div>
                        </div>
                    </div>
                    <div class="attendance-toggle">
                        <button class="attendance-btn present ${status === 'present' ? 'active' : ''}" 
                                onclick="app.setAttendanceStatus('${student.id}', 'present')">
                            <i class="fas fa-check"></i> 出席
                        </button>
                        <button class="attendance-btn absent ${status === 'absent' ? 'active' : ''}" 
                                onclick="app.setAttendanceStatus('${student.id}', 'absent')">
                            <i class="fas fa-times"></i> 缺席
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateAttendanceSummary(students, attendance) {
        const total = students.length;
        const present = attendance.filter(a => a.status === 'present').length;
        const absent = attendance.filter(a => a.status === 'absent').length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;
        
        document.getElementById('totalStudents').textContent = total;
        document.getElementById('presentCount').textContent = present;
        document.getElementById('absentCount').textContent = absent;
        document.getElementById('attendanceRate').textContent = `${rate}%`;
    }

    setAttendanceStatus(studentId, status) {
        const classId = document.getElementById('attendanceClass').value;
        const date = document.getElementById('attendanceDate').value;
        
        this.attendanceManager.setAttendanceStatus(studentId, classId, date, status);
        
        // 更新UI
        const buttons = document.querySelectorAll(`[onclick*="${studentId}"]`);
        buttons.forEach(btn => btn.classList.remove('active'));
        
        const activeButton = document.querySelector(`[onclick="app.setAttendanceStatus('${studentId}', '${status}')"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // 重新載入數據以更新統計
        this.loadAttendanceList();
    }

    async saveAttendance() {
        try {
            await this.attendanceManager.saveAttendance();
            this.showToast('點名記錄已保存', 'success');
        } catch (error) {
            console.error('保存點名記錄失敗:', error);
            this.showToast('保存點名記錄失敗', 'error');
        }
    }

    // 統計報表
    loadStatisticsData() {
        this.updateSelectOptions();
    }

    async generateStats() {
        const classId = document.getElementById('statsClass').value;
        const startDate = document.getElementById('statsStartDate').value;
        const endDate = document.getElementById('statsEndDate').value;
        
        try {
            this.showLoading(true);
            
            const stats = await this.statisticsManager.generateStatistics({
                classId,
                startDate,
                endDate
            });
            
            this.renderStatistics(stats);
            
        } catch (error) {
            console.error('生成統計報表失敗:', error);
            this.showToast('生成統計報表失敗', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderStatistics(stats) {
        const statsOverview = document.getElementById('statsOverview');
        
        statsOverview.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.totalStudents}</div>
                <div class="stat-label">總學員數</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalClasses}</div>
                <div class="stat-label">總課堂數</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.averageAttendance}%</div>
                <div class="stat-label">平均出席率</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalAttendance}</div>
                <div class="stat-label">總出席次數</div>
            </div>
        `;
    }

    // 系統設定
    loadSettingsData() {
        const sheetId = localStorage.getItem('googleSheetId') || '';
        const apiKey = localStorage.getItem('googleApiKey') || '';
        
        document.getElementById('sheetId').value = sheetId;
        document.getElementById('apiKey').value = apiKey;
    }

    async testConnection() {
        const sheetId = document.getElementById('sheetId').value;
        const apiKey = document.getElementById('apiKey').value;
        
        if (!sheetId || !apiKey) {
            this.showToast('請輸入 Sheet ID 和 API Key', 'warning');
            return;
        }
        
        try {
            this.showLoading(true);
            
            // 保存設定
            localStorage.setItem('googleSheetId', sheetId);
            localStorage.setItem('googleApiKey', apiKey);
            
            // 測試連接
            await this.dataManager.testGoogleSheetsConnection(sheetId, apiKey);
            
            this.showToast('連接測試成功', 'success');
            
        } catch (error) {
            console.error('連接測試失敗:', error);
            this.showToast('連接測試失敗', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 模態框管理
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
            
            // 聚焦到第一個輸入框
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    // 學員相關操作
    showAddStudentModal() {
        this.clearStudentForm();
        this.updateSelectOptions();
        this.showModal('addStudentModal');
    }

    clearStudentForm() {
        document.getElementById('studentForm').reset();
    }

    async saveStudent() {
        const formData = {
            name: document.getElementById('studentName').value,
            className: document.getElementById('studentClass').value,
            phone: document.getElementById('studentPhone').value,
            email: document.getElementById('studentEmail').value,
            emergencyContact: document.getElementById('emergencyContact').value,
            emergencyPhone: document.getElementById('emergencyPhone').value,
            notes: document.getElementById('studentNotes').value
        };
        
        if (!formData.name || !formData.className) {
            this.showToast('請填寫必要欄位', 'warning');
            return;
        }
        
        try {
            await this.studentManager.addStudent(formData);
            this.renderStudents();
            this.closeModal('addStudentModal');
            this.showToast('學員已新增', 'success');
        } catch (error) {
            console.error('新增學員失敗:', error);
            this.showToast('新增學員失敗', 'error');
        }
    }

    // 課堂相關操作
    showAddClassModal() {
        this.clearClassForm();
        this.showModal('addClassModal');
    }

    clearClassForm() {
        document.getElementById('classForm').reset();
    }

    async saveClass() {
        const formData = {
            name: document.getElementById('className').value,
            startTime: document.getElementById('classStartTime').value,
            endTime: document.getElementById('classEndTime').value,
            dayOfWeek: document.getElementById('classDayOfWeek').value,
            description: document.getElementById('classDescription').value
        };
        
        if (!formData.name || !formData.startTime || !formData.endTime || !formData.dayOfWeek) {
            this.showToast('請填寫必要欄位', 'warning');
            return;
        }
        
        try {
            await this.classManager.addClass(formData);
            this.renderClasses();
            this.updateSelectOptions();
            this.closeModal('addClassModal');
            this.showToast('課堂已新增', 'success');
        } catch (error) {
            console.error('新增課堂失敗:', error);
            this.showToast('新增課堂失敗', 'error');
        }
    }

    // 搜尋功能
    filterStudents() {
        const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
        const studentCards = document.querySelectorAll('.student-card');
        
        studentCards.forEach(card => {
            const name = card.querySelector('.student-name').textContent.toLowerCase();
            const className = card.querySelector('.student-class').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || className.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // 工具函數
    updateSelectOptions() {
        const classes = this.classManager.getAllClasses();
        
        // 更新所有班別選擇框
        const classSelects = document.querySelectorAll('#studentClass, #attendanceClass, #statsClass');
        classSelects.forEach(select => {
            const currentValue = select.value;
            const isRequired = select.hasAttribute('required');
            
            select.innerHTML = isRequired ? '<option value="">請選擇班別</option>' : '<option value="">所有班別</option>';
            
            classes.forEach(classItem => {
                const option = document.createElement('option');
                option.value = classItem.id;
                option.textContent = classItem.name;
                select.appendChild(option);
            });
            
            select.value = currentValue;
        });
    }

    getDayName(dayOfWeek) {
        const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return days[parseInt(dayOfWeek)] || '';
    }

    // UI 反饋
    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (show) {
            loadingIndicator.classList.add('show');
        } else {
            loadingIndicator.classList.remove('show');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            this.hideToast();
        }, 3000);
    }

    hideToast() {
        const toast = document.getElementById('toast');
        toast.classList.remove('show');
    }

    // 事件處理
    handleResize() {
        if (window.innerWidth > 768 && this.isMobileMenuOpen) {
            this.toggleMobileMenu();
        }
    }

    handleKeydown(e) {
        // ESC 鍵關閉模態框
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                this.closeModal(openModal.id);
            }
        }
    }

    // 數據管理
    async exportData() {
        try {
            const data = await this.dataManager.exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-system-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('數據已匯出', 'success');
        } catch (error) {
            console.error('匯出數據失敗:', error);
            this.showToast('匯出數據失敗', 'error');
        }
    }

    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                await this.dataManager.importAllData(data);
                await this.loadInitialData();
                
                this.showToast('數據已匯入', 'success');
            } catch (error) {
                console.error('匯入數據失敗:', error);
                this.showToast('匯入數據失敗', 'error');
            }
        };
        
        input.click();
    }

    async clearAllData() {
        if (confirm('確定要清除所有數據嗎？此操作無法復原。')) {
            try {
                await this.dataManager.clearAllData();
                await this.loadInitialData();
                this.showToast('所有數據已清除', 'success');
            } catch (error) {
                console.error('清除數據失敗:', error);
                this.showToast('清除數據失敗', 'error');
            }
        }
    }
}

// 全局函數 - 為了與HTML事件處理器兼容
function switchTab(tabName) {
    if (window.app) {
        app.switchTab(tabName);
    }
}

function toggleMobileMenu() {
    if (window.app) {
        app.toggleMobileMenu();
    }
}

function showAddStudentModal() {
    if (window.app) {
        app.showAddStudentModal();
    }
}

function showAddClassModal() {
    if (window.app) {
        app.showAddClassModal();
    }
}

function closeModal(modalId) {
    if (window.app) {
        app.closeModal(modalId);
    }
}

function saveStudent() {
    if (window.app) {
        app.saveStudent();
    }
}

function saveClass() {
    if (window.app) {
        app.saveClass();
    }
}

function filterStudents() {
    if (window.app) {
        app.filterStudents();
    }
}

function loadAttendanceList() {
    if (window.app) {
        app.loadAttendanceList();
    }
}

function saveAttendance() {
    if (window.app) {
        app.saveAttendance();
    }
}

function generateStats() {
    if (window.app) {
        app.generateStats();
    }
}

function exportData() {
    if (window.app) {
        app.exportData();
    }
}

function importData() {
    if (window.app) {
        app.importData();
    }
}

function clearAllData() {
    if (window.app) {
        app.clearAllData();
    }
}

function testConnection() {
    if (window.app) {
        app.testConnection();
    }
}

function hideToast() {
    if (window.app) {
        app.hideToast();
    }
}

// 防止表單提交時頁面刷新
document.addEventListener('submit', (e) => {
    e.preventDefault();
}); 