const audioInput = document.getElementById('audio-input');
const audioPlayer = document.getElementById('audio-player');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

let audioContext;
let analyser;
let source;
let animationId;
let frequencyData;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setupAudioContext() {
    if (!audioContext) {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            console.error('Web Audio API is not supported.');
            return false;
        }

        audioContext = new AudioContextClass();

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;

        frequencyData = new Uint8Array(analyser.frequencyBinCount);

        source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    return true;
}

async function activateAudio() {
    if (!setupAudioContext()) return;

    if (audioContext.state !== 'running') {
        await audioContext.resume();
    }

    if (animationId === undefined) {
        drawVisualizer();
    }
}

audioInput.addEventListener('change', async () => {
    const file = audioInput.files && audioInput.files[0];

    if (!file) return;

    if (!setupAudioContext()) return;

    audioPlayer.src = URL.createObjectURL(file);
    audioPlayer.load();

    try {
        await activateAudio();
    } catch (error) {
        console.error('Could not activate audio analysis:', error);
    }
});

audioPlayer.addEventListener('play', async () => {
    try {
        await activateAudio();
    } catch (error) {
        console.error('Could not resume audio context:', error);
    }
});

function drawVisualizer() {
    animationId = requestAnimationFrame(drawVisualizer);

    if (!analyser || !frequencyData) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (!width || !height) return;

    analyser.getByteFrequencyData(frequencyData);

    ctx.clearRect(0, 0, width, height);

    const barCount = 64;
    const gap = 2;
    const barWidth = width / barCount;
    const binsPerBar = Math.max(
        1,
        Math.floor(frequencyData.length / barCount)
    );

    for (let i = 0; i < barCount; i++) {
        let total = 0;

        for (let j = 0; j < binsPerBar; j++) {
            const index = i * binsPerBar + j;

            if (index < frequencyData.length) {
                total += frequencyData[index];
            }
        }

        const average = total / binsPerBar;

        // Boost quieter frequencies so the bars remain visible.
        const boosted = Math.min(255, average * 1.5);
        const barHeight = Math.max(
            2,
            (boosted / 255) * height * 0.95
        );

        const x = i * barWidth;
        const y = height - barHeight;

        const hue = 185 + (i / barCount) * 125;

        const gradient = ctx.createLinearGradient(
            0, y, 0, height
        );

        gradient.addColorStop(0, `hsl(${hue}, 100%, 70%)`);
        gradient.addColorStop(1, `hsl(${hue}, 100%, 45%)`);

        ctx.fillStyle = gradient;

        ctx.fillRect(
            x + gap / 2,
            y,
            Math.max(1, barWidth - gap),
            barHeight
        );
    }
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();

// Draw a subtle idle display before music is selected.
function drawIdle() {
    if (!analyser) {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = '#202a40';

        for (let i = 0; i < 32; i++) {
            const barWidth = width / 32;
            const barHeight = 4 + (i % 5) * 3;

            ctx.fillRect(
                i * barWidth + 1,
                height - barHeight,
                barWidth - 2,
                barHeight
            );
        }

        requestAnimationFrame(drawIdle);
    }
}

drawIdle();
