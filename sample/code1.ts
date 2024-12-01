const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
document.body.appendChild(canvas);

const view = { x: window.innerWidth, y: window.innerHeight };
canvas.width = view.x;
canvas.height = view.y;
function render(time: number) {
    ctx.clearRect(0, 0, view.x, view.y);
    ctx.fillStyle = "blue";

    for (let i = 0; i < 10; i++) {
        const v = (Math.sin(time / 800 - Math.PI / 2 - i * 0.2) + 1) / 2;
        ctx.fillRect(20 + v * (view.x - 40 - 20), 20 + (20 + 10) * i, 20, 20);
    }

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
