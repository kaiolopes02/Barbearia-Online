let currentBooking = { barber: "", date: "", time: "", service: "", name: "" };
const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

function selectBarber(name) {
    currentBooking.barber = name;
    // Define a data mínima como hoje
    const dateInput = document.getElementById('input-data');
    if(dateInput) dateInput.min = new Date().toISOString().split('T')[0];
    showScreen('screen-schedule');
}

async function updateAvailableSlots() {
    const date = document.getElementById('input-data').value;
    currentBooking.date = date;
    const container = document.getElementById('time-slots-container');
    container.innerHTML = "A carregar...";

    const occupied = await getOccupiedSlots(date);
    container.innerHTML = "";

    availableTimes.forEach(time => {
        const isTaken = occupied.some(o => o.hora === time);
        if (!isTaken) {
            const div = document.createElement('div');
            div.className = 'time-slot';
            div.innerText = time;
            div.onclick = () => {
                document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                currentBooking.time = time;
            };
            container.appendChild(div);
        }
    });
}

async function finish() {
    currentBooking.name = document.getElementById('input-name').value;
    currentBooking.service = document.getElementById('input-servico').value;

    if(!currentBooking.time || !currentBooking.name || !currentBooking.date) {
        return alert("Por favor, preencha o nome, a data e escolha um horário!");
    }

    try {
        await saveToSheet(currentBooking);
        const msg = `Olá! Agendamento feito: ${currentBooking.service} com ${currentBooking.barber} às ${currentBooking.time} no dia ${currentBooking.date}. Nome: ${currentBooking.name}`;
        window.location.href = `https://wa.me/${API_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    } catch (error) {
        alert("Erro ao salvar agendamento. Verifique a URL da API.");
    }
}
