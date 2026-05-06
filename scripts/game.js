/**
 * @file game.js - ניהול לוגיקת המשחק, טיימר וגרירה
 * עומד בדרישות: HOF, DOM Elements, JSDoc, Arrow Functions
 */

/** @type {Array<Object>} רשימת השאלות למשחק */
/** @type {Array<Object>} רשימת השאלות המורחבת למשחק */
const gameLevels = [
    // שלב א' - רמה 1 (מתחילים)
    { difficulty: 1, story: "המדען מילא בדיוק חצי מהמבחנה. כמה אחוזים אלו?", ans: 50 },
    { difficulty: 1, story: "חילקנו את הנוזל ל-4 מבחנות שוות. כמה אחוזים בכל אחת?", ans: 25 },
    { difficulty: 1, story: "המבחנה מלאה עד הסוף! כמה אחוזים יש בה?", ans: 100 },
    { difficulty: 1, story: "מילאנו רק עשירית מהמבחנה. מה האחוז?", ans: 10 },
    { difficulty: 1, story: "המבחנה מלאה בשלושה רבעים. כמה אחוזים אלו?", ans: 75 },
    { difficulty: 1, story: "רוקנו רבע מהמבחנה המלאה. כמה אחוזים נשארו?", ans: 75 },

    // שלב ב' - רמה 2 (מתקדמים)
    { difficulty: 2, story: "מילאנו חמישית מהמבחנה. מה האחוז?", ans: 20 },
    { difficulty: 2, story: "מילאנו 3 חמישיות מהמבחנה. כמה אחוזים זה?", ans: 60 },
    { difficulty: 2, story: "המבחנה כמעט מלאה, חסרים רק 10% לסוף. כמה יש בה?", ans: 90 },
    { difficulty: 2, story: "המבחנה מלאה ב-2 חמישיות. כמה אחוזים אלו?", ans: 40 },
    { difficulty: 2, story: "המבחנה מלאה ב-4 חמישיות. כמה אחוזים אלו?", ans: 80 },
    { difficulty: 2, story: "הוספנו נוזל עד שהגענו לפי 2 מ-20%. כמה אחוזים יש עכשיו?", ans: 40 },
    { difficulty: 2, story: "חילקנו את המבחנה ל-5 חלקים ומילאנו 3 מהם. מה האחוז?", ans: 60 }
];
    

let currentIndex = 0, score = 0, timeLeft = 10, timerId;
let hasClicked = false, hasDragged = false, isProcessing = false;

// שליפת נתוני השחקן מה-LocalStorage
const savedData = JSON.parse(localStorage.getItem('currentPlayer')) || { name: "אורח", level: 1 };
const currentLevelQuestions = gameLevels.filter(q => q.difficulty == savedData.level);
document.getElementById('display-username').textContent = savedData.name;

/**
 * פונקציית חץ לטעינת שאלה חדשה
 * משתמשת ביצירת אלמנטים דינאמית במקום innerHTML כדרישת המורה
 */
const loadQuestion = () => {
    if (currentIndex >= currentLevelQuestions.length) return endGame();
    
    isProcessing = false;
    hasClicked = false;
    hasDragged = false;
    
    const q = currentLevelQuestions[currentIndex];
    
    // עדכון טקסט השאלה ללא innerHTML
    document.getElementById('story-text').textContent = q.story;

    const target = document.getElementById('main-drop-target');
    target.className = 'empty-slot';
    
    // ניקוי תיבת הגרירה ללא innerHTML
    while (target.firstChild) target.removeChild(target.firstChild);
    const span = document.createElement('span');
    span.textContent = 'גרור לכאן';
    target.appendChild(span);

    const tubeRow = document.getElementById('tubes-options');
    const btnRow = document.getElementById('buttons-options');
    
    // ניקוי אזורי האפשרויות
    while (tubeRow.firstChild) tubeRow.removeChild(tubeRow.firstChild);
    while (btnRow.firstChild) btnRow.removeChild(btnRow.firstChild);

    // יצירת אפשרויות (שימוש ב-Set למניעת כפילויות)
    let opts = new Set([q.ans]);
    const possibleValues = [10, 20, 25, 33, 40, 50, 60, 75, 80, 90, 100];
    while(opts.size < 4) {
        opts.add(possibleValues[Math.floor(Math.random() * possibleValues.length)]);
    }

    // ערבוב האפשרויות והצגתן
    const finalOptions = Array.from(opts).sort(() => Math.random() - 0.5);

    finalOptions.forEach(opt => {
        // יצירת מבחנה דינאמית
        const img = document.createElement('img');
        img.src = "../images/tube_" + opt + ".png";
        img.className = 'mini-tube-img';
        img.draggable = true;
        img.addEventListener('dragstart', (e) => {
            if (!isProcessing) e.dataTransfer.setData("text/plain", opt);
        });
        tubeRow.appendChild(img);

        // יצירת כפתור אחוזים דינאמי
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = `${opt}%`;
        btn.addEventListener('click', () => {
            if (!isProcessing) {
                if (opt === q.ans) {
                    hasClicked = true;
                    checkWin();
                } else {
                    handleFinish(false);
                }
            }
        });
        btnRow.appendChild(btn);
    });

    startTimer();
};

/**
 * בדיקה האם המשתמש גם לחץ וגם גרר נכון
 */
const checkWin = () => {
    if (hasClicked && hasDragged) handleFinish(true);
};

/**
 * טיפול בסיום שאלה (הצלחה או כישלון)
 * @param {boolean} isWin - האם התשובה נכונה
 */
const handleFinish = (isWin) => {
    isProcessing = true;
    clearInterval(timerId);
    
    // שליפת האלמנט המתאים לפי ה-ID שהגדרנו ב-HTML
    const sound = document.getElementById(isWin ? 'sound-success' : 'sound-fail');
    
    if (sound) {
        sound.currentTime = 0; // מאפס את הסאונד להתחלה למקרה של ניגון חוזר
        sound.play().catch(error => {
            console.error("השמע נחסם על ידי הדפדפן או שהנתיב שגוי:", error);
        });
    }
    }

/**
 * ניהול הטיימר
 */
const startTimer = () => {
    clearInterval(timerId);
    timeLeft = savedData.level == 1 ? 10 : 7;
    document.getElementById('timer').textContent = timeLeft;
    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft <= 0) handleFinish(false);
    }, 1000);
};

// הגדרת אזור הגרירה
const dropZone = document.getElementById('main-drop-target');
dropZone.addEventListener('dragover', (e) => e.preventDefault());
dropZone.addEventListener('drop', (e) => {
    if (isProcessing) return;
    const val = e.dataTransfer.getData("text/plain");
    if (val == currentLevelQuestions[currentIndex].ans) {
        hasDragged = true;
        while (dropZone.firstChild) dropZone.removeChild(dropZone.firstChild);
        const finalImg = document.createElement('img');
        finalImg.src = `../images/tube_${val}.png`;
        finalImg.style.height = '100%';
        finalImg.style.width = '100%';
        finalImg.style.objectFit = 'contain';
        dropZone.appendChild(finalImg);
        dropZone.classList.add('correct-glow');
        checkWin();
    } else {
        handleFinish(false);
    }
});

/**
 * סיום המשחק ושמירה בלוח שיאים
 */
const endGame = () => {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: savedData.name, score: score, date: new Date().toLocaleDateString() });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 5)));
    
    const finishScreen = document.getElementById('finish-screen');
    document.getElementById('completed-level').textContent = (savedData.level == 1 ? "מתחילים (א')" : "מתקדמים (ב')");
    finishScreen.classList.add('show-finish');
};
// בתוך פונקציית loadQuestion, כשאת יוצרת את ה-img:
img.addEventListener('touchstart', (e) => {
    // מאפשר לזהות לחיצה בטלפון כהתחלת גרירה
    if (!isProcessing) {
        window.selectedTube = opt; 
        img.style.opacity = "0.5";
    }
});

// הוספת אפשרות ללחוץ על אזור היעד (בנוסף לגרירה)
dropZone.addEventListener('click', () => {
    if (window.selectedTube == currentLevelQuestions[currentIndex].ans) {
        handleFinish(true);
    }
});

// הפעלת המשחק לראשונה
loadQuestion();