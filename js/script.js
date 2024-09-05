let canvas, ctx;
let startAngle = 0;
let arc;
let spinTimeout = null;
let spinAngleStart = 10;
let spinTime = 0;
let spinTimeTotal = 0;
let participants = [];

const colors = ["#EE9B00", "#94D2BD", "#E9D8A6", "#CA6702", "#BB3E03", "#AE2012", "#0A9396", "#005F73"];

window.onload = function() {
    // Inicializar la ruleta vacía
    canvas = document.getElementById("wheelCanvas");
    ctx = canvas.getContext("2d");
    drawWheel();
};

function updateWheel() {
    participants = document.getElementById("participants").value.split(' ').map(p => p.trim()).filter(p => p !== '');
    arc = Math.PI / (participants.length / 2 || 1); // Si no hay participantes, evita división por cero
    drawWheel();
}

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const outsideRadius = 150;
    const textRadius = 120;
    const insideRadius = 50;

    if (participants.length === 0) {
        ctx.font = 'bold 20px Quicksand';
        ctx.fillText('Agrega participantes', 200 - ctx.measureText('Agrega participantes').width / 2, 200);
        return;
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.font = 'bold 14px Quicksand';

    // Dibuja cada segmento
    for (let i = 0; i < participants.length; i++) {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i % colors.length];

        ctx.beginPath();
        ctx.arc(200, 200, outsideRadius, angle, angle + arc, false);
        ctx.arc(200, 200, insideRadius, angle + arc, angle, true);
        ctx.stroke();
        ctx.fill();

        ctx.save();
        ctx.fillStyle = "white";
        ctx.translate(200 + Math.cos(angle + arc / 2) * textRadius, 200 + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = participants[i];
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
    }

    // Dibuja la flecha
    drawArrow();
}

function drawArrow() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(200 - 10, 200 - 160); // Punto izquierdo de la flecha
    ctx.lineTo(200 + 10, 200 - 160); // Punto derecho de la flecha
    ctx.lineTo(200, 200 - 130);      // Punta de la flecha
    ctx.closePath();
    ctx.fill();
}

function spinWheel() {
    if (participants.length < 2) {
        alert('Por favor, ingresa al menos dos participantes.');
        return;
    }

    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 4000;
    rotateWheel();
}

function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - (degrees % 360)) / arcd);
    const winner = participants[index];

    document.getElementById("winnerName").innerText = `¡El ganador es: ${winner}!`;
    document.getElementById('winnerModal').style.display = 'flex';
    
    const winnerSound = document.getElementById('winnerSound');
    winnerSound.play();
}

function closeModal() {
    document.getElementById('winnerModal').style.display = 'none';
}

function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}
