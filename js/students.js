// 學員管理模組
class StudentManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentEditingId = null;
    }

    // 初始化學員管理
    init() {
        this.setupEventListeners();
        this.loadStudents();
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 學員表單提交
        document.getElementById('studentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.currentEditingId) {
                this.updateStudent();
            } else {
                this.addStudent();
            }
        });
    }

    // 新增學員
    addStudent() {
        const studentData = this.getFormData();
        
        if (!studentData.name || !studentData.class) {
            alert('請填寫必填欄位');
            return;
        }

        const student = this.dataManager.addStudent(studentData);
        this.loadStudents();
        this.closeModal();
        alert('學員新增成功！');
    }

    // 更新學員
    updateStudent() {
        const studentData = this.getFormData();
        
        if (!studentData.name || !studentData.class) {
            alert('請填寫必填欄位');
            return;
        }

        const updated = this.dataManager.updateStudent(this.currentEditingId, studentData);
        if (updated) {
            this.loadStudents();
            this.closeModal();
            this.resetForm();
            alert('學員資料更新成功！');
        }
    }

    // 編輯學員
    editStudent(studentId) {
        const student = this.dataManager.getStudent(studentId);
        if (!student) return;
        
        this.currentEditingId = studentId;
        this.fillForm(student);
        
        // 修改表單標題和按鈕
        document.querySelector('#addStudentModal h3').textContent = '編輯學員';
        document.querySelector('#addStudentModal .btn-primary').textContent = '更新學員';
        
        this.showModal();
    }

    // 刪除學員
    deleteStudent(studentId) {
        const student = this.dataManager.getStudent(studentId);
        if (!student) return;

        if (confirm(`確定要刪除學員 ${student.name} 嗎？`)) {
            this.dataManager.deleteStudent(studentId);
            this.loadStudents();
            alert('學員已刪除！');
        }
    }

    // 載入學員列表
    loadStudents() {
        const container = document.getElementById('studentsList');
        const students = this.dataManager.getStudents();
        
        if (students.length === 0) {
            container.innerHTML = '<p>暫無學員資料</p>';
            return;
        }

        container.innerHTML = students.map(student => `
            <div class="student-card">
                <div class="student-header">
                    <div>
                        <span class="student-name">${student.name}</span>
                        <span class="class-badge">${this.dataManager.getClassName(student.class)}</span>
                    </div>
                    <div>
                        <button class="btn btn-secondary" onclick="studentManager.editStudent('${student.id}')">編輯</button>
                        <button class="btn btn-danger" onclick="studentManager.deleteStudent('${student.id}')">刪除</button>
                    </div>
                </div>
                <div>
                    <strong>聯絡資料：</strong> ${student.email || '未填寫'} | ${student.phone || '未填寫'}<br>
                    <strong>緊急聯絡人：</strong> ${student.emergencyContactName || '未填寫'} (${student.emergencyContactPhone || '未填寫'})<br>
                    <strong>加入日期：</strong> ${student.joinDate}
                </div>
            </div>
        `).join('');
    }

    // 獲取表單數據
    getFormData() {
        return {
            name: document.getElementById('studentName').value,
            class: document.getElementById('studentClass').value,
            birthDate: document.getElementById('studentBirthDate').value,
            gender: document.getElementById('studentGender').value,
            email: document.getElementById('studentEmail').value,
            phone: document.getElementById('studentPhone').value,
            emergencyContactName: document.getElementById('emergencyContactName').value,
            emergencyContactPhone: document.getElementById('emergencyContactPhone').value
        };
    }

    // 填充表單
    fillForm(student) {
        document.getElementById('studentName').value = student.name || '';
        document.getElementById('studentClass').value = student.class || '';
        document.getElementById('studentBirthDate').value = student.birthDate || '';
        document.getElementById('studentGender').value = student.gender || '';
        document.getElementById('studentEmail').value = student.email || '';
        document.getElementById('studentPhone').value = student.phone || '';
        document.getElementById('emergencyContactName').value = student.emergencyContactName || '';
        document.getElementById('emergencyContactPhone').value = student.emergencyContactPhone || '';
    }

    // 重置表單
    resetForm() {
        document.getElementById('studentForm').reset();
        document.querySelector('#addStudentModal h3').textContent = '新增學員';
        document.querySelector('#addStudentModal .btn-primary').textContent = '新增學員';
        this.currentEditingId = null;
    }

    // 顯示 Modal
    showModal() {
        document.getElementById('addStudentModal').style.display = 'block';
    }

    // 關閉 Modal
    closeModal() {
        document.getElementById('addStudentModal').style.display = 'none';
        this.resetForm();
    }

    // 匯出學員資料
    exportStudents() {
        const students = this.dataManager.getStudents();
        const csvContent = "data:text/csv;charset=utf-8," + 
            "姓名,班別,出生日期,性別,電郵,電話,緊急聯絡人,緊急聯絡人電話,加入日期,狀態\n" +
            students.map(s => [
                s.name, 
                this.dataManager.getClassName(s.class), 
                s.birthDate || '', 
                s.gender || '',
                s.email || '', 
                s.phone || '', 
                s.emergencyContactName || '', 
                s.emergencyContactPhone || '', 
                s.joinDate, 
                s.status
            ].join(",")).join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "students.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 全局函數 (為了向後兼容)
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    if (modalId === 'addStudentModal') {
        studentManager.closeModal();
    } else {
        document.getElementById(modalId).style.display = 'none';
    }
}

function exportStudents() {
    studentManager.exportStudents();
} 
