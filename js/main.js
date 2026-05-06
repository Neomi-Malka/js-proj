const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); 
    const username = document.querySelector('#username').value;
    const difficulty = document.querySelector('#difficulty').value;

    const playerData = {
        name: username,
        level: parseInt(difficulty),
        score: 0
    };
    
    localStorage.setItem('currentPlayer', JSON.stringify(playerData));
    window.location.href = "pages/game.html";
});