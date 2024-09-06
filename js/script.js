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
    canvas = document.getElementById("wheelCanvas");
    ctx = canvas.getContext("2d");
};

function openWheelModal() {
    document.getElementById('wheelModal').style.display = 'flex';
    resizeCanvas();
    drawWheel();
    spinWheel();  // Hacemos que la ruleta gire automáticamente al abrir el modal
}

function closeWheelModal() {
    document.getElementById('wheelModal').style.display = 'none';
}

window.onresize = resizeCanvas;

function resizeCanvas() {
    const modalContent = document.querySelector('.modal-content');
    canvas.width = modalContent.offsetWidth * 0.9; // La ruleta ocupará el 90% del ancho del modal
    canvas.height = canvas.width; // Mantener la ruleta como un círculo
    drawWheel();
}

function updateWheel() {
    participants = document.getElementById("participants").value.split(' ').map(p => p.trim()).filter(p => p !== '');
    arc = Math.PI / (participants.length / 2 || 1); // Si no hay participantes, evita división por cero
    drawWheel();
}

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const outsideRadius = canvas.width / 2.6;
    const textRadius = canvas.width / 3;
    const insideRadius = canvas.width / 8;

    if (participants.length === 0) {
        ctx.font = 'bold 20px Quicksand';
        ctx.fillText('Agrega participantes', canvas.width / 2 - ctx.measureText('Agrega participantes').width / 2, canvas.height / 2);
        return;
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    // Dibuja cada segmento
    for (let i = 0; i < participants.length; i++) {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i % colors.length];

        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, outsideRadius, angle, angle + arc, false);
        ctx.arc(canvas.width / 2, canvas.height / 2, insideRadius, angle + arc, angle, true);
        ctx.stroke();
        ctx.fill();

        ctx.save();
        ctx.fillStyle = "white";

        // Configurar fuente dinámicamente basada en el tamaño del canvas
        let fontSize = Math.min(canvas.width / 25, 16); // Ajustar tamaño de fuente dinámicamente
        ctx.font = `bold ${fontSize}px Quicksand`;

        // Colocar el texto alineado con el ángulo del segmento
        ctx.translate(canvas.width / 2 + Math.cos(angle + arc / 2) * textRadius, canvas.height / 2 + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);

        const text = participants[i];
        // Ajustar para que el texto no sobrepase el tamaño del segmento
        const textWidth = ctx.measureText(text).width;
        if (textWidth > arc * textRadius * 0.8) {
            ctx.scale(0.8, 0.8);  // Escalar el texto si es demasiado largo
        }

        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
    }

    // Dibuja la flecha
    drawArrow();
}

function drawArrow() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY - (canvas.width / 2 + 20)); // Punto izquierdo de la flecha
    ctx.lineTo(centerX + 10, centerY - (canvas.width / 2 + 20)); // Punto derecho de la flecha
    ctx.lineTo(centerX, centerY - (canvas.width / 2 - 10));      // Punta de la flecha
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
    document.getElementById('wheelModal').style.display = 'none'; // Cerrar modal de ruleta
    document.getElementById('winnerModal').style.display = 'flex'; // Abrir modal del ganador
    
    const winnerSound = document.getElementById('winnerSound');
    if (winnerSound) winnerSound.play();
}

function closeWinnerModal() {
    document.getElementById('winnerModal').style.display = 'none';
}

function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}
