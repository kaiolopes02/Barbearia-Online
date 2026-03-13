/**
 * navigation.js
 * Responsável por trocar as telas com animação suave.
 */
function showScreen(screenId) {
    const current = document.querySelector('.screen.visible');
    const next = document.getElementById(screenId);

    if (!next || current === next) return;

    // Saída da tela atual
    if (current) {
        current.style.opacity = '0';
        current.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            current.classList.remove('visible');
            current.style.opacity = '';
            current.style.transform = '';
        }, 300);
    }

    // Entrada da próxima tela
    setTimeout(() => {
        next.classList.add('visible');
    }, current ? 280 : 0);
}