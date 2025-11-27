// Loading Screen Module for World Generation

let currentProgress = 0;
let targetProgress = 0;
let progressInterval = null;

/**
 * Show the loading screen with fade-in animation
 */
export function showLoadingScreen() {
    const loadingScreen = document.getElementById('world-loading-screen');
    if (!loadingScreen) {
        console.warn('Loading screen element not found');
        return;
    }
    
    // Hide ALL UI elements immediately
    const titleScreen = document.getElementById('title-screen');
    const newsReel = document.getElementById('news-reel');
    const audioWarning = document.querySelector('.audio-warning');
    const uiButtons = document.querySelectorAll('.ui-btn, .tech-toggle-btn');
    const panels = document.querySelectorAll('#world-gen-panel, #settings-panel, #tech-info-panel');
    const countdownTimer = document.getElementById('countdown-timer');
    
    // Hide title screen
    if (titleScreen) {
        titleScreen.style.opacity = '0';
        titleScreen.style.visibility = 'hidden';
        titleScreen.style.pointerEvents = 'none';
        titleScreen.style.display = 'none';
    }
    
    // Hide news reel
    if (newsReel) {
        newsReel.style.opacity = '0';
        newsReel.style.visibility = 'hidden';
        newsReel.style.pointerEvents = 'none';
        newsReel.style.display = 'none';
    }
    
    // Hide audio warning
    if (audioWarning) {
        audioWarning.style.opacity = '0';
        audioWarning.style.visibility = 'hidden';
        audioWarning.style.pointerEvents = 'none';
        audioWarning.style.display = 'none';
    }
    
    // Hide all UI buttons
    uiButtons.forEach(btn => {
        if (btn) {
            btn.style.opacity = '0';
            btn.style.visibility = 'hidden';
            btn.style.pointerEvents = 'none';
            btn.style.display = 'none';
        }
    });
    
    // Hide all panels
    panels.forEach(panel => {
        if (panel) {
            panel.style.opacity = '0';
            panel.style.visibility = 'hidden';
            panel.style.pointerEvents = 'none';
            panel.style.display = 'none';
        }
    });
    
    // Hide countdown timer
    if (countdownTimer) {
        countdownTimer.style.display = 'none';
        countdownTimer.style.visibility = 'hidden';
    }
    
    // Reset progress
    currentProgress = 0;
    targetProgress = 0;
    updateProgress(0, 'Initializing world generation...');
    
    // Show loading screen
    loadingScreen.classList.remove('world-loading-screen-hidden');
    loadingScreen.classList.add('world-loading-screen-visible');
}

/**
 * Hide the loading screen with fade-out animation
 */
export function hideLoadingScreen() {
    const loadingScreen = document.getElementById('world-loading-screen');
    if (!loadingScreen) {
        return;
    }
    
    // Stop any running progress animation
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    // Hide loading screen
    loadingScreen.classList.remove('world-loading-screen-visible');
    loadingScreen.classList.add('world-loading-screen-hidden');
    
    // Reset after transition
    setTimeout(() => {
        currentProgress = 0;
        targetProgress = 0;
    }, 500);
}

/**
 * Update progress bar and status text
 * @param {number} percentage - Progress percentage (0-100)
 * @param {string} statusText - Status message to display
 */
export function updateProgress(percentage, statusText) {
    const progressFill = document.getElementById('loading-progress-fill');
    const progressPercentage = document.getElementById('loading-percentage');
    const statusElement = document.getElementById('loading-status');
    
    if (!progressFill || !progressPercentage || !statusElement) {
        console.warn('Loading screen elements not found');
        return;
    }
    
    // Clamp percentage to 0-100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    targetProgress = clampedPercentage;
    
    // Update status text
    if (statusText) {
        statusElement.textContent = statusText;
    }
    
    // Animate progress bar smoothly
    animateProgress();
}

/**
 * Animate progress bar incrementally
 */
function animateProgress() {
    // Clear any existing animation
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    // Animate progress smoothly
    progressInterval = setInterval(() => {
        const progressFill = document.getElementById('loading-progress-fill');
        const progressPercentage = document.getElementById('loading-percentage');
        
        if (!progressFill || !progressPercentage) {
            clearInterval(progressInterval);
            progressInterval = null;
            return;
        }
        
        // Smooth increment towards target
        const diff = targetProgress - currentProgress;
        if (Math.abs(diff) < 0.1) {
            currentProgress = targetProgress;
            clearInterval(progressInterval);
            progressInterval = null;
        } else {
            currentProgress += diff * 0.1; // Smooth interpolation
        }
        
        // Update UI
        progressFill.style.width = `${currentProgress}%`;
        progressPercentage.textContent = `${Math.round(currentProgress)}%`;
        
        // Stop animation if we've reached the target
        if (Math.abs(currentProgress - targetProgress) < 0.1) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }, 16); // ~60fps animation
}

