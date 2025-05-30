    // 新增方法來支持新的模組架構
    getClasses() {
        return Object.keys(this.classDefinitions).map(id => ({
            id: id,
            name: this.classDefinitions[id].name,
            startTime: this.classDefinitions[id].startTime,
            endTime: this.classDefinitions[id].endTime,
            dayOfWeek: this.classDefinitions[id].dayOfWeek,
            description: this.classDefinitions[id].description || '',
            createdAt: this.classDefinitions[id].createdAt || new Date().toISOString(),
            updatedAt: this.classDefinitions[id].updatedAt || new Date().toISOString()
        }));
    }

    updateClass(classId, updatedData) {
        if (this.classDefinitions[classId]) {
            this.classDefinitions[classId] = { 
                ...this.classDefinitions[classId], 
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
            return true;
        }
        return false;
    }

    getAttendanceByClassAndDate(classId, date) {
        const classStudents = this.getStudents(classId);
        return classStudents.map(student => {
            const status = this.getAttendance(student.id, date);
            return {
                id: `${date}_${student.id}`,
                studentId: student.id,
                classId: classId,
                date: date,
                status: status === 'unmarked' ? null : status,
                createdAt: new Date().toISOString()
            };
        }).filter(record => record.status !== null);
    }

    setAttendanceStatus(studentId, classId, date, status) {
        this.markAttendance(studentId, date, status);
        return true;
    }

    saveAttendance(attendanceArray) {
        // 將數組格式轉換回原有的對象格式
        const newAttendance = {};
        attendanceArray.forEach(record => {
            const key = `${record.date}_${record.studentId}`;
            newAttendance[key] = record.status;
        });
        this.attendance = newAttendance;
        this.saveData();
        return true;
    }

    getAttendance() {
        // 將對象格式轉換為數組格式以兼容新模組
        return Object.keys(this.attendance).map(key => {
            const [date, studentId] = key.split('_');
            return {
                id: key,
                studentId: studentId,
                date: date,
                status: this.attendance[key],
                createdAt: new Date().toISOString()
            };
        });
    }

    clearAllData() {
        this.students = [];
        this.attendance = {};
        this.classSchedule = [];
        this.classDefinitions = {
            youth: { name: '青年班', startTime: '16:00', endTime: '17:30', dayOfWeek: 6, frequency: 'weekly' },
            children: { name: '兒童班', startTime: '17:30', endTime: '19:00', dayOfWeek: 6, frequency: 'weekly' },
            family: { name: '家規班', startTime: '10:00', endTime: '11:30', dayOfWeek: 6, frequency: 'weekly' }
        };
        localStorage.clear();
        this.saveData();
        return true;
    }

    async importAllData(data) {
        try {
            if (data.students) {
                this.students = data.students;
            }
            if (data.classes) {
                this.classDefinitions = data.classes;
            }
            if (data.attendance) {
                // 處理不同格式的點名數據
                if (Array.isArray(data.attendance)) {
                    const attendanceObj = {};
                    data.attendance.forEach(record => {
                        const key = `${record.date}_${record.studentId}`;
                        attendanceObj[key] = record.status;
                    });
                    this.attendance = attendanceObj;
                } else {
                    this.attendance = data.attendance;
                }
            }
            this.classSchedule = data.classSchedule || [];
            this.saveData();
            return true;
        } catch (error) {
            throw new Error('匯入數據失敗: ' + error.message);
        }
    }
