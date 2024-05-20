let ws = new WebSocket('wss://luchesi2-d44c6ac97358.herokuapp.com/:443');

const promptInput = document.getElementById('prompt-input');
const sendPromptButton = document.getElementById('send-prompt');
const activePromptContainer = document.getElementById('active-prompt-container');
const activePromptElement = document.getElementById('active-prompt');
const timerElement = document.getElementById('timer');
const timerBar = document.getElementById('timer-bar');
const promptList = document.getElementById('prompt-list');

let promptQueue = [];
let activePrompt = null;
let countdown = null;

sendPromptButton.addEventListener('click', function() {
    const promptText = promptInput.value;
    promptInput.value = '';
    addPromptToList(promptText);
    animateSendButton();
});

function animateSendButton() {
    // Anima o botão para mostrar um emoji feliz
    sendPromptButton.innerHTML = "😊";
    gsap.fromTo(sendPromptButton, { scale: 1 }, { scale: 1, duration: 0.2, onComplete: () => {
        gsap.to(sendPromptButton, { scale: 1, duration: 0.2, delay: 0.1, onComplete: () => {
            sendPromptButton.innerHTML = "Enviar Prompt";  // Volta ao texto normal
        }});
    }});
}

function addPromptToList(prompt) {
    if (activePrompt === null) {
        // Se não há prompt ativo, define este como ativo
        setActivePrompt(prompt);
    } else {
        // Caso contrário, adiciona na fila de prompts
        const li = document.createElement('li');
        li.textContent = prompt;
        promptList.appendChild(li);
        promptQueue.push(li);
        gsap.from(li, { duration: 0.5, opacity: 0, x: -100, ease: "power2.in" });
    }
}

function setActivePrompt(prompt) {
    activePrompt = prompt;
    activePromptElement.textContent = prompt;
    sendPromptWhenActive(prompt); // Envia o prompt para o WebSocket quando ativo
    animateActivePrompt();
}

function sendPromptWhenActive(prompt) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(prompt);
    } else {
        setTimeout(() => sendPromptWhenActive(prompt), 100); // Tentar novamente após 100ms se o WebSocket não estiver pronto
    }
}

function animateActivePrompt() {
    let timeLeft = 40; // Total time in seconds
    let totalTime = 40;
    timerElement.textContent = timeLeft;
    timerBar.style.width = '0%'; // Inicia a barra de progresso
    gsap.to(timerBar, { width: '100%', duration: totalTime });

    countdown = setInterval(() => {
        timeLeft -= 1;
        timerElement.textContent = timeLeft;
        timerBar.style.width = `${(timeLeft / totalTime) * 100}%`; // Atualiza a largura da barra de progresso
        if (timeLeft <= 0) {
            clearInterval(countdown);
            fadeOutActivePrompt();
        }
    }, 1000);
}

function fadeOutActivePrompt() {
    // Animação para o prompt ativo desaparecendo
    gsap.to("#active-prompt-container", { duration: 1, opacity: 0, y: -50, ease: "power1.in", onComplete: () => {
        advancePromptQueue();
    }});
}

function advancePromptQueue() {
    activePromptContainer.style.opacity = 1;
    activePromptContainer.style.transform = 'translateY(0px)';
    timerBar.style.width = '0%'; // Reseta a barra de progresso

    if (promptQueue.length > 0) {
        const nextPromptElement = promptQueue.shift();
        nextPromptElement.remove();
        setActivePrompt(nextPromptElement.textContent);
    } else {
        activePrompt = null;
        activePromptElement.textContent = '';
        timerElement.textContent = '';
    }
}

ws.onopen = function() {
    console.log('WebSocket connection established.');
};

ws.onclose = function() {
    console.log('WebSocket closed. Attempting to reconnect...');
    setTimeout(() => {
        ws = new WebSocket('wss://socketapp-2b6ef9ee8296.herokuapp.com/');
    }, 1000);
};

ws