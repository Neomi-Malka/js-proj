/**
 * @file game.js - ניהול לוגיקת המשחק, טיימר, שמע והצגת מבחנה ממורכזת.
 */

const gameLevels = [
    { difficulty: 1, story: "המדען מילא בדיוק חצי מהמבחנה. כמה אחוזים אלו?", ans: 50 },
    { difficulty: 1, story: "חילקנו את הנוזל ל-4 מבחנות שוות. כמה אחוזים בכל אחת?", ans: 25 },
    { difficulty: 1, story: "המבחנה מלאה עד הסוף! כמה אחוזים יש בה?", ans: 100 },
    { difficulty: 1, story: "מילאנו רק עשירית מהמבחנה. מה האחוז?", ans: 10 },
    { difficulty: 1, story: "המבחנה מלאה בשלושה רבעים. כמה אחוזים אלו?", ans: 75 },
    { difficulty: 2, story: "מילאנו חמישית מהמבחנה. מה האחוז?", ans: 20 },
    { difficulty: 2, story: "מילאנו 3 חמישיות מהמבחנה. כמה אחוזים זה?", ans: 60 },
    { difficulty: 2, story: "המבחנה כמעט מלאה, חסרים רק 10% לסוף. כמה יש בה?", ans: 90 },
    { difficulty: 2, story: "המבחנה מלאה ב-2 חמישיות. כמה אחוזים אלו?", ans: 40 },
    { difficulty: 2, story: "המבחנה מלאה ב-4 חמישיות. כמה אחוזים אלו?", ans: 80 }
];

let currentIndex = 0, score = 0, timeLeft = 15, timerId, isProcessing = false;

// שליפת נתונים
const savedData = JSON.parse(localStorage.getItem('currentPlayer')) || { name: "אורח", level: 1 };
const currentLevelQuestions = gameLevels.filter(q => q.difficulty == savedData.level);

document.getElementById('display-username').textContent = savedData.name;

const loadQuestion = () => {
    if (currentIndex >= currentLevelQuestions.length) return endGame();
    
    isProcessing = false;
    const q = currentLevelQuestions[currentIndex];
    document.getElementById('story-text').textContent = q.story;

    const target = document.getElementById('main-drop-target');
    target.classList.remove('correct-glow');
    target.innerHTML = '<span>גרור לכאן</span>';

    const tubeRow = document.getElementById('tubes-options');
    const btnRow = document.getElementById('buttons-options');
    tubeRow.innerHTML = ''; 
    btnRow.innerHTML = '';

    let opts = new Set([q.ans]);
    const possibleValues = [10, 20, 25, 40, 50, 60, 75, 80, 90, 100];
    while(opts.size < 4) {
        opts.add(possibleValues[Math.floor(Math.random() * possibleValues.length)]);
    }

    const finalOptions = Array.from(opts).sort(() => Math.random() - 0.5);

    finalOptions.forEach(opt => {
        const img = document.createElement('img');
        img.src = `../images/tube_${opt}.png`;
        img.className = 'mini-tube-img';
        img.draggable = true;
        img.ondragstart = (e) => {
            if (!isProcessing) e.dataTransfer.setData("text", opt);
        };
        tubeRow.appendChild(img);

        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = `${opt}%`;
        btn.onclick = () => handleChoice(opt, false); // לחיצה לא מציגה מבחנה במרכז
        btnRow.appendChild(btn);
    });

    startTimer();
};

const handleChoice = (val, isFromDrag = false) => {
    if (isProcessing) return;
    const q = currentLevelQuestions[currentIndex];
    
    if (val == q.ans) {
        const target = document.getElementById('main-drop-target');
        target.innerHTML = ''; // ניקוי הטקסט
        
        const tubeImg = document.createElement('img');
        tubeImg.src = `../images/tube_${val}.png`;
        
        // הגדרות עיצוב ישירות למרכוז מושלם בתוך המלבן
        tubeImg.style.maxWidth = "90%";
        tubeImg.style.maxHeight = "90%";
        tubeImg.style.display = "block";
        tubeImg.style.margin = "auto";
        
        target.appendChild(tubeImg);
        handleFinish(true);
    } else {
        handleFinish(false);
    }
};

const handleFinish = (isWin) => {
    isProcessing = true;
    clearInterval(timerId);
    
    const sound = document.getElementById(isWin ? 'sound-success' : 'sound-fail');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound error"));
        setTimeout(() => {
            sound.pause();
            sound.currentTime = 0;
        }, 3000);
    }

    if (isWin) {
        score += 10;
        document.getElementById('score').textContent = score;
        document.getElementById('main-drop-target').classList.add('correct-glow');
    }

    // המבחנה והאפקט יישארו ל-3 שניות
    setTimeout(() => {
        currentIndex++;
        loadQuestion();
    }, 3200);
};

const startTimer = () => {
    clearInterval(timerId);
    timeLeft = 15;
    document.getElementById('timer').textContent = timeLeft;
    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft <= 0) handleFinish(false);
    }, 1000);
};

const dropZone = document.getElementById('main-drop-target');
dropZone.ondragover = (e) => e.preventDefault();
dropZone.ondrop = (e) => {
    const droppedVal = e.dataTransfer.getData("text");
    handleChoice(droppedVal, true); 
};

const endGame = () => {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: savedData.name, score: score, date: new Date().toLocaleDateString() });
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    document.getElementById('finish-screen').classList.add('show-finish');
};

loadQuestion();