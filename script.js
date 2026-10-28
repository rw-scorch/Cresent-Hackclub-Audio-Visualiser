const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 300;

function testBars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const count = 40;
    const width = canvas.width / count;

    for (let i = 0; i < count; i++) {
        const height = 20 + Math.random() * 250;

        ctx.fillStyle = '#00FFFF';

        ctx.fillRect(
            i * width + 2,
            canvas.height - height,
            width - 4,
            height
        );
    }

    requestAnimationFrame(testBars);
}

testBars();