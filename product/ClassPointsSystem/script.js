let students = [];
let prizes = JSON.parse(localStorage.getItem('prizes')) || [];

async function init() {
    await initDB();
    students = getStudents();
    prizes = getPrizes();
    renderStudents();
    renderPrizes();
}

function saveData() {
    // 数据已经在SQLite中，不需要额外保存到localStorage
}

function renderStudents() {
    const container = document.getElementById('studentContainer');
    container.innerHTML = '';
    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerHTML = `
            <h4>🎒 ${student.id}号：${student.name}</h4>
            <div style="margin:10px 0">
                <button class="plus-btn" onclick="changeScore(${student.id}, 1)">+1</button>
                <button class="plus-btn" onclick="changeScore(${student.id}, 5)">+5</button>
                <span style="font-weight:bold;color:#ff69b4">${student.score}</span>
                <button class="minus-btn" onclick="changeScore(${student.id}, -1)">-1</button>
                <button class="minus-btn" onclick="changeScore(${student.id}, -5)">-5</button>
            </div>
            <div>🪙 兑换币：${student.coins}</div>
            <div style="margin-top:10px">
                <input type="text" value="${student.name}" onchange="updateName(${student.id}, this.value)" style="width:120px">
                <button class="delete-btn" onclick="deleteStudent(${student.id})">删除</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    renderRanking();
}

function changeScore(id, amount) {
    updateStudentScore(id, amount);
    students = getStudents();
    renderStudents();
}

function updateName(id, newName) {
    updateStudentName(id, newName);
    students = getStudents();
    renderStudents();
}

function deleteStudent(id) {
    deleteStudentById(id);
    students = getStudents();
    renderStudents();
}

function addStudent() {
    const id = parseInt(document.getElementById('newId').value) || 0;
    const name = document.getElementById('newName').value.trim();
    if(!id || !name) return alert('请填写完整信息！');
    if(students.some(s => s.id === id)) return alert('学号已存在！');
    
    addNewStudent(id, name);
    students = getStudents();
    renderStudents();
}

function batchAdd() {
    const amount = parseInt(document.getElementById('batchAmount').value) || 0;
    batchUpdateScore(amount);
    students = getStudents();
    renderStudents();
}

function batchSubtract() {
    const amount = parseInt(document.getElementById('batchAmount').value) || 0;
    batchUpdateScore(-amount);
    students = getStudents();
    renderStudents();
}

function sortRanking() {
    students.sort((a, b) => b.score - a.score);
    renderStudents();
}

function renderPrizes() {
    const container = document.getElementById('prizeList');
    container.innerHTML = '';
    prizes.forEach((prize, index) => {
        const div = document.createElement('div');
        div.style.margin = "10px 0";
        div.innerHTML = `
            <span style="font-weight:bold">🎁 ${prize.name}</span> 
            (需要 ${prize.cost}币)
            <input type="number" id="redeemId${index}" placeholder="学号" style="width:60px">
            <button onclick="handleRedeemPrize(${index})" class="plus-btn">兑换</button>
            <button onclick="deletePrize(${index})" class="delete-btn">删除</button>
        `;
        container.appendChild(div);
    });
}

function addPrize() {
    const name = document.getElementById('prizeName').value.trim();
    const cost = parseInt(document.getElementById('prizeCost').value) || 0;
    if(!name || cost <= 0) return alert('请填写有效的奖品信息！');
    prizes.push({ name, cost });
    saveData();
    renderPrizes();
}

function deletePrize(index) {
    prizes.splice(index, 1);
    saveData();
    renderPrizes();
}

function handleRedeemPrize(index) {
    const studentId = parseInt(document.getElementById(`redeemId${index}`).value) || 0;
    const student = students.find(s => s.id === studentId);
    if(!student) return alert('找不到该学号的学生');
    if((Number(student.coins) || 0) < prizes[index].cost) return alert('兑换币不足！');
    
    redeemPrize(studentId, prizes[index].id).then(() => {
        students = getStudents();
        renderStudents();
    });
}

function renderRanking() {
    const rankingList = document.getElementById('rankingList');
    const sortedStudents = [...students].sort((a, b) => b.score - a.score);
    
    rankingList.innerHTML = sortedStudents.slice(0, 10).map((student, index) => `
        <div class="rank-item">
            <span class="rank">${index + 1}</span>
            <span>${student.name}</span>
            <span>${student.score}分</span>
        </div>
    `).join('');
}

// 初始化系统
init(); 