// Import ambient sound functions (will be loaded when needed)
let ambientSoundModule = null;
async function getAmbientSoundModule() {
    if (!ambientSoundModule) {
        ambientSoundModule = await import('./ambient-sound.js');
    }
    return ambientSoundModule;
}

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

export function setupSettingsPanel() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const closeBtn = document.getElementById('close-settings');

    if (!settingsBtn || !settingsPanel) {
        console.warn('Settings panel elements not found');
        return;
    }

    // Initialize panel as hidden
    settingsPanel.classList.add('settings-panel-hidden');
    settingsPanel.classList.remove('settings-panel-visible');

    // Show panel when Settings button is clicked
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Disable countdown timer and auto-hide logic
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        // Hide and remove the countdown timer
        const timer = document.getElementById('countdown-timer');
        if (timer) {
            timer.style.display = 'none';
        }
        
        settingsPanel.classList.remove('settings-panel-hidden');
        settingsPanel.classList.add('settings-panel-visible');
    });

    // Close panel when close button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsPanel.classList.remove('settings-panel-visible');
            settingsPanel.classList.add('settings-panel-hidden');
        });
    }

    // Setup Tab Navigation
    setupSettingsTabs();

    // Setup Audio Panel (after tabs so elements exist)
    setupAudioPanel();
}

function setupSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.settings-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetTab = tab.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(`tab-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function setupAudioPanel() {
    const masterAudioToggle = document.getElementById('toggle-master-audio');
    const musicToggle = document.getElementById('toggle-music');
    const bgMusic = document.getElementById('bg-music');

    if (!masterAudioToggle || !musicToggle || !bgMusic) {
        console.warn('Audio panel elements not found');
        return;
    }

    // Initialize audio state from localStorage or defaults
    const masterAudioEnabled = localStorage.getItem('masterAudioEnabled') !== 'false';
    const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    const masterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;
    const musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 1.0;

    masterAudioToggle.checked = masterAudioEnabled;
    musicToggle.checked = musicEnabled;

    // Initialize volume sliders
    setupVolumeSlider('master', masterVolume);
    setupVolumeSlider('music', musicVolume);

    // Apply initial state
    applyAudioSettings(masterAudioEnabled, musicEnabled, masterVolume, musicVolume);

    // Update slider disabled states
    updateSliderStates();

    // Master Audio Toggle
    masterAudioToggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        localStorage.setItem('masterAudioEnabled', enabled);
        const masterVol = parseFloat(localStorage.getItem('masterVolume')) || 1.0;
        const musicVol = parseFloat(localStorage.getItem('musicVolume')) || 1.0;
        applyAudioSettings(enabled, musicToggle.checked, masterVol, musicVol);
        updateSliderStates();
        console.log('Master Audio:', enabled ? 'ON' : 'OFF');
    });

    // Music Toggle
    musicToggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        localStorage.setItem('musicEnabled', enabled);
        const masterVol = parseFloat(localStorage.getItem('masterVolume')) || 1.0;
        const musicVol = parseFloat(localStorage.getItem('musicVolume')) || 1.0;
        applyAudioSettings(masterAudioToggle.checked, enabled, masterVol, musicVol);
        updateSliderStates();
        console.log('Background Music:', enabled ? 'ON' : 'OFF');
    });
}

function updateSliderStates() {
    const masterToggle = document.getElementById('toggle-master-audio');
    const musicToggle = document.getElementById('toggle-music');
    const masterControl = document.querySelector('#tab-audio .audio-control-item:first-child');
    const musicControl = document.querySelector('#tab-audio .audio-control-item:last-child');

    if (masterControl) {
        if (masterToggle && !masterToggle.checked) {
            masterControl.classList.add('disabled');
        } else {
            masterControl.classList.remove('disabled');
        }
    }

    if (musicControl) {
        if (musicToggle && !musicToggle.checked) {
            musicControl.classList.add('disabled');
        } else {
            musicControl.classList.remove('disabled');
        }
    }
}

function setupVolumeSlider(type, initialValue) {
    const slider = document.getElementById(`${type}-volume-slider`);
    const track = slider?.querySelector('.volume-slider-track');
    const fill = document.getElementById(`${type}-volume-fill`);
    const handle = document.getElementById(`${type}-volume-handle`);
    const percentage = document.getElementById(`${type}-volume-percentage`);

    if (!slider || !track || !fill || !handle || !percentage) {
        console.warn(`Volume slider elements not found for ${type}`);
        return;
    }

    let isDragging = false;
    let animationFrameId = null;

    // Set initial value
    updateSliderValue(type, initialValue, false);

    // Simple function to calculate percentage from mouse/touch position
    const getPercentageFromEvent = (clientX) => {
        const rect = track.getBoundingClientRect();
        const x = clientX - rect.left;
        return Math.max(0, Math.min(1, x / rect.width));
    };

    // Update slider value from event
    const updateFromEvent = (e, isDraggingFlag) => {
        const clientX = e.clientX || e.touches?.[0]?.clientX;
        if (clientX === undefined) return;
        
        const percent = getPercentageFromEvent(clientX);
        updateSliderValue(type, percent, isDraggingFlag);
    };

    // Start dragging
    const startDrag = (e) => {
        isDragging = true;
        slider.classList.add('dragging');
        e.preventDefault();
        e.stopPropagation();
        // Don't update position on mousedown - wait for first mousemove
    };

    // Handle drag movement
    const handleDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        animationFrameId = requestAnimationFrame(() => {
            updateFromEvent(e, true);
        });
    };

    // Stop dragging
    const stopDrag = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        isDragging = false;
        slider.classList.remove('dragging');
    };

    // Click on track to jump to position
    track.addEventListener('click', (e) => {
        // Only handle if not dragging and not clicking on handle
        if (!isDragging && e.target !== handle && !handle.contains(e.target)) {
            updateFromEvent(e, false);
        }
    });

    // Handle mouse events
    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        startDrag(e);
    });
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);

    // Handle touch events
    handle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startDrag(e);
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        animationFrameId = requestAnimationFrame(() => {
            updateFromEvent(e, true);
        });
    });
    
    document.addEventListener('touchend', stopDrag);
}

// Throttle tracking for slider updates
const sliderThrottle = {
    lastSave: {},
    lastAudioUpdate: {}
};

function updateSliderValue(type, value, isDragging = false) {
    const slider = document.getElementById(`${type}-volume-slider`);
    const fill = document.getElementById(`${type}-volume-fill`);
    const handle = document.getElementById(`${type}-volume-handle`);
    const percentage = document.getElementById(`${type}-volume-percentage`);

    if (!fill || !handle || !percentage) return;

    const clampedValue = Math.max(0, Math.min(1, value));
    const percentageValue = Math.round(clampedValue * 100);
    const percentageString = `${clampedValue * 100}%`;

    // Update visual elements instantly (no transitions during drag)
    fill.style.width = percentageString;
    handle.style.left = percentageString;
    percentage.textContent = `${percentageValue}%`;

    // Save to localStorage (throttle during dragging to reduce writes)
    const now = Date.now();
    if (!isDragging || !sliderThrottle.lastSave[type] || now - sliderThrottle.lastSave[type] > 50) {
        localStorage.setItem(`${type}Volume`, clampedValue.toString());
        sliderThrottle.lastSave[type] = now;
    }

    // Apply to audio (throttle during dragging, but update more frequently for smooth audio)
    if (!isDragging || !sliderThrottle.lastAudioUpdate[type] || now - sliderThrottle.lastAudioUpdate[type] > 16) {
        applyAudioSettings(
            document.getElementById('toggle-master-audio')?.checked ?? true,
            document.getElementById('toggle-music')?.checked ?? true,
            type === 'master' ? clampedValue : parseFloat(localStorage.getItem('masterVolume')) || 1.0,
            type === 'music' ? clampedValue : parseFloat(localStorage.getItem('musicVolume')) || 1.0
        );
        sliderThrottle.lastAudioUpdate[type] = now;
    }
}

function applyAudioSettings(masterEnabled, musicEnabled, masterVolume, musicVolume) {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;

    // Clamp volumes
    const masterVol = Math.max(0, Math.min(1, masterVolume || 1.0));
    const musicVol = Math.max(0, Math.min(1, musicVolume || 1.0));

    // Control ambient sound volume (async, but non-blocking)
    getAmbientSoundModule().then(module => {
        const { stopAmbientSound, setAmbientVolume, isAmbientPlaying } = module;
        
        if (!masterEnabled) {
            // Master audio off - stop ambient sound if playing
            if (isAmbientPlaying()) {
                stopAmbientSound();
            }
        } else {
            // Master on - update ambient sound volume
            setAmbientVolume(masterVol);
        }
    }).catch(err => {
        // Ambient sound module not available yet (not in first-person mode)
        // This is fine, volume will be set when entering first-person mode
    });

    if (!masterEnabled) {
        // Master audio off - mute everything
        bgMusic.volume = 0;
        bgMusic.pause();
    } else if (musicEnabled) {
        // Master on, music on - apply volume (master * music)
        bgMusic.volume = masterVol * musicVol;
        if (bgMusic.paused) {
            bgMusic.play().catch(err => {
                console.warn('Could not play music:', err);
            });
        }
    } else {
        // Master on, music off - mute music but keep master enabled
        bgMusic.volume = 0;
        bgMusic.pause();
    }
}

export function setupWorldGenPanel() {
    const playBtn = document.getElementById('play-btn');
    const worldGenPanel = document.getElementById('world-gen-panel');
    const closeBtn = document.getElementById('close-world-gen');

    if (!playBtn || !worldGenPanel) {
        console.warn('World gen panel elements not found');
        return;
    }

    // Initialize panel as hidden
    worldGenPanel.classList.add('world-gen-panel-hidden');
    worldGenPanel.classList.remove('world-gen-panel-visible');

    // Show panel when Play button is clicked
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Disable countdown timer and auto-hide logic
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        // Hide and remove the countdown timer
        const timer = document.getElementById('countdown-timer');
        if (timer) {
            timer.style.display = 'none';
        }
        
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

    // Handle toggle switches
    const treeToggle = document.getElementById('toggle-trees');
    const lightsToggle = document.getElementById('toggle-lights');
    const houseToggle = document.getElementById('toggle-house');
    const hillsToggle = document.getElementById('toggle-hills');

    if (treeToggle) {
        treeToggle.addEventListener('change', (e) => {
            console.log('Trees:', e.target.checked ? 'ON' : 'OFF');
            // TODO: Implement tree visibility toggle
        });
    }

    if (lightsToggle) {
        lightsToggle.addEventListener('change', (e) => {
            console.log('Christmas Lights:', e.target.checked ? 'ON' : 'OFF');
            // TODO: Implement lights visibility toggle
        });
    }

    if (houseToggle) {
        houseToggle.addEventListener('change', (e) => {
            console.log('House:', e.target.checked ? 'ON' : 'OFF');
            // TODO: Implement house visibility toggle
        });
    }

    if (hillsToggle) {
        hillsToggle.addEventListener('change', (e) => {
            console.log('Hills:', e.target.checked ? 'ON' : 'OFF');
            // TODO: Implement hills visibility toggle
        });
    }
    
    // Handle Generate World button
    const generateBtn = document.getElementById('generate-world-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            // Read toggle states
            const options = {
                trees: treeToggle ? treeToggle.checked : true,
                lights: lightsToggle ? lightsToggle.checked : true,
                house: houseToggle ? houseToggle.checked : true,
                hills: hillsToggle ? hillsToggle.checked : true
            };
            
            // Disable button during generation
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            
            // Import modules
            const { regenerateWorld, enterFirstPersonMode } = await import('./main.js');
            const { showLoadingScreen, hideLoadingScreen, updateProgress } = await import('./loading-screen.js');
            
            try {
                // Hide world generation panel immediately
                worldGenPanel.classList.remove('world-gen-panel-visible');
                worldGenPanel.classList.add('world-gen-panel-hidden');
                
                // Show loading screen (this will hide all UI elements)
                showLoadingScreen();
                
                // Create progress callback
                const progressCallback = (percentage, statusText) => {
                    updateProgress(percentage, statusText);
                };
                
                // Regenerate world with progress tracking
                const groundHeight = await regenerateWorld(options, progressCallback);
                
                // Show "Entering World..." message
                updateProgress(100, 'Entering world...');
                
                // Small delay to show the final message
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Hide loading screen
                hideLoadingScreen();
                
                // Small delay for smooth transition
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Enter first-person mode
                enterFirstPersonMode(groundHeight);
                
                // Ensure all UI is hidden (loading screen already did this, but double-check)
                hideUI();
                hideGameUIButtons();
                
                console.log('World generated and first-person mode activated');
            } catch (error) {
                console.error('Error generating world:', error);
                
                // Hide loading screen on error
                const { hideLoadingScreen } = await import('./loading-screen.js');
                hideLoadingScreen();
                
                // Restore UI elements that were hidden
                const titleScreen = document.getElementById('title-screen');
                const newsReel = document.getElementById('news-reel');
                const audioWarning = document.querySelector('.audio-warning');
                const uiButtons = document.querySelectorAll('.ui-btn, .tech-toggle-btn');
                
                if (titleScreen) {
                    titleScreen.style.opacity = '';
                    titleScreen.style.visibility = '';
                    titleScreen.style.pointerEvents = '';
                    titleScreen.style.display = '';
                }
                
                if (newsReel) {
                    newsReel.style.opacity = '';
                    newsReel.style.visibility = '';
                    newsReel.style.pointerEvents = '';
                    newsReel.style.display = '';
                }
                
                if (audioWarning) {
                    audioWarning.style.opacity = '';
                    audioWarning.style.visibility = '';
                    audioWarning.style.pointerEvents = '';
                    audioWarning.style.display = '';
                }
                
                uiButtons.forEach(btn => {
                    if (btn) {
                        btn.style.opacity = '';
                        btn.style.visibility = '';
                        btn.style.pointerEvents = '';
                        btn.style.display = '';
                    }
                });
                
                // Reset button
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate World';
                
                // Show world gen panel again
                worldGenPanel.classList.remove('world-gen-panel-hidden');
                worldGenPanel.classList.add('world-gen-panel-visible');
                worldGenPanel.style.opacity = '';
                worldGenPanel.style.visibility = '';
                worldGenPanel.style.pointerEvents = '';
                worldGenPanel.style.display = '';
            }
        });
    }
}

// Function to hide game UI buttons (used when entering first-person mode)
function hideGameUIButtons() {
    const uiToggle = document.getElementById('ui-toggle');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const techBtn = document.getElementById('tech-toggle-btn');
    const quitBtn = document.getElementById('quit-btn');
    
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

    // Clear any existing countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    let countdown = 5;
    timer.textContent = countdown;

    countdownInterval = setInterval(() => {
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
            countdownInterval = null;
            
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
        
        // Start music when splash is dismissed (if enabled)
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            // Check if music is enabled and apply volume
            const masterAudioEnabled = localStorage.getItem('masterAudioEnabled') !== 'false';
            const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
            const masterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;
            const musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 1.0;
            
            if (masterAudioEnabled && musicEnabled) {
                bgMusic.volume = masterVolume * musicVolume;
                bgMusic.play().then(() => {
                    console.log('✅ Background music started from splash screen!');
                }).catch(err => {
                    console.error('Could not start music:', err);
                });
            } else {
                bgMusic.volume = 0;
                console.log('Background music disabled in settings');
            }
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
let countdownInterval = null;

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
        // Restore cursor for play and settings buttons
        if (btn.id === 'play-btn' || btn.id === 'settings-btn') {
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
        // Check if we're in a WebView2 desktop application
        if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
            // Send message to C# to toggle fullscreen/windowed mode
            window.chrome.webview.postMessage('toggle-fullscreen');
        } else {
            // Fallback to browser fullscreen API for web version
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.warn(`Error enabling fullscreen: ${err.message}`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
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
    setupSettingsPanel();
    setupNewsReelSnowflakes();
    // Countdown timer will be started when splash screen is dismissed
    // setupCountdownTimer(); // Moved to splash dismissal
}
