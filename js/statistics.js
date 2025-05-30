// 統計管理模組
class StatisticsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    // 初始化統計管理
    init() {
        this.loadStudentFilters();
        this.setDefaultDates();
        this.updateStatistics();
    }

    // 載入學員篩選選項
    loadStudentFilters() {
        const select = document.getElementById('statsStudentFilter');
        select.innerHTML = '<option value="">所有學員</option>';
        
        const students = this.dataManager.getStudents();
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${this.dataManager.getClassName(student.class)})`;
            select.appendChild(option);
        });
    }

    // 設定預設日期
    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        document.getElementById('statsStartDate').value = oneMonthAgo.toISOString().split('T')[0];
        document.getElementById('statsEndDate').value = today;
    }

    // 更新統計
    updateStatistics() {
        const startDate = document.getElementById('statsStartDate').value;
        const endDate = document.getElementById('statsEndDate').value;
        const classFilter = document.getElementById('statsClassFilter').value;
        const studentFilter = document.getElementById('statsStudentFilter').value;
        
        // 篩選學員
        let filteredStudents = this.dataManager.getStudents();
        if (classFilter) {
            filteredStudents = filteredStudents.filter(s => s.class === classFilter);
        }
        if (studentFilter) {
            filteredStudents = filteredStudents.filter(s => s.id === studentFilter);
        }
        
        // 篩選出席記錄
        const filteredAttendance = this.dataManager.getFilteredAttendance(
            startDate, endDate, classFilter, studentFilter
        );
        
        // 計算統計數據
        const totalStudents = filteredStudents.length;
        const presentRecords = filteredAttendance.filter(key => 
            this.dataManager.attendance[key] === 'present'
        ).length;
        const totalRecords = filteredAttendance.length;
        const avgRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
        
        // 更新顯示
        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('periodAttendance').textContent = presentRecords;
        document.getElementById('avgAttendance').textContent = avgRate + '%';
        document.getElementById('totalClasses').textContent = new Set(
            filteredAttendance.map(key => key.split('_')[0])
        ).size;
        
        // 更新學員詳細統計
        this.updateStudentStats(filteredStudents, startDate, endDate);
        
        // 更新圖表
        this.drawAttendanceChart(filteredAttendance);
    }

    // 更新學員詳細統計
    updateStudentStats(filteredStudents, startDate, endDate) {
        const container = document.getElementById('studentStatsList');
        
        if (filteredStudents.length === 0) {
            container.innerHTML = '<p>無符合條件的學員</p>';
            return;
        }
        
        const statsHtml = filteredStudents.map(student => {
            const stats = this.dataManager.getStudentStats(student.id, startDate, endDate);
            
            return `
                <div class="student-card">
                    <div class="student-header">
                        <div>
                            <span class="student-name">${student.name}</span>
                            <span class="class-badge">${this.dataManager.getClassName(student.class)}</span>
                        </div>
                        <div>
                            <span class="class-badge">${stats.rate}% 出席率</span>
                        </div>
                    </div>
                    <div>
                        <strong>出席記錄：</strong> ${stats.present}/${stats.total} 堂課<br>
                        <strong>加入日期：</strong> ${student.joinDate}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = statsHtml;
    }

    // 繪製出席率圖表
    drawAttendanceChart(attendanceData) {
        const canvas = document.getElementById('attendanceChart');
        const ctx = canvas.getContext('2d');
        
        // 清除畫布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (attendanceData.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('暫無數據', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // 按日期分組統計
        const dateStats = {};
        attendanceData.forEach(key => {
            const [date] = key.split('_');
            if (!dateStats[date]) {
                dateStats[date] = { present: 0, absent: 0 };
            }
            if (this.dataManager.attendance[key] === 'present') {
                dateStats[date].present++;
            } else if (this.dataManager.attendance[key] === 'absent') {
                dateStats[date].absent++;
            }
        });
        
        const dates = Object.keys(dateStats).sort().slice(-10); // 最近10天
        
        if (dates.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('暫無數據', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const maxValue = Math.max(...dates.map(date => 
            dateStats[date].present + dateStats[date].absent
        ));
        
        const barWidth = canvas.width / dates.length * 0.8;
        const barSpacing = canvas.width / dates.length * 0.2;
        
        dates.forEach((date, index) => {
            const stats = dateStats[date];
            const presentHeight = (stats.present / maxValue) * (canvas.height - 60);
            const absentHeight = (stats.absent / maxValue) * (canvas.height - 60);
            
            const x = index * (barWidth + barSpacing) + barSpacing;
            
            // 繪製出席條
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(x, canvas.height - 30 - presentHeight, barWidth / 2, presentHeight);
            
            // 繪製缺席條
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(x + barWidth / 2, canvas.height - 30 - absentHeight, barWidth / 2, absentHeight);
            
            // 繪製日期標籤
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.save();
            ctx.translate(x + barWidth / 2, canvas.height - 5);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(date.slice(-5), 0, 0);
            ctx.restore();
        });
        
        // 圖例
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(10, 10, 15, 15);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('出席', 30, 22);
        
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(80, 10, 15, 15);
        ctx.fillStyle = '#333';
        ctx.fillText('缺席', 100, 22);
    }
}

// 全局函數
function updateStatistics() {
    statisticsManager.updateStatistics();
} 
