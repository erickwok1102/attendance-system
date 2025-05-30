    async loadStudents() {
        try {
            this.students = this.dataManager.getStudents();
            return this.students;
        } catch (error) {
            console.error('載入學員失敗:', error);
            throw error;
        }
    }

    getStudentsByClass(classId) {
        return this.students.filter(student => student.class === classId);
    }

    async addStudent(studentData) {
        try {
            // 驗證必要欄位
            if (!studentData.name || !studentData.className) {
                throw new Error('姓名和班別為必填欄位');
            }

            // 檢查是否已存在相同姓名的學員
            const existingStudent = this.students.find(s => 
                s.name === studentData.name && this.dataManager.getClassName(s.class) === studentData.className
            );
            
            if (existingStudent) {
                throw new Error('該班別中已存在同名學員');
            }

            // 找到對應的classId
            const classId = this.getClassIdByName(studentData.className);
            if (!classId) {
                throw new Error('找不到對應的班別');
            }

            // 創建學員對象
            const studentForDataManager = {
                name: studentData.name.trim(),
                class: classId,
                phone: studentData.phone || '',
                email: studentData.email || '',
                emergencyContactName: studentData.emergencyContact || '',
                emergencyContactPhone: studentData.emergencyPhone || '',
                notes: studentData.notes || ''
            };

            // 保存到數據管理器
            const student = this.dataManager.addStudent(studentForDataManager);
            
            if (student) {
                // 轉換為統一格式
                const formattedStudent = {
                    ...student,
                    className: studentData.className,
                    classId: classId,
                    emergencyContact: student.emergencyContactName,
                    emergencyPhone: student.emergencyContactPhone
                };
                
                this.students.push(formattedStudent);
                return formattedStudent;
            } else {
                throw new Error('保存學員失敗');
            }
        } catch (error) {
            console.error('新增學員失敗:', error);
            throw error;
        }
    }

    async deleteStudent(studentId) {
        try {
            const studentIndex = this.students.findIndex(s => s.id === studentId);
            
            if (studentIndex === -1) {
                throw new Error('找不到指定學員');
            }

            // 檢查是否有相關的點名記錄
            const attendanceRecords = this.dataManager.getAttendance().filter(a => a.studentId === studentId);
            
            if (attendanceRecords.length > 0) {
                const confirmDelete = confirm(
                    `該學員有 ${attendanceRecords.length} 筆點名記錄，刪除學員將同時刪除所有相關記錄。確定要繼續嗎？`
                );
                
                if (!confirmDelete) {
                    return false;
                }
            }

            // 從數據管理器中刪除
            this.dataManager.deleteStudent(studentId);
            this.students.splice(studentIndex, 1);
            return true;
        } catch (error) {
            console.error('刪除學員失敗:', error);
            throw error;
        }
    }

    getClassIdByName(className) {
        const classes = this.dataManager.classDefinitions;
        for (const [id, classData] of Object.entries(classes)) {
            if (classData.name === className) {
                return id;
            }
        }
        return null;
    }
