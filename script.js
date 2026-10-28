const audioInput = document.getElementById('audio-input');
const audioPlayer = document.getElementById('audio-player');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 300;

let audioContext;
let analyser;
let source;

audioInput.addEventListener('change', function() {
    const files = this.files;
    if (files.length === 0) return;
    
    audioPlayer.src = URL.createObjectURL(files[0]);
    audioPlayer.load();
    
    setupAudioContext();
});

function setupAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        
        source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 256; 
        
        drawVisualizer();
    }
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 1.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        
        const red = barHeight + (25 * (i / bufferLength));
        const green = 250 * (i / bufferLength);
        const blue = 50;
        
        ctx.fillStyle = `rgb(${red},${green},${blue})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        
        x += barWidth;
    }
}

