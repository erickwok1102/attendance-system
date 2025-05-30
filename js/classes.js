    async loadClasses() {
        try {
            this.classes = this.dataManager.getClasses();
            return this.classes;
        } catch (error) {
            console.error('載入課堂失敗:', error);
            throw error;
        }
    }

    async addClass(classData) {
        try {
            // 驗證必要欄位
            if (!classData.name || !classData.startTime || !classData.endTime || !classData.dayOfWeek) {
                throw new Error('班組名稱、上課時間和上課日期為必填欄位');
            }

            // 檢查班組名稱是否已存在
            const existingClass = this.classes.find(c => c.name === classData.name);
            if (existingClass) {
                throw new Error('班組名稱已存在');
            }

            // 驗證時間格式
            if (!this.isValidTime(classData.startTime) || !this.isValidTime(classData.endTime)) {
                throw new Error('時間格式不正確');
            }

            // 檢查結束時間是否晚於開始時間
            if (classData.startTime >= classData.endTime) {
                throw new Error('結束時間必須晚於開始時間');
            }

            // 檢查時間衝突
            const hasConflict = this.checkTimeConflict(classData);
            if (hasConflict) {
                throw new Error('該時段與其他課堂時間衝突');
            }

            // 創建課堂對象
            const classForDataManager = {
                name: classData.name.trim(),
                startTime: classData.startTime,
                endTime: classData.endTime,
                dayOfWeek: parseInt(classData.dayOfWeek),
                description: classData.description || '',
                frequency: 'weekly',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // 保存到數據管理器
            const classId = this.dataManager.addClass(classForDataManager);
            
            if (classId) {
                const newClass = {
                    id: classId,
                    ...classForDataManager
                };
                this.classes.push(newClass);
                return newClass;
            } else {
                throw new Error('保存課堂失敗');
            }
        } catch (error) {
            console.error('新增課堂失敗:', error);
            throw error;
        }
    }

    async deleteClass(classId) {
        try {
            const classIndex = this.classes.findIndex(c => c.id === classId);
            
            if (classIndex === -1) {
                throw new Error('找不到指定課堂');
            }

            const classItem = this.classes[classIndex];

            // 檢查是否有學員在此課堂
            const students = this.dataManager.getStudents(classId);
            
            if (students.length > 0) {
                const confirmDelete = confirm(
                    `該課堂有 ${students.length} 位學員，刪除課堂將會影響這些學員的班別資訊。確定要繼續嗎？`
                );
                
                if (!confirmDelete) {
                    return false;
                }
            }

            // 檢查是否有相關的點名記錄
            const attendanceRecords = this.dataManager.getAttendance().filter(a => {
                const student = this.dataManager.getStudent(a.studentId);
                return student && student.class === classId;
            });
            
            if (attendanceRecords.length > 0) {
                const confirmDeleteAttendance = confirm(
                    `該課堂有 ${attendanceRecords.length} 筆點名記錄，刪除課堂將同時刪除所有相關記錄。確定要繼續嗎？`
                );
                
                if (!confirmDeleteAttendance) {
                    return false;
                }
            }

            // 從數據管理器中刪除
            this.dataManager.deleteClass(classId);
            this.classes.splice(classIndex, 1);
            return true;
        } catch (error) {
            console.error('刪除課堂失敗:', error);
            throw error;
        }
    }

    // 獲取課堂的學員數量
    getClassStudentCount(classId) {
        const students = this.dataManager.getStudents(classId);
        return students.length;
    }
