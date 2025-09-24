/**
 * AudioManager Class
 * Handles all background music and sound effects for the MBLEX app
 * Features: shuffle, skip, volume control, section-based playback
 */
class AudioManager {
    constructor() {
        // List of background music tracks
        this.songs = [
            'assets/sounds/Songs/main song for studying.mp3',
            'assets/sounds/Songs/Study Lofi.mp3',
            'assets/sounds/Songs/Study Lofi (1).mp3',
            'assets/sounds/Songs/Study Pop.mp3'
        ];
        
        this.currentSongIndex = 0;
        this.audioElement = null;
        this.isPlaying = false;
        this.audioMuted = false;
        this.volume = 0.3; // Default volume (30%)
        this.currentSection = null; // Track which section is active
        
        // Button references
        this.skipSongButton = null;
        this.audioToggleButton = null;
        this.volumeButton = null;
        
        this.hasUserInteracted = false; // Track if user has interacted with page

        this.init();
    }

    init() {
        // Set up user interaction detection for autoplay
        this.setupUserInteractionListener();

        // Get references to audio elements
        this.audioElement = document.getElementById('backgroundMusic');
        this.skipSongButton = document.getElementById('skipSongButton');
        this.audioToggleButton = document.getElementById('audioToggle');
        this.volumeButton = document.getElementById('volumeButton');
        
        if (!this.audioElement) {
            console.error('Audio element not found');
            return;
        }
        
        // Set initial volume
        this.audioElement.volume = this.volume;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Shuffle songs on initialization
        this.shuffleSongs();
        
        // Load user preferences
        this.loadUserPreferences();
        
        console.log('Audio Manager initialized');
    }
    
    setupEventListeners() {
        // Add one-time click listener to start music on first user interaction
        const startMusicOnFirstInteraction = () => {
            if (!this.isPlaying && !this.audioMuted && this.currentSection) {
                this.playCurrentSong();
            }
            // Remove listener after first interaction
            document.removeEventListener('click', startMusicOnFirstInteraction);
            document.removeEventListener('keydown', startMusicOnFirstInteraction);
        };
        
        document.addEventListener('click', startMusicOnFirstInteraction);
        document.addEventListener('keydown', startMusicOnFirstInteraction);
        
        // Skip song button
        if (this.skipSongButton) {
            this.skipSongButton.addEventListener('click', () => {
                this.skipToNextSong();
            });
        }
        
        // Audio toggle button
        if (this.audioToggleButton) {
            this.audioToggleButton.addEventListener('click', () => {
                this.toggleAudio();
            });
        }
        
        // Volume slider (real-time volume control)
        this.volumeSlider = document.getElementById('volumeSlider');
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                // Volume slider interaction should enable audio
                this.hasUserInteracted = true;
                this.setVolume(e.target.value);

                // If audio is not muted and we have a section, start playing
                if (!this.audioMuted && this.currentSection && !this.isPlaying) {
                    this.playCurrentSong();
                }
            });
        }
        
        // Audio element event listeners
        if (this.audioElement) {
            // Auto-play next song when current ends
            this.audioElement.addEventListener('ended', () => {
                this.playNextSong();
            });
            
            // Handle audio loading
            this.audioElement.addEventListener('loadstart', () => {
                console.log('Loading audio...');
            });
            
            // Handle successful loading
            this.audioElement.addEventListener('canplaythrough', () => {
                console.log('Audio ready to play');
            });
            
            // Handle audio errors
            this.audioElement.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                this.playNextSong(); // Try next song if current fails
            });
            
            // Volume change events
            this.audioElement.addEventListener('volumechange', () => {
                this.updateVolumeIcon();
            });
        }
    }
    
    /**
     * Fisher-Yates shuffle algorithm for randomizing playlist
     */
    shuffleSongs() {
        const shuffled = [...this.songs];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        this.songs = shuffled;
        this.currentSongIndex = 0;
        console.log('Playlist shuffled');
    }
    
    /**
     * Start music for a specific section
     * Different sections can have different behavior
     */
    startMusicForSection(section) {
        // If we're already in this section and music is playing, don't restart
        if (this.currentSection === section && this.isPlaying && !this.audioElement.paused) {
            console.log('Already playing music for section:', section);
            return;
        }
        
        this.currentSection = section;
        
        // All sections now have background music - user can control via mute/volume
        if (['main', 'study', 'test', 'chatbot', 'simulation'].includes(section)) {
            this.showSkipButton();
            if (!this.audioMuted) {
                // Only play if not already playing
                if (!this.isPlaying || this.audioElement.paused) {
                    this.playCurrentSong();
                }
            }
        }
    }
    
    /**
     * Stop music when leaving a section
     */
    stopMusicForSection(section) {
        if (this.currentSection === section) {
            this.stopMusic();
            this.hideSkipButton();
            this.currentSection = null;
        }
    }
    
    /**
     * Play the current song in the playlist
     */
    playCurrentSong() {
        if (!this.audioElement || this.audioMuted) return;
        
        const currentSong = this.songs[this.currentSongIndex];
        console.log('Playing:', currentSong);
        
        // Update audio source
        const source = this.audioElement.querySelector('source');
        if (source) {
            source.src = currentSong;
            this.audioElement.load(); // Reload with new source
        } else {
            // If no source element, set src directly
            this.audioElement.src = currentSong;
        }
        
        // Play with promise handling for autoplay policies
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    this.isPlaying = true;
                    this.updateAudioIcon(true);
                })
                .catch((error) => {
                    console.log('Autoplay prevented:', error);
                    // Show visual indicator that user needs to interact
                    this.showPlayPrompt();
                });
        }
    }
    
    /**
     * Play next song in the playlist
     */
    playNextSong() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        
        // Reshuffle if we've played all songs
        if (this.currentSongIndex === 0) {
            this.shuffleSongs();
        }
        
        if (!this.audioMuted && this.currentSection) {
            this.playCurrentSong();
        }
    }
    
    /**
     * Skip to next song
     */
    skipToNextSong() {
        console.log('Skipping to next song');
        if (this.audioElement && !this.audioElement.paused) {
            this.audioElement.pause();
        }
        this.playNextSong();
    }
    
    /**
     * Stop all music
     */
    stopMusic() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
        this.isPlaying = false;
        this.updateAudioIcon(false);
    }
    
    /**
     * Toggle audio on/off
     */
    toggleAudio() {
        // Manual button click should enable interaction flag
        this.hasUserInteracted = true;
        this.setMuted(!this.audioMuted);
    }
    
    /**
     * Set mute state
     */
    setMuted(muted) {
        this.audioMuted = muted;

        if (muted) {
            this.stopMusic();
        } else if (this.currentSection) {
            // Manual button click should enable interaction flag and bypass autoplay restrictions
            this.hasUserInteracted = true;
            this.playCurrentSong();
        }

        // Save preference securely
        window.secureStorage.setItem('audio-muted', muted);

        // Update UI
        this.updateAudioIcon(!muted);
    }
    
    /**
     * Cycle through volume levels
     */
    cycleVolume() {
        const volumeLevels = [0, 0.2, 0.5, 0.8, 1.0];
        const currentIndex = volumeLevels.findIndex(vol => Math.abs(vol - this.volume) < 0.1);
        const nextIndex = (currentIndex + 1) % volumeLevels.length;
        
        this.setVolume(volumeLevels[nextIndex]);
    }
    
    /**
     * Set volume level
     */
    setVolume(volume) {
        // Convert from slider range (0-100) to audio range (0-1)
        const normalizedVolume = volume / 100;
        this.volume = Math.max(0, Math.min(1, normalizedVolume));
        
        if (this.audioElement) {
            this.audioElement.volume = this.volume;
        }
        
        // Update slider value
        if (this.volumeSlider) {
            this.volumeSlider.value = volume;
            this.updateSliderTrack(volume);
        }
        
        // Save preference securely (save as 0-100 for user preference)
        window.secureStorage.setItem('audio-volume', volume);
        
        // Update UI
        this.updateVolumeIcon();
        
        console.log('Volume set to:', volume + '%');
    }
    
    /**
     * Update audio icon based on state
     */
    updateAudioIcon(playing) {
        const audioIcon = this.audioToggleButton?.querySelector('.audio-icon');
        if (audioIcon) {
            if (this.audioMuted) {
                audioIcon.textContent = '🔇';
            } else if (playing) {
                audioIcon.textContent = '🔊';
            } else {
                audioIcon.textContent = '🔈';
            }
        }
        
        // Update button title
        if (this.audioToggleButton) {
            this.audioToggleButton.title = this.audioMuted ? 'Unmute Audio' : 'Mute Audio';
        }
    }
    
    /**
     * Update volume icon based on level
     */
    updateVolumeIcon() {
        const volumeIcon = document.querySelector('.volume-control .volume-icon');
        if (volumeIcon) {
            if (this.volume === 0) {
                volumeIcon.textContent = '🔇';
            } else if (this.volume < 0.3) {
                volumeIcon.textContent = '🔈';
            } else if (this.volume < 0.7) {
                volumeIcon.textContent = '🔉';
            } else {
                volumeIcon.textContent = '🔊';
            }
        }
        
        // Update control title
        const volumeControl = document.querySelector('.volume-control');
        if (volumeControl) {
            volumeControl.title = `Volume: ${Math.round(this.volume * 100)}%`;
        }
    }
    
    /**
     * Update slider track visual based on volume
     */
    updateSliderTrack(volume) {
        if (this.volumeSlider) {
            const percentage = volume;
            this.volumeSlider.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
        }
    }
    
    /**
     * Show/hide skip button
     */
    showSkipButton() {
        if (this.skipSongButton) {
            this.skipSongButton.classList.remove('hidden');
        }
    }
    
    hideSkipButton() {
        if (this.skipSongButton) {
            this.skipSongButton.classList.add('hidden');
        }
    }
    
    /**
     * Get current song information
     */
    getCurrentSongName() {
        const fullPath = this.songs[this.currentSongIndex];
        return fullPath.split('/').pop().replace('.mp3', '');
    }
    
    /**
     * Show play prompt for autoplay prevention
     */
    showPlayPrompt() {
        if (this.audioToggleButton) {
            this.audioToggleButton.classList.add('pulse-animation');
            this.audioToggleButton.title = 'Click to start music';
            
            // Remove animation after a few seconds
            setTimeout(() => {
                this.audioToggleButton?.classList.remove('pulse-animation');
            }, 3000);
        }
    }
    
    /**
     * Set up listener for first user interaction to enable autoplay
     */
    setupUserInteractionListener() {
        const enableAudioOnInteraction = () => {
            if (!this.hasUserInteracted) {
                this.hasUserInteracted = true;
                console.log('First user interaction detected - enabling audio');

                // If we have a section set and music isn't muted, start playing
                if (this.currentSection && !this.audioMuted) {
                    this.playCurrentSong();
                }

                // Remove the event listeners after first interaction
                document.removeEventListener('click', enableAudioOnInteraction);
                document.removeEventListener('keydown', enableAudioOnInteraction);
                document.removeEventListener('touchstart', enableAudioOnInteraction);
            }
        };

        // Listen for any user interaction
        document.addEventListener('click', enableAudioOnInteraction);
        document.addEventListener('keydown', enableAudioOnInteraction);
        document.addEventListener('touchstart', enableAudioOnInteraction);
    }

    /**
     * Load user preferences
     */
    loadUserPreferences() {
        // Always start unmuted - user can manually mute if desired
        this.audioMuted = false;

        // Load volume preference securely
        const savedVolume = window.secureStorage.getItem('audio-volume', 50);
        if (typeof savedVolume === 'number') {
            // Convert saved volume (0-100) to audio range (0-1)
            this.volume = Math.max(0, Math.min(1, savedVolume / 100));

            if (this.audioElement) {
                this.audioElement.volume = this.volume;
            }

            // Update slider with saved volume value
            if (this.volumeSlider) {
                this.volumeSlider.value = savedVolume;
                this.updateSliderTrack(savedVolume);
            }
        } else {
            // Default volume 50%
            this.volume = 0.5;
            this.setVolume(50);
        }

        // Update UI
        this.updateAudioIcon(this.isPlaying);
        this.updateVolumeIcon();
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            currentSong: this.getCurrentSongName(),
            songIndex: this.currentSongIndex,
            totalSongs: this.songs.length,
            isPlaying: this.isPlaying,
            isMuted: this.audioMuted,
            volume: this.volume,
            currentSection: this.currentSection
        };
    }
}

// Create global instance
window.audioManager = new AudioManager();