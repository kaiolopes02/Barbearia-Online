/**
 * scheduler.js
 * Comunicação com o Google Apps Script (Google Sheets).
 */
const API_CONFIG = {
    url: 'https://script.google.com/macros/s/AKfycbz6Ti9OU9k7gBttk3lOvO-JmaXI5kGXQPY3wyc6oJAEWpdO6X9yA8Xw26fWcR9crP0a/exec'
};

/**
 * Busca os horários já ocupados na planilha.
 * @returns {Promise<Array>} Lista de objetos { dataFormatada, hora }
 */
async function getOccupiedSlots() {
    const response = await fetch(API_CONFIG.url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

/**
 * Salva um novo agendamento na planilha.
 * @param {Object} bookingData - { name, date, time, service }
 * @returns {Promise<Response>}
 */
async function saveToSheet(bookingData) {
    return fetch(API_CONFIG.url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // CORS-safe para Apps Script
        body: JSON.stringify(bookingData)
    });
}