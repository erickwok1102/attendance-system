// 點名管理模組
class AttendanceManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    // 初始化點名管理
    init() {
        this.loadClassDates();
    }

    // 載入課堂日期選項
    loadClassDates() {
        const classId = document.getElementById('attendanceClass').value;
        const dateSelect = document.getElementById('attendanceDate');
        
        // 獲取該班級的所有課堂日期
        const classDates = this.dataManager.getClassDates(classId);
        
        dateSelect.innerHTML = '<option value="">請選擇日期</option>';
        classDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date + (date === new Date().toISOString().split('T')[0] ? ' (今日)' : '');
            dateSelect.appendChild(option);
        });
        
        // 自動選擇今日如果有課
        const today = new Date().toISOString().split('T')[0];
        if (classDates.includes(today)) {
            dateSelect.value = today;
            this.loadAttendance();
        }
    }

    // 載入點名列表
    loadAttendance() {
        const date = document.getElementById('attendanceDate').value;
        const classId = document.getElementById('attendanceClass').value;
        
        if (!date) {
            document.getElementById('attendanceList').innerHTML = '<p>請選擇課堂日期</p>';
            this.updateStats(0, 0, 0, 0);
            return;
        }

        const classStudents = this.dataManager.getStudents(classId);
        const container = document.getElementById('attendanceList');

        // 更新班級統計
        const stats = this.dataManager.getAttendanceStats(classId, date);
        this.updateStats(stats.total, stats.present, stats.absent, stats.rate);

        if (classStudents.length === 0) {
            container.innerHTML = '<p>此班別暫無學員</p>';
            return;
        }

        container.innerHTML = classStudents.map(student => {
            const status = this.dataManager.getAttendance(student.id, date);
            
            return `
                <div class="attendance-card">
                    <h4>${student.name}</h4>
                    <div class="attendance-status">
                        <button class="btn ${status === 'present' ? 'status-present' : ''}" 
                                onclick="attendanceManager.markAttendance('${student.id}', '${date}', 'present')">
                            出席
                        </button>
                        <button class="btn ${status === 'absent' ? 'status-absent' : ''}" 
                                onclick="attendanceManager.markAttendance('${student.id}', '${date}', 'absent')">
                            缺席
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 標記出席
    markAttendance(studentId, date, status) {
        this.dataManager.markAttendance(studentId, date, status);
        this.loadAttendance(); // 重新載入以更新統計
    }

    // 更新統計顯示
    updateStats(total, present, absent, rate) {
        document.getElementById('classStudentCount').textContent = total;
        document.getElementById('todayPresent').textContent = present;
        document.getElementById('todayAbsent').textContent = absent;
        document.getElementById('attendanceRate').textContent = rate + '%';
    }
}

// 全局函數
function loadClassDates() {
    attendanceManager.loadClassDates();
}

function loadAttendance() {
    attendanceManager.loadAttendance();
}

function markAttendance(studentId, date, status) {
    attendanceManager.markAttendance(studentId, date, status);
} 
