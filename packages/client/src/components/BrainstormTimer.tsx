import { useState, useEffect, useRef } from 'react';
import '../styles/timer.css';

type MusicSource = 'lofi-girl' | 'youtube' | 'spotify' | 'none';

interface BrainstormTimerProps {
  onTimeUp?: () => void;
  initialMinutes?: number;
}

const MUSIC_SOURCES = {
  'lofi-girl': {
    name: '🎵 Lofi Girl',
    url: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    type: 'embed',
  },
  'youtube': {
    name: '🎶 Lo-fi Hip Hop',
    url: 'https://www.youtube.com/embed/rUxyKA_-grg',
    type: 'embed',
  },
  'spotify': {
    name: '🎼 Spotify Lofi',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn',
    type: 'embed',
  },
};

export default function BrainstormTimer({ onTimeUp, initialMinutes = 5 }: BrainstormTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [musicSource, setMusicSource] = useState<MusicSource>('none');
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(initialMinutes.toString());
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Timer countdown
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setShowNotification(true);
          onTimeUp?.();
          playNotificationSound();
          setTimeout(() => setShowNotification(false), 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onTimeUp]);

  // Music playback
  useEffect(() => {
    if (musicSource !== 'none' && audioRef.current) {
      audioRef.current.play().catch(() => {
        console.warn('Could not play audio - check autoplay permissions');
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [musicSource]);

  const playNotificationSound = () => {
    // Web Audio API for notification sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;

      // Create a simple beep sequence
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      oscillator.start(now);
      oscillator.stop(now + 0.5);
    } catch (e) {
      console.log('Notification sound not available');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleSetTime = (minutes: number) => {
    if (minutes > 0 && minutes <= 120) {
      setTimeLeft(minutes * 60);
      setInputMinutes(minutes.toString());
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialMinutes * 60);
  };

  const selectMusicSource = (source: MusicSource) => {
    setMusicSource(source);
    setShowMusicSelector(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="brainstorm-timer">
      {/* Timer Display */}
      <div className="timer-display">
        <div className={`timer-number ${isRunning ? 'running' : ''}`}>
          {displayTime}
        </div>
        <p className="timer-label">Brainstorm Focus Session</p>
      </div>

      {/* Quick Time Selection */}
      <div className="timer-presets">
        {[1, 3, 5, 10, 15, 20].map((min) => (
          <button
            key={min}
            onClick={() => handleSetTime(min)}
            className={`preset-btn ${Math.floor(timeLeft / 60) === min && !isRunning ? 'active' : ''}`}
            disabled={isRunning}
          >
            {min}m
          </button>
        ))}
      </div>

      {/* Main Controls */}
      <div className="timer-controls">
        <button
          onClick={toggleTimer}
          className={`timer-btn large ${isRunning ? 'pause' : 'play'}`}
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? '⏸' : '▶'}
        </button>
        <button
          onClick={resetTimer}
          className="timer-btn reset"
          title="Reset"
        >
          ⟲
        </button>
        <div className="music-control">
          <button
            onClick={() => setShowMusicSelector(!showMusicSelector)}
            className={`timer-btn music ${musicSource !== 'none' ? 'active' : ''}`}
            title="Music"
          >
            {musicSource !== 'none' ? '🔊' : '🔇'}
          </button>

          {showMusicSelector && (
            <div className="music-selector">
              <button
                onClick={() => selectMusicSource('none')}
                className={`music-option ${musicSource === 'none' ? 'active' : ''}`}
              >
                ❌ No Music
              </button>
              <button
                onClick={() => selectMusicSource('lofi-girl')}
                className={`music-option ${musicSource === 'lofi-girl' ? 'active' : ''}`}
              >
                {MUSIC_SOURCES['lofi-girl'].name}
              </button>
              <button
                onClick={() => selectMusicSource('youtube')}
                className={`music-option ${musicSource === 'youtube' ? 'active' : ''}`}
              >
                {MUSIC_SOURCES['youtube'].name}
              </button>
              <button
                onClick={() => selectMusicSource('spotify')}
                className={`music-option ${musicSource === 'spotify' ? 'active' : ''}`}
              >
                {MUSIC_SOURCES['spotify'].name}
              </button>
              <small className="music-hint">
                💡 Click to play lo-fi music while brainstorming
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Audio Element for lo-fi girl */}
      <audio
        ref={audioRef}
        src="https://www.lofigirlmusic.com/api/audio"
        loop
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />

      {/* Notification */}
      {showNotification && (
        <div className="timer-notification">
          <div className="notification-content">
            <div className="notification-icon">🎉</div>
            <p>Time's up! Great brainstorming session!</p>
            <p className="notification-subtitle">Ready for the next phase?</p>
          </div>
        </div>
      )}

      {/* Music Info */}
      {musicSource !== 'none' && (
        <div className="timer-music-info">
          <p className="music-playing">
            🎵 Playing: {MUSIC_SOURCES[musicSource].name}
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="timer-info">
        <small>
          💡 Tip: Set a timer, enable lo-fi music, and brainstorm without distractions!
        </small>
      </div>
    </div>
  );
}
