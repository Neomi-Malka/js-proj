/**
 * @file main.js - ניהול דף הכניסה ושמירת נתוני השחקן ב-LocalStorage
 */

// בחירת הטופס מה-DOM ע"י querySelector[cite: 1]
const loginForm = document.querySelector('#login-form');

/**
 * מאזין לאירוע שליחת הטופס (submit)[cite: 1]
 */
loginForm.addEventListener('submit', (event) => {
    // מניעת רענון ברירת המחדל של הדף[cite: 1]
    event.preventDefault(); 

    // שליפת הערכים שהזין המשתמש
    const username = document.querySelector('#username').value;
    const difficulty = document.querySelector('#difficulty').value;

    // יצירת אובייקט שחקן ושמירתו ב-LocalStorage[cite: 1]
    const playerData = {
        name: username,
        level: difficulty,
        score: 0,
        date: new Date().toLocaleDateString()
    };
    
    localStorage.setItem('currentPlayer', JSON.stringify(playerData));

    // מעבר לדף המשחק עם שימוש ב-Query Parameters להעברת הרמה[cite: 1]
    // התיקון: שימוש בנתיב יחסי תקני ושירשור משתנים
    window.location.href = "./pages/game.html?level=" + difficulty;
});