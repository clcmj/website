let db;
let SQL;
let idb; // IndexedDB 实例

// 初始化数据库
async function initDB() {
    // 初始化SQL.js
    SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    
    // 打开 IndexedDB
    await openIndexedDB();
    
    // 尝试从 IndexedDB 加载数据
    const savedData = await loadFromIndexedDB();
    
    if (savedData) {
        // 如果有保存的数据，使用保存的数据
        db = new SQL.Database(savedData);
    } else {
        // 如果没有保存的数据，创建新数据库并初始化
        db = new SQL.Database();
        
        // 创建表
        db.run(`
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                score INTEGER DEFAULT 0,
                coins INTEGER DEFAULT 0
            );
        `);
        
        db.run(`
            CREATE TABLE IF NOT EXISTS prizes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                cost INTEGER NOT NULL
            );
        `);

        // 初始化30个学生数据
        const initialStudents = [
            { id: 1, name: "张浩然", score: 0, coins: 0 },
            { id: 2, name: "李梦琪", score: 0, coins: 0 },
            { id: 3, name: "王子轩", score: 0, coins: 0 },
            { id: 4, name: "刘欣怡", score: 0, coins: 0 },
            { id: 5, name: "陈思远", score: 0, coins: 0 },
            { id: 6, name: "杨雨涵", score: 0, coins: 0 },
            { id: 7, name: "周宇轩", score: 0, coins: 0 },
            { id: 8, name: "黄语嫣", score: 0, coins: 0 },
            { id: 9, name: "吴承恩", score: 0, coins: 0 },
            { id: 10, name: "赵紫涵", score: 0, coins: 0 },
            { id: 11, name: "孙艺轩", score: 0, coins: 0 },
            { id: 12, name: "朱梓萱", score: 0, coins: 0 },
            { id: 13, name: "胡皓轩", score: 0, coins: 0 },
            { id: 14, name: "郭雨欣", score: 0, coins: 0 },
            { id: 15, name: "徐子涵", score: 0, coins: 0 },
            { id: 16, name: "马思涵", score: 0, coins: 0 },
            { id: 17, name: "谢宇轩", score: 0, coins: 0 },
            { id: 18, name: "韩雨泽", score: 0, coins: 0 },
            { id: 19, name: "曾子墨", score: 0, coins: 0 },
            { id: 20, name: "邓梓涵", score: 0, coins: 0 },
            { id: 21, name: "范思涵", score: 0, coins: 0 },
            { id: 22, name: "唐子轩", score: 0, coins: 0 },
            { id: 23, name: "彭语晨", score: 0, coins: 0 },
            { id: 24, name: "蒋雨轩", score: 0, coins: 0 },
            { id: 25, name: "董思远", score: 0, coins: 0 },
            { id: 26, name: "沈梓萱", score: 0, coins: 0 },
            { id: 27, name: "江雨泽", score: 0, coins: 0 },
            { id: 28, name: "贾子墨", score: 0, coins: 0 },
            { id: 29, name: "夏语嫣", score: 0, coins: 0 },
            { id: 30, name: "潘思远", score: 0, coins: 0 }
        ];

        // 插入学生数据
        initialStudents.forEach(student => {
            db.run('INSERT OR REPLACE INTO students (id, name, score, coins) VALUES (?, ?, ?, ?)',
                [student.id, student.name, student.score, student.coins]);
        });

        // 初始化奖品数据
        const initialPrizes = [
            { name: "铅笔", cost: 5 },
            { name: "橡皮", cost: 3 },
            { name: "笔记本", cost: 10 },
            { name: "文具盒", cost: 15 },
            { name: "贴纸", cost: 2 }
        ];

        // 插入奖品数据
        initialPrizes.forEach(prize => {
            db.run('INSERT INTO prizes (name, cost) VALUES (?, ?)',
                [prize.name, prize.cost]);
        });

        // 保存初始数据到 IndexedDB
        await saveToIndexedDB();
    }

    // 加载数据到内存
    students = getStudents();
    prizes = getPrizes();

    // 渲染界面
    renderStudents();
    renderPrizes();
}

// 打开 IndexedDB
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ClassPointsDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            idb = request.result;
            resolve();
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('sqliteDb')) {
                db.createObjectStore('sqliteDb');
            }
        };
    });
}

// 从 IndexedDB 加载数据
function loadFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const transaction = idb.transaction(['sqliteDb'], 'readonly');
        const store = transaction.objectStore('sqliteDb');
        const request = store.get('database');
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

// 保存到 IndexedDB
function saveToIndexedDB() {
    return new Promise((resolve, reject) => {
        const data = db.export();
        const transaction = idb.transaction(['sqliteDb'], 'readwrite');
        const store = transaction.objectStore('sqliteDb');
        const request = store.put(data, 'database');
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

// 从 localStorage 迁移数据
async function migrateFromLocalStorage() {
    const storedStudents = JSON.parse(localStorage.getItem('students')) || [];
    const storedPrizes = JSON.parse(localStorage.getItem('prizes')) || [];
    
    // 插入学生数据
    storedStudents.forEach(student => {
        db.run('INSERT OR REPLACE INTO students (id, name, score, coins) VALUES (?, ?, ?, ?)',
            [student.id, student.name, student.score, student.coins]);
    });
    
    // 插入奖品数据
    storedPrizes.forEach(prize => {
        db.run('INSERT INTO prizes (name, cost) VALUES (?, ?)',
            [prize.name, prize.cost]);
    });
    
    // 迁移完成后清除 localStorage
    localStorage.removeItem('students');
    localStorage.removeItem('prizes');
    
    // 保存到 IndexedDB
    await saveToIndexedDB();
}

// 修改所有会改变数据的函数，添加自动保存功能
async function updateStudentScore(id, scoreChange) {
    db.run(`
        UPDATE students 
        SET score = score + ?, coins = coins + ? 
        WHERE id = ?
    `, [scoreChange, scoreChange, id]);
    await saveToIndexedDB();
}

async function updateStudentName(id, newName) {
    db.run('UPDATE students SET name = ? WHERE id = ?', [newName, id]);
    await saveToIndexedDB();
}

async function addNewStudent(id, name) {
    db.run('INSERT INTO students (id, name, score, coins) VALUES (?, ?, 0, 0)',
        [id, name]);
    await saveToIndexedDB();
}

async function deleteStudentById(id) {
    db.run('DELETE FROM students WHERE id = ?', [id]);
    await saveToIndexedDB();
}

async function addNewPrize(name, cost) {
    db.run('INSERT INTO prizes (name, cost) VALUES (?, ?)', [name, cost]);
    await saveToIndexedDB();
}

async function deletePrizeById(id) {
    db.run('DELETE FROM prizes WHERE id = ?', [id]);
    await saveToIndexedDB();
}

async function batchUpdateScore(amount) {
    db.run(`
        UPDATE students 
        SET score = score + ?, coins = coins + ?
    `, [amount, amount]);
    await saveToIndexedDB();
}

// 获取所有学生
function getStudents() {
    const result = db.exec('SELECT * FROM students ORDER BY id');
    return result[0] ? result[0].values.map(row => ({
        id: row[0],
        name: row[1],
        score: row[2],
        coins: row[3]
    })) : [];
}

// 获取所有奖品
function getPrizes() {
    const result = db.exec('SELECT * FROM prizes');
    return result[0] ? result[0].values.map(row => ({
        id: row[0],
        name: row[1],
        cost: row[2]
    })) : [];
}

// 兑换奖品
async function redeemPrize(studentId, prizeId) {
    db.run('BEGIN TRANSACTION');
    try {
        const prizeCost = db.exec(`SELECT cost FROM prizes WHERE id = ${prizeId}`)[0].values[0][0];
        db.run(`
            UPDATE students 
            SET coins = coins - ? 
            WHERE id = ? AND coins >= ?
        `, [prizeCost, studentId, prizeCost]);
        db.run('COMMIT');
        
        // 保存更改到 IndexedDB
        await saveToIndexedDB();
        return true;
    } catch (error) {
        db.run('ROLLBACK');
        return false;
    }
}

// 导出数据到CSV
function exportData() {
    try {
        // 获取所有学生数据
        const students = getStudents();
        
        // 转换为CSV格式
        const csvContent = [
            // CSV头部
            "学号,姓名,积分,兑换币",
            // 数据行
            ...students.map(s => {
                // 确保每个字段都被正确处理
                const id = s.id;
                const name = s.name;
                const score = s.score || 0;  // 如果为null或undefined则设为0
                const coins = s.coins || 0;  // 如果为null或undefined则设为0
                return `${id},${name},${score},${coins}`;
            })
        ].join("\r\n");
        
        // 添加BOM头，确保Excel正确识别UTF-8编码
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { 
            type: 'text/csv;charset=utf-8'
        });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `班级积分表_${new Date().toISOString().slice(0,10)}.csv`;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        alert('导出失败：' + err.message);
    }
}

// 从CSV导入数据
async function importFromCSV(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                // 读取CSV内容
                const content = e.target.result;
                const lines = content.split(/\r\n|\n/).filter(line => line.trim());
                
                // 跳过表头
                const dataLines = lines.slice(1);
                
                // 清空现有数据
                db.run('DELETE FROM students');
                
                // 插入新数据
                dataLines.forEach(line => {
                    const [id, name, score, coins] = line.split(',').map(item => item.trim());
                    if (id && name) {
                        db.run('INSERT INTO students (id, name, score, coins) VALUES (?, ?, ?, ?)',
                            [parseInt(id), name, parseInt(score) || 0, parseInt(coins) || 0]);
                    }
                });
                
                // 保存并刷新显示
                await saveToIndexedDB();
                students = getStudents();
                renderStudents();
                
                alert('数据导入成功！');
            } catch (err) {
                alert('导入失败：文件格式不正确。请确保CSV文件包含：学号,姓名,积分,兑换币 这几列。');
            }
        };
        reader.readAsText(file, 'UTF-8');
    } catch (err) {
        alert('导入失败：' + err.message);
    }
} 