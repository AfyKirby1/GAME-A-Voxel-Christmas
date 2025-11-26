export function setupTechInfoPanel() {
    const toggleBtn = document.getElementById('tech-toggle-btn');
    const panel = document.getElementById('tech-info-panel');
    let panelVisible = false;

    if (!toggleBtn || !panel) {
        console.warn('Tech panel elements not found');
        return;
    }

    // Initialize panel as hidden
    panel.classList.add('tech-panel-hidden');
    panel.classList.remove('tech-panel-visible');

    // Toggle panel visibility
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panelVisible = !panelVisible;
        if (panelVisible) {
            panel.classList.remove('tech-panel-hidden');
            panel.classList.add('tech-panel-visible');
        } else {
            panel.classList.remove('tech-panel-visible');
            panel.classList.add('tech-panel-hidden');
        }
    });
}

export function setupWorldGenPanel() {
    const playBtn = document.getElementById('play-btn');
    const worldGenPanel = document.getElementById('world-gen-panel');
    const closeBtn = document.getElementById('close-world-gen');
    const generateBtn = document.getElementById('generate-world-btn');

    if (!playBtn || !worldGenPanel) {
        console.warn('World gen panel elements not found');
        return;
    }

    // Initialize panel as hidden
    worldGenPanel.classList.add('world-gen-panel-hidden');
    worldGenPanel.classList.remove('world-gen-panel-visible');

    // Populate values from config (will be imported in main.js)
    import('./config.js').then(({ SCENE_OPTS }) => {
        const worldSizeEl = document.getElementById('world-size');
        const treeCountEl = document.getElementById('tree-count');
        const snowCountEl = document.getElementById('snow-count');
        const leafCountEl = document.getElementById('leaf-count');

        if (worldSizeEl) worldSizeEl.textContent = `${SCENE_OPTS.worldRadius} blocks`;
        if (treeCountEl) treeCountEl.textContent = SCENE_OPTS.treeCount;
        if (snowCountEl) snowCountEl.textContent = SCENE_OPTS.snowCount.toLocaleString();
        if (leafCountEl) leafCountEl.textContent = SCENE_OPTS.leafCount.toLocaleString();
    });

    // Show panel when Play button is clicked
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        worldGenPanel.classList.remove('world-gen-panel-hidden');
        worldGenPanel.classList.add('world-gen-panel-visible');
    });

    // Close panel when close button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            worldGenPanel.classList.remove('world-gen-panel-visible');
            worldGenPanel.classList.add('world-gen-panel-hidden');
        });
    }

    // Handle generate world button
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            // Update progress
            const progressFill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');
            
            if (progressFill && progressText) {
                progressFill.style.width = '0%';
                progressText.textContent = 'Generating terrain...';
                
                // Simulate progress
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    progressFill.style.width = progress + '%';
                    
                    if (progress === 30) {
                        progressText.textContent = 'Placing trees...';
                    } else if (progress === 60) {
                        progressText.textContent = 'Adding particles...';
                    } else if (progress === 90) {
                        progressText.textContent = 'Finalizing...';
                    } else if (progress >= 100) {
                        clearInterval(interval);
                        progressText.textContent = 'World generated!';
                        generateBtn.disabled = true;
                        generateBtn.textContent = 'World Ready';
                        
                        // Close panel after a moment
                        setTimeout(() => {
                            worldGenPanel.classList.remove('world-gen-panel-visible');
                            worldGenPanel.classList.add('world-gen-panel-hidden');
                        }, 1000);
                    }
                }, 100);
            }
        });
    }
}

function setupNewsReelSnowflakes() {
    const newsContent = document.querySelector('#news-reel .news-content');
    if (!newsContent) return;

    const maxSnowflakes = 7;
    let activeSnowflakes = 0;

    function createSnowflake() {
        if (activeSnowflakes >= maxSnowflakes) return;

        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = '❄';
        
        // Random horizontal position (with padding)
        const containerWidth = newsContent.offsetWidth;
        const randomX = Math.random() * (containerWidth - 40) + 20; // 20px padding on each side
        
        // Random animation duration for variety (6-8 seconds - slower fall)
        const duration = 6 + Math.random() * 2;
        snowflake.style.left = `${randomX}px`;
        snowflake.style.top = '-10px';
        snowflake.style.animationDuration = `${duration}s`;
        
        // Minimal delay for faster entry
        snowflake.style.animationDelay = `${Math.random() * 0.3}s`;
        
        newsContent.appendChild(snowflake);
        activeSnowflakes++;

        // Remove snowflake when animation completes
        snowflake.addEventListener('animationend', () => {
            snowflake.remove();
            activeSnowflakes--;
        });
    }

    // Spawn initial snowflakes faster
    for (let i = 0; i < maxSnowflakes; i++) {
        setTimeout(() => createSnowflake(), i * 200);
    }

    // Continuously spawn new snowflakes at random intervals (faster spawning)
    function spawnLoop() {
        if (activeSnowflakes < maxSnowflakes) {
            createSnowflake();
        }
        // Random interval between 0.5-1.5 seconds (faster entry)
        const nextSpawn = 500 + Math.random() * 1000;
        setTimeout(spawnLoop, nextSpawn);
    }

    // Start the spawn loop after initial snowflakes
    setTimeout(spawnLoop, maxSnowflakes * 500);
}

function setupCountdownTimer() {
    const timer = document.getElementById('countdown-timer');
    const title = document.getElementById('title-screen');
    if (!timer || !title) return;

    let countdown = 5;
    timer.textContent = countdown;

    const countdownInterval = setInterval(() => {
        countdown--;
        timer.textContent = countdown;

        // Visual feedback as countdown approaches zero
        if (countdown === 3) {
            timer.classList.add('warning');
        } else if (countdown === 1) {
            timer.classList.remove('warning');
            timer.classList.add('critical');
        }

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            timer.style.opacity = '0';
            timer.style.pointerEvents = 'none';
            
            // Fade out the UI
            title.style.transition = 'opacity 1s ease';
            title.style.opacity = '0';
            title.style.pointerEvents = 'none';
            
            // Also fade out other UI elements
            const uiToggle = document.getElementById('ui-toggle');
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            const techBtn = document.getElementById('tech-toggle-btn');
            const newsReel = document.getElementById('news-reel');
            
            if (uiToggle) {
                uiToggle.style.transition = 'opacity 1s ease';
                uiToggle.style.opacity = '0';
            }
            if (fullscreenBtn) {
                fullscreenBtn.style.transition = 'opacity 1s ease';
                fullscreenBtn.style.opacity = '0';
            }
            if (techBtn) {
                techBtn.style.transition = 'opacity 1s ease';
                techBtn.style.opacity = '0';
            }
            if (newsReel) {
                newsReel.style.transition = 'opacity 1s ease';
                newsReel.style.opacity = '0';
            }
        }
    }, 1000);
}

export function setupUI() {
    const uiBtn = document.getElementById('ui-toggle');
    const fsBtn = document.getElementById('fullscreen-btn');
    const title = document.getElementById('title-screen');
    const menuContainer = document.querySelector('.menu-container');
    const menuButtons = document.querySelectorAll('.menu-btn');
    let uiVisible = true;

    function hideUI() {
        uiVisible = false;
        title.style.opacity = '0';
        title.style.pointerEvents = 'none';
        uiBtn.innerText = 'Show UI';
        
        // Disable menu buttons
        if (menuContainer) {
            menuContainer.style.pointerEvents = 'none';
        }
        menuButtons.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.cursor = 'not-allowed';
        });
    }

    function showUI() {
        uiVisible = true;
        title.style.opacity = '1';
        title.style.pointerEvents = 'auto';
        uiBtn.innerText = 'Hide UI';
        
        // Enable menu buttons
        if (menuContainer) {
            menuContainer.style.pointerEvents = 'auto';
        }
        menuButtons.forEach(btn => {
            btn.style.pointerEvents = 'auto';
            // Only restore cursor for play button, others stay not-allowed
            if (btn.id === 'play-btn') {
                btn.style.cursor = 'pointer';
            }
        });
    }

    // Toggle UI Visibility
    uiBtn.addEventListener('click', () => {
        if (uiVisible) {
            hideUI();
        } else {
            showUI();
        }
    });

    // Double-click to restore UI when hidden
    let lastClickTime = 0;
    document.addEventListener('dblclick', (e) => {
        // Only restore if UI is hidden and not clicking on UI elements
        if (!uiVisible && !e.target.closest('#title-screen') && !e.target.closest('.ui-btn') && !e.target.closest('.tech-toggle-btn')) {
            showUI();
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

    // Setup tech info panel
    setupTechInfoPanel();
    
    // Setup world generation panel
    setupWorldGenPanel();

    // Setup news reel snowflakes
    setupNewsReelSnowflakes();

    // Setup countdown timer
    setupCountdownTimer();
}
