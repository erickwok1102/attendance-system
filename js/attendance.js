    // 獲取指定課堂和日期的點名記錄
    async getAttendance(classId, date) {
        try {
            const attendance = this.dataManager.getAttendanceByClassAndDate(classId, date);
            
            // 將數據載入到當前點名狀態
            this.currentAttendance.clear();
            attendance.forEach(record => {
                this.currentAttendance.set(record.studentId, record.status);
            });
            
            return attendance;
        } catch (error) {
            console.error('獲取點名記錄失敗:', error);
            throw error;
        }
    }

    // 獲取課堂的出席統計
    getClassAttendanceStats(classId, startDate = null, endDate = null) {
        try {
            const allAttendance = this.dataManager.getAttendance();
            const classStudents = this.dataManager.getStudents(classId);
            
            let classAttendance = allAttendance.filter(record => {
                const student = classStudents.find(s => s.id === record.studentId);
                if (!student) return false;
                if (startDate && record.date < startDate) return false;
                if (endDate && record.date > endDate) return false;
                return true;
            });
            
            // 按日期分組統計
            const attendanceByDate = {};
            classAttendance.forEach(record => {
                if (!attendanceByDate[record.date]) {
                    attendanceByDate[record.date] = {
                        date: record.date,
                        total: 0,
                        present: 0,
                        absent: 0
                    };
                }
                
                attendanceByDate[record.date].total++;
                if (record.status === 'present') {
                    attendanceByDate[record.date].present++;
                } else if (record.status === 'absent') {
                    attendanceByDate[record.date].absent++;
                }
            });
            
            // 計算每日出席率
            Object.values(attendanceByDate).forEach(dayStats => {
                dayStats.attendanceRate = dayStats.total > 0 ? 
                    Math.round((dayStats.present / dayStats.total) * 100) : 0;
            });
            
            // 計算總體統計
            const total = classAttendance.length;
            const present = classAttendance.filter(record => record.status === 'present').length;
            const absent = classAttendance.filter(record => record.status === 'absent').length;
            const averageAttendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
            
            return {
                total,
                present,
                absent,
                averageAttendanceRate,
                byDate: Object.values(attendanceByDate).sort((a, b) => a.date.localeCompare(b.date))
            };
        } catch (error) {
            console.error('獲取課堂出席統計失敗:', error);
            throw error;
        }
    }

    // 複製上次點名記錄
    copyLastAttendance(classId, targetDate) {
        try {
            // 獲取該課堂的所有點名記錄
            const allAttendance = this.dataManager.getAttendance();
            const classStudents = this.dataManager.getStudents(classId);
            
            const classAttendance = allAttendance
                .filter(record => {
                    const student = classStudents.find(s => s.id === record.studentId);
                    return student && record.date < targetDate;
                })
                .sort((a, b) => b.date.localeCompare(a.date));
            
            if (classAttendance.length === 0) {
                throw new Error('找不到可複製的點名記錄');
            }
            
            // 獲取最近一次的點名記錄
            const lastDate = classAttendance[0].date;
            const lastAttendance = classAttendance.filter(record => record.date === lastDate);
            
            // 複製到目標日期
            const results = {
                success: 0,
                failed: 0,
                errors: []
            };
            
            lastAttendance.forEach(record => {
                try {
                    this.setAttendanceStatus(record.studentId, classId, targetDate, record.status);
                    results.success++;
                } catch (error) {
                    results.failed++;
                    results.errors.push(`學員 ${record.studentId}: ${error.message}`);
                }
            });
            
            return {
                ...results,
                sourceDate: lastDate,
                targetDate: targetDate
            };
        } catch (error) {
            console.error('複製點名記錄失敗:', error);
            throw error;
        }
    }

    // 匯出點名記錄為CSV
    exportAttendanceToCSV(startDate = null, endDate = null, classId = null) {
        try {
            let attendance = this.dataManager.getAttendance();
            const students = this.dataManager.getStudents();
            const classes = this.dataManager.getClasses();
            
            // 應用篩選條件
            if (startDate) {
                attendance = attendance.filter(record => record.date >= startDate);
            }
            if (endDate) {
                attendance = attendance.filter(record => record.date <= endDate);
            }
            if (classId) {
                const classStudents = this.dataManager.getStudents(classId);
                const classStudentIds = classStudents.map(s => s.id);
                attendance = attendance.filter(record => classStudentIds.includes(record.studentId));
            }
            
            // 創建學員和課堂的查找映射
            const studentMap = new Map(students.map(s => [s.id, s]));
            
            // 準備CSV數據
            const headers = ['日期', '課堂', '學員姓名', '出席狀態', '記錄時間'];
            const rows = attendance.map(record => {
                const student = studentMap.get(record.studentId);
                const className = student ? this.dataManager.getClassName(student.class) : '未知課堂';
                
                return [
                    record.date,
                    className,
                    student ? student.name : '未知學員',
                    record.status === 'present' ? '出席' : '缺席',
                    new Date(record.createdAt).toLocaleString('zh-TW')
                ];
            });
            
            const csvContent = [headers, ...rows]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n');
            
            return csvContent;
        } catch (error) {
            console.error('匯出點名記錄失敗:', error);
            throw error;
        }
    }
