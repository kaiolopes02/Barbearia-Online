const API_CONFIG = {
    url: 'https://script.google.com/macros/s/AKfycbyWxCOawKxJgKTxjZNOQpPlvoiIO0AG97IPuAM8lWxGTC3S_p3TMeh0XSsUq1BR4D3r/exec', // COLOQUE SUA URL AQUI
};

async function getOccupiedSlots(date) {
    try {
        const response = await fetch(API_CONFIG.url);
        if (!response.ok) return [];
        const data = await response.json();
        // Garante que a comparação de data ignore espaços extras
        return data.filter(item => item.data.trim() === date.trim());
    } catch (e) {
        console.error("Erro ao buscar horários ocupados:", e);
        return [];
    }
}

async function saveToSheet(bookingData) {
    // Usamos fetch normal, mas sem 'no-cors' para tentar capturar erros se houver
    return fetch(API_CONFIG.url, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(bookingData)
    });
}