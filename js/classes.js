// 課堂管理模組
class ClassManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    // 初始化課堂管理
    init() {
        this.setupEventListeners();
        this.loadUpcomingClasses();
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 班組表單提交
        document.getElementById('classForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addClass();
        });
    }

    // 新增班組
    addClass() {
        const classData = {
            name: document.getElementById('className').value,
            startTime: document.getElementById('classStartTime').value,
            endTime: document.getElementById('classEndTime').value,
            dayOfWeek: parseInt(document.getElementById('classDayOfWeek').value),
            frequency: document.getElementById('classFrequency').value,
            maxStudents: parseInt(document.getElementById('classMaxStudents').value)
        };

        if (!classData.name || !classData.startTime || !classData.endTime) {
            alert('請填寫必填欄位');
            return;
        }

        const classId = this.dataManager.addClass(classData);
        this.closeModal('addClassModal');
        alert('班組新增成功！');
        location.reload(); // 重新載入頁面更新選項
    }

    // 刪除班組
    deleteClass(classId) {
        const className = this.dataManager.getClassName(classId);
        if (confirm(`確定要刪除 ${className} 嗎？這會同時刪除所有相關數據。`)) {
            this.dataManager.deleteClass(classId);
            alert('班組已刪除！');
            location.reload();
        }
    }

    // 管理班組
    manageClass(classId) {
        const className = this.dataManager.getClassName(classId);
        const classStudents = this.dataManager.getStudents(classId);
        
        alert(`${className}管理\n\n目前學員數: ${classStudents.length}\n學員名單: ${classStudents.map(s => s.name).join(', ') || '暫無學員'}`);
    }

    // 新增課堂日期
    addClassDate() {
        const classData = {
            date: document.getElementById('classDate').value,
            classId: document.getElementById('classSelect').value,
            specialTime: document.getElementById('specialTime').value,
            remarks: document.getElementById('classRemarks').value
        };
        
        if (!classData.date) {
            alert('請選擇日期');
            return;
        }

        const success = this.dataManager.addClassDate(classData);
        if (success) {
            this.loadUpcomingClasses();
            alert('課堂日期新增成功！');
            this.clearClassForm();
        } else {
            alert('此日期已有課堂安排');
        }
    }

    // 生成本月課堂
    generateWeeklyClasses() {
        const classId = document.getElementById('classSelect').value;
        const classDef = this.dataManager.classDefinitions[classId];
        
        if (!classDef) {
            alert('找不到班級設定');
            return;
        }
        
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const dates = this.dataManager.generateClassSchedule(classId, startDate, endDate);
        
        this.loadUpcomingClasses();
        alert(`成功生成本月 ${dates.length} 個課堂！`);
    }

    // 生成週期課堂
    generateClassSchedule() {
        const classId = document.getElementById('scheduleClass').value;
        const startDate = new Date(document.getElementById('scheduleStartDate').value);
        const endDate = new Date(document.getElementById('scheduleEndDate').value);
        
        if (!startDate || !endDate) {
            alert('請選擇開始和結束日期');
            return;
        }
        
        const dates = this.dataManager.generateClassSchedule(classId, startDate, endDate);
        
        this.closeModal('scheduleModal');
        this.loadUpcomingClasses();
        alert(`成功生成 ${dates.length} 個課堂！`);
    }

    // 載入即將到來的課堂
    loadUpcomingClasses() {
        const container = document.getElementById('upcomingClassesList');
        const upcoming = this.dataManager.getUpcomingClasses();
        
        if (upcoming.length === 0) {
            container.innerHTML = '<p>暫無即將到來的課堂</p>';
            return;
        }
        
        container.innerHTML = upcoming.map(cls => `
            <div class="schedule-item">
                <div>
                    <strong>${this.dataManager.getClassName(cls.classId)}</strong><br>
                    <span class="class-badge">${cls.date}</span>
                    ${cls.specialTime ? `<span class="class-badge">${cls.specialTime}</span>` : ''}
                    ${cls.remarks ? `<br><small>${cls.remarks}</small>` : ''}
                </div>
                <button class="btn btn-danger" onclick="classManager.deleteClassDate('${cls.date}', '${cls.classId}')">取消</button>
            </div>
        `).join('');
    }

    // 刪除特定課堂日期
    deleteClassDate(date, classId) {
        if (confirm('確定要取消這個課堂嗎？')) {
            this.dataManager.deleteClassDate(date, classId);
            this.loadUpcomingClasses();
        }
    }

    // 清空課堂表單
    clearClassForm() {
        document.getElementById('classDate').value = '';
        document.getElementById('specialTime').value = '';
        document.getElementById('classRemarks').value = '';
    }

    // 關閉 Modal
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        if (modalId === 'addClassModal') {
            document.getElementById('classForm').reset();
        }
    }
}

// 全局函數
function manageClass(classId) {
    classManager.manageClass(classId);
}

function deleteClass(classId) {
    classManager.deleteClass(classId);
}

function addClassDate() {
    classManager.addClassDate();
}

function generateWeeklyClasses() {
    classManager.generateWeeklyClasses();
}

function generateClassSchedule() {
    classManager.generateClassSchedule();
} 
