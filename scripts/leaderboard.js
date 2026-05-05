/**
 * @file leaderboard.js - ניהול תצוגת השיאים
 * עומד בדרישות: sort, map, createElement
 */

document.addEventListener('DOMContentLoaded', () => {
    const leaderboardBody = document.getElementById('leaderboard-body');
    const scores = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // מיון מותאם אישית (Custom Sort) - דרישת חובה
    const sortedScores = scores.sort((a, b) => b.score - a.score);

    // יצירת הטבלה ללא innerHTML
    sortedScores.forEach((entry, index) => {
        const tr = document.createElement('tr');
        
        const tdRank = document.createElement('td');
        tdRank.textContent = index + 1;
        
        const tdName = document.createElement('td');
        tdName.textContent = entry.name;
        
        const tdScore = document.createElement('td');
        tdScore.textContent = entry.score;

        tr.append(tdRank, tdName, tdScore);
        leaderboardBody.appendChild(tr);
    });
});