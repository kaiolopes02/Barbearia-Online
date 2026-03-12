// Responsável apenas por trocar as telas do "App"
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('visible');
    });
    document.getElementById(screenId).classList.add('visible');
}


