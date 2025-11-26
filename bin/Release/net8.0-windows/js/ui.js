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
            
            // Completely remove timer from DOM
            timer.style.display = 'none';
            
            // Use shared hideUI function to maintain state consistency and enable double-click wake
            hideUI();
            
            // Add transition for smooth fade
            if (title) {
                title.style.transition = 'opacity 1s ease';
            }
            
            // Get all UI buttons and completely hide them
            const uiToggle = document.getElementById('ui-toggle');
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            const techBtn = document.getElementById('tech-toggle-btn');
            const newsReel = document.getElementById('news-reel');
            const quitBtn = document.getElementById('quit-btn');
            
            // Completely remove buttons from layout - no hover, no click, nothing
            const hideButton = (btn) => {
                if (btn) {
                    btn.style.transition = 'opacity 0.5s ease';
                    btn.style.opacity = '0';
                    btn.style.pointerEvents = 'none';
                    btn.style.cursor = 'default';
                    btn.classList.add('ui-hidden');
                    // After fade, completely remove from layout
                    setTimeout(() => {
                        btn.style.display = 'none';
                        btn.style.visibility = 'hidden';
                        btn.style.position = 'absolute';
                        btn.style.left = '-9999px';
                        btn.style.top = '-9999px';
                        btn.style.width = '0';
                        btn.style.height = '0';
                        btn.style.overflow = 'hidden';
                    }, 500);
                }
            };
            
            hideButton(uiToggle);
            hideButton(fullscreenBtn);
            hideButton(techBtn);
            hideButton(quitBtn);
            
            if (newsReel) {
                newsReel.style.transition = 'opacity 1s ease';
                newsReel.style.opacity = '0';
                newsReel.style.pointerEvents = 'none';
                setTimeout(() => {
                    newsReel.style.display = 'none';
                }, 1000);
            }
        }
    }, 1000);
}

export function setupSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    const splashButton = document.getElementById('splash-continue');
    
    if (!splashScreen) {
        console.warn('Splash screen not found, starting app immediately');
        import('./main.js').then(({ startApp }) => startApp());
        return;
    }
    
    let dismissed = false;
    
    const dismissSplash = () => {
        if (dismissed) return;
        dismissed = true;
        
        console.log('Dismissing splash screen...');
        
        // Hide splash screen with transition
        splashScreen.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
        splashScreen.style.opacity = '0';
        splashScreen.style.visibility = 'hidden';
        splashScreen.style.pointerEvents = 'none';
        
        // Remove classes
        splashScreen.classList.remove('splash-screen-visible');
        splashScreen.classList.add('splash-screen-hidden');
        
        // Show canvas now that splash is dismissed (scene was already loading in background)
        setTimeout(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                canvas.style.display = 'block';
                console.log('✅ Canvas revealed - scene was already loaded!');
            }
        }, 100);
        
        // Start music when splash is dismissed
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            bgMusic.play().then(() => {
                console.log('✅ Background music started from splash screen!');
            }).catch(err => {
                console.error('Could not start music:', err);
            });
        }
        
        // Start the countdown timer now that splash is dismissed
        setupCountdownTimer();
        
        // App is already started and world generation is complete!
        // No need to call startApp() again
    };
    
    // Dismiss on button click
    if (splashButton) {
        splashButton.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissSplash();
        });
    }
    
    // Dismiss on any click on the splash screen background
    splashScreen.addEventListener('click', (e) => {
        if (e.target === splashScreen || e.target.closest('.splash-content') === null) {
            dismissSplash();
        }
    });
}

// Shared UI state and functions - accessible to countdown timer
let uiVisible = true;

// Global UI control functions - can be called from anywhere
function hideUI() {
    uiVisible = false;
    const title = document.getElementById('title-screen');
    const uiBtn = document.getElementById('ui-toggle');
    const menuContainer = document.querySelector('.menu-container');
    const menuButtons = document.querySelectorAll('.menu-btn');
    
    if (title) {
        title.style.opacity = '0';
        title.style.pointerEvents = 'none';
        title.classList.add('ui-hidden');
    }
    if (uiBtn) uiBtn.innerText = 'Show UI';
    
    // Disable menu buttons - completely remove interactivity
    if (menuContainer) {
        menuContainer.style.pointerEvents = 'none';
        menuContainer.classList.add('ui-hidden');
    }
    menuButtons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.style.cursor = 'default';
        btn.classList.add('ui-hidden');
    });
}

function showUI() {
    uiVisible = true;
    const title = document.getElementById('title-screen');
    const uiBtn = document.getElementById('ui-toggle');
    const menuContainer = document.querySelector('.menu-container');
    const menuButtons = document.querySelectorAll('.menu-btn');
    const newsReel = document.getElementById('news-reel');
    const audioWarning = document.querySelector('.audio-warning');
    
    if (title) {
        title.style.opacity = '1';
        title.style.pointerEvents = 'auto';
        title.classList.remove('ui-hidden');
        // Reset transition to CSS default (remove inline override from countdown timer)
        title.style.transition = '';
    }
    if (uiBtn) uiBtn.innerText = 'Hide UI';
    
    // Ensure audio warning is visible and properly positioned
    if (audioWarning) {
        audioWarning.style.opacity = '';
        audioWarning.style.pointerEvents = '';
        audioWarning.classList.remove('ui-hidden');
    }
    
    // Enable menu buttons
    if (menuContainer) {
        menuContainer.style.pointerEvents = 'auto';
        menuContainer.classList.remove('ui-hidden');
    }
    menuButtons.forEach(btn => {
        btn.classList.remove('ui-hidden');
        btn.style.pointerEvents = 'auto';
        // Only restore cursor for play button, others stay not-allowed
        if (btn.id === 'play-btn') {
            btn.style.cursor = 'pointer';
        }
    });
    
    // Restore news reel that was hidden by countdown timer
    if (newsReel) {
        newsReel.style.display = '';
        newsReel.style.opacity = '1';
        newsReel.style.pointerEvents = 'auto';
        newsReel.classList.remove('ui-hidden');
    }
    
    // Restore UI buttons that were hidden by countdown timer
    const allUIButtons = document.querySelectorAll('.ui-btn, .tech-toggle-btn');
    allUIButtons.forEach(btn => {
        if (btn && btn.classList.contains('ui-hidden')) {
            btn.classList.remove('ui-hidden');
            btn.style.display = '';
            btn.style.visibility = '';
            btn.style.position = '';
            btn.style.left = '';
            btn.style.top = '';
            btn.style.width = '';
            btn.style.height = '';
            btn.style.overflow = '';
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }
    });
}

export function setupUI() {
    const uiBtn = document.getElementById('ui-toggle');
    const fsBtn = document.getElementById('fullscreen-btn');

    // Toggle UI Visibility
    uiBtn.addEventListener('click', () => {
        if (uiVisible) {
            hideUI();
        } else {
            showUI();
        }
    });

    // Double-click to restore UI when hidden (works after auto-hide too)
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

    // Quit Button
    const quitBtn = document.getElementById('quit-btn');
    if (quitBtn) {
        quitBtn.addEventListener('click', () => {
            // Send message to C# to close the application
            if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
                window.chrome.webview.postMessage('quit');
            } else {
                // Fallback: try to close the window
                window.close();
            }
        });
    }

    // Setup splash screen FIRST (before everything else)
    setupSplashScreen();
    
    // These will be set up after splash is dismissed (in startApp)
    // But we can set up the event handlers now
    setupTechInfoPanel();
    setupWorldGenPanel();
    setupNewsReelSnowflakes();
    // Countdown timer will be started when splash screen is dismissed
    // setupCountdownTimer(); // Moved to splash dismissal
}
