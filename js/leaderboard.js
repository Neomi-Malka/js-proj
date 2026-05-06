document.addEventListener('DOMContentLoaded', () => {
    const leaderboardBody = document.getElementById('leaderboard-body');
    const scores = JSON.parse(localStorage.getItem('leaderboard')) || [];

    scores.sort((a, b) => b.score - a.score);

    scores.slice(0, 5).forEach((entry, index) => {
        const tr = document.createElement('tr');
        tr.style.textAlign = "center";
        
        const tdRank = document.createElement('td'); tdRank.textContent = index + 1;
        const tdName = document.createElement('td'); tdName.textContent = entry.name;
        const tdScore = document.createElement('td'); tdScore.textContent = entry.score;

        tr.append(tdRank, tdName, tdScore);
        leaderboardBody.appendChild(tr);
    });
});