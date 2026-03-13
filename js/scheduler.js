/**
 * scheduler.js
 * Comunicação com o Google Apps Script (Google Sheets).
 */
const API_CONFIG = {
    url: 'https://script.google.com/macros/s/AKfycbxzabZEPsV8AwU84em9YOO0E2_RzZ1TZrx91C3fFlVvN6mWZb_WADi5o3RqcpXaCGFt/exec'
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