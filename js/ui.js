export function checkWebGPU() {
    const dot = document.getElementById('gpu-dot');
    const label = document.getElementById('gpu-label');

    if (navigator.gpu) {
        dot.style.backgroundColor = '#00ff00';
        dot.style.boxShadow = '0 0 8px #00ff00';
        label.innerText = "WebGPU: Supported (Unused)";
    } else {
        dot.style.backgroundColor = '#ff3333';
        dot.style.boxShadow = '0 0 8px #ff3333';
        label.innerText = "WebGPU: Unavailable";
    }
}

export function setupUI() {
    const uiBtn = document.getElementById('ui-toggle');
    const fsBtn = document.getElementById('fullscreen-btn');
    const title = document.getElementById('title-screen');
    let uiVisible = true;

    // Toggle UI Visibility
    uiBtn.addEventListener('click', () => {
        uiVisible = !uiVisible;
        if (uiVisible) {
            title.style.opacity = '1';
            title.style.pointerEvents = 'auto';
            uiBtn.innerText = 'Hide UI';
        } else {
            title.style.opacity = '0';
            title.style.pointerEvents = 'none';
            uiBtn.innerText = 'Show UI';
        }
    });

    // Toggle Fullscreen
    fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn(`Error enabling fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
}
