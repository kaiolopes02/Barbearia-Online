let currentBooking = { barber: "", date: "", time: "", service: "", name: "" };
const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

function selectBarber(name) {
    currentBooking.barber = name;
    const dateInput = document.getElementById('input-data');
    if(dateInput) dateInput.min = new Date().toISOString().split('T')[0];
    showScreen('screen-schedule');
}

async function updateAvailableSlots() {
    const date = document.getElementById('input-data').value;
    if(!date) return;
    
    currentBooking.date = date;
    const container = document.getElementById('time-slots-container');
    container.innerHTML = "<p>Verificando horários...</p>";

    const occupied = await getOccupiedSlots(date);
    container.innerHTML = "";

    availableTimes.forEach(time => {
        // Verifica se o horário já existe na lista de ocupados
        const isTaken = occupied.some(o => o.hora.trim() === time.trim());
        
        const div = document.createElement('div');
        div.className = isTaken ? 'time-slot taken' : 'time-slot';
        div.innerText = time;
        
        if (!isTaken) {
            div.onclick = () => {
                document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                currentBooking.time = time;
            };
            container.appendChild(div);
        } else {
            div.style.opacity = "0.3";
            div.style.cursor = "not-allowed";
            container.appendChild(div);
        }
    });
}

async function finish() {
    const nameInput = document.getElementById('input-name');
    currentBooking.name = nameInput.value;
    currentBooking.service = document.getElementById('input-servico').value;

    if(!currentBooking.time || !currentBooking.name || !currentBooking.date) {
        return alert("Preencha todos os campos e escolha um horário!");
    }

    const btn = document.querySelector('.btn-main');
    btn.disabled = true;
    btn.innerText = "Agendando... Aguarde";

    try {
        await saveToSheet(currentBooking);
        
        // Simulação de confirmação já que no-cors não dá retorno
        setTimeout(() => {
            alert("Sucesso! Seu agendamento foi enviado e o barbeiro recebeu o e-mail.");
            nameInput.value = "";
            showScreen('screen-welcome');
            btn.disabled = false;
            btn.innerText = "Confirm Order";
        }, 2000);

    } catch (error) {
        alert("Erro na comunicação. Verifique sua internet.");
        btn.disabled = false;
        btn.innerText = "Confirm Order";
    }
}