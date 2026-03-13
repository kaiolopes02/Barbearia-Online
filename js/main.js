/**
 * main.js
 * Lógica principal do app: seleção de serviço, horários e confirmação.
 */

// Estado global do agendamento
let currentBooking = {
    name:    '',
    date:    '',
    time:    '',
    service: 'Corte'
};

// Horários que a barbearia oferece
const AVAILABLE_TIMES = ['09:00','10:00','11:00','14:00','15:00','16:00','17:00'];

// Previne clique duplo enquanto salva
let isSaving = false;

// ─── Inicialização ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Define a data mínima como hoje (impede agendar no passado)
    const inputData = document.getElementById('input-data');
    if (inputData) {
        inputData.min = getTodayString();
    }
});

// ─── Utilidades ──────────────────────────────────────────────

/** Retorna a data de hoje em formato YYYY-MM-DD (fuso local) */
function getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Formata YYYY-MM-DD → "Sab, 14 de Jun" */
function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ─── Seleção de Serviço ──────────────────────────────────────
function selectService(btn) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    currentBooking.service = btn.dataset.service;
}

// ─── Horários Disponíveis ────────────────────────────────────
async function updateAvailableSlots() {
    const inputData  = document.getElementById('input-data');
    const container  = document.getElementById('time-slots-container');
    const section    = document.getElementById('slots-section');

    if (!inputData?.value) return;

    currentBooking.date = inputData.value;
    currentBooking.time = ''; // reseta horário escolhido

    section.style.display = 'flex';
    setSlotMessage('loading', 'Procurando horários livres…');

    try {
        const ocupados = await getOccupiedSlots();
        container.innerHTML = '';

        const livres = AVAILABLE_TIMES.filter(hora => {
            const horaFmt = hora.trim().padStart(5, '0');
            return !ocupados.some(o =>
                o.dataFormatada === inputData.value &&
                o.hora?.trim().padStart(5, '0') === horaFmt
            );
        });

        if (livres.length === 0) {
            setSlotMessage('full', '😔 Sem horários disponíveis neste dia.');
            return;
        }

        livres.forEach(hora => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = hora;
            slot.setAttribute('role', 'button');
            slot.setAttribute('aria-label', `Horário ${hora}`);
            slot.onclick = () => selectTimeSlot(slot, hora);
            container.appendChild(slot);
        });

    } catch (err) {
        console.error('[getOccupiedSlots]', err);
        setSlotMessage('error', 'Erro ao carregar horários. Tente novamente.');
    }
}

function selectTimeSlot(el, hora) {
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    currentBooking.time = hora;
}

function setSlotMessage(type, text) {
    const container = document.getElementById('time-slots-container');
    container.innerHTML = `<p class="slots-msg ${type}">${text}</p>`;
}

// ─── Confirmação ─────────────────────────────────────────────
async function finish() {
    if (isSaving) return;

    // Referência correta ao botão (pelo ID, não pelo seletor genérico)
    const btn       = document.getElementById('btn-confirm');
    const btnText   = btn?.querySelector('.btn-text');
    const btnSpinner = btn?.querySelector('.btn-spinner');
    const inputNome = document.getElementById('input-name');
    const inputData = document.getElementById('input-data');

    // Validação
    if (!inputNome?.value.trim()) {
        showFieldError(inputNome, 'Informe seu nome.');
        return;
    }
    if (!inputData?.value) {
        showFieldError(inputData, 'Escolha uma data.');
        return;
    }
    if (!currentBooking.time) {
        alert('Selecione um horário antes de confirmar.');
        return;
    }

    // Salva dados no estado
    currentBooking.name    = inputNome.value.trim();
    currentBooking.date    = inputData.value;

    // Trava UI
    isSaving = true;
    if (btn) {
        btn.disabled = true;
        if (btnText)    btnText.textContent = 'Agendando…';
        if (btnSpinner) btnSpinner.style.display = 'inline-block';
    }

    try {
        const response = await saveToSheet(currentBooking);
        const result   = await response.json();

        if (result.message === 'ALREADY_TAKEN') {
            alert('⚡ Alguém acabou de reservar esse horário! Escolha outro.');
            await updateAvailableSlots();
        } else {
            showSuccessScreen();
        }

    } catch (err) {
        // Erro de rede: assumimos enviado e seguimos
        console.warn('[saveToSheet] Erro de rede, possível CORS do Apps Script:', err);
        showSuccessScreen();

    } finally {
        isSaving = false;
        if (btn) {
            btn.disabled = false;
            if (btnText)    btnText.textContent = 'Confirmar Agendamento';
            if (btnSpinner) btnSpinner.style.display = 'none';
        }
    }
}

// ─── Tela de Sucesso ─────────────────────────────────────────
function showSuccessScreen() {
    const detailsEl = document.getElementById('success-details');
    if (detailsEl) {
        detailsEl.innerHTML = `
            <div class="success-detail-item">
                <span class="label">Nome</span>
                <span class="value">${escapeHtml(currentBooking.name)}</span>
            </div>
            <div class="success-detail-item">
                <span class="label">Serviço</span>
                <span class="value">${escapeHtml(currentBooking.service)}</span>
            </div>
            <div class="success-detail-item">
                <span class="label">Data</span>
                <span class="value">${formatDateDisplay(currentBooking.date)}</span>
            </div>
            <div class="success-detail-item">
                <span class="label">Horário</span>
                <span class="value">${escapeHtml(currentBooking.time)}</span>
            </div>
        `;
    }
    showScreen('screen-success');
}

// ─── Reset ────────────────────────────────────────────────────
function resetApp() {
    // Limpa campos
    const inputNome = document.getElementById('input-name');
    const inputData = document.getElementById('input-data');
    if (inputNome) inputNome.value = '';
    if (inputData) inputData.value = '';

    // Reseta serviço para primeiro card
    document.querySelectorAll('.service-card').forEach((c, i) => {
        c.classList.toggle('active', i === 0);
    });

    // Esconde slots
    const section = document.getElementById('slots-section');
    const container = document.getElementById('time-slots-container');
    if (section)    section.style.display = 'none';
    if (container)  container.innerHTML = '';

    // Reseta estado
    currentBooking = { name: '', date: '', time: '', service: 'Corte' };
    isSaving = false;

    showScreen('screen-welcome');
}

// ─── Helpers ──────────────────────────────────────────────────

/** Escapa HTML para evitar XSS na tela de sucesso */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Destaca campo inválido brevemente */
function showFieldError(el, msg) {
    if (!el) return;
    el.style.borderColor = 'var(--danger)';
    el.style.boxShadow   = '0 0 0 3px rgba(224,82,82,0.15)';
    el.focus();
    setTimeout(() => {
        el.style.borderColor = '';
        el.style.boxShadow   = '';
    }, 2000);
    // Mostra mensagem de alerta acessível sem bloquear
    const label = el.previousElementSibling;
    if (label) {
        const original = label.textContent;
        label.style.color = 'var(--danger)';
        label.textContent = msg;
        setTimeout(() => {
            label.textContent = original;
            label.style.color = '';
        }, 2500);
    }
}