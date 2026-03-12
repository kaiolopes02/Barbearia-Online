// Responsável pela comunicação com o Google Sheets e validações
const API_CONFIG = {
    url: 'https://script.google.com/macros/s/AKfycbxRWdtw8eojugYlCvuzMEonIuEmdbqRrmvlPpFOq1dbyCLRbAarjoKCFwMbcArZyE7o8w/exec',
    whatsapp: '+55 (11)91433-0750'
};

async function getOccupiedSlots(date) {
    try {
        const response = await fetch(API_CONFIG.url);
        const data = await response.json();
        return data.filter(item => item.data === date);
    } catch (e) {
        console.error("Erro ao procurar vagas", e);
        return [];
    }
}

async function saveToSheet(bookingData) {
    return fetch(API_CONFIG.url, {
        method: 'POST',
        body: JSON.stringify(bookingData)
    });
}


