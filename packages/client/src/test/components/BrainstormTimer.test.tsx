import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils';
import BrainstormTimer from '../../components/BrainstormTimer';

describe('BrainstormTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should render with initial time', () => {
    render(<BrainstormTimer initialMinutes={5} />);
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  it('should start timer when play button clicked', async () => {
    render(<BrainstormTimer initialMinutes={1} />);
    const playBtn = screen.getByRole('button', { name: /Start/i });

    await userEvent.click(playBtn);

    vi.advanceTimersByTime(1000);

    expect(screen.getByText('00:59')).toBeInTheDocument();
  });

  it('should pause timer when pause button clicked', async () => {
    render(<BrainstormTimer initialMinutes={1} />);
    const playBtn = screen.getByRole('button', { name: /Start/i });

    await userEvent.click(playBtn);
    vi.advanceTimersByTime(1000);

    const pauseBtn = screen.getByRole('button', { name: /Pause/i });
    await userEvent.click(pauseBtn);

    const currentTime = screen.getByText('00:59');
    vi.advanceTimersByTime(1000);

    expect(currentTime).toBeInTheDocument();
  });

  it('should reset timer when reset button clicked', async () => {
    render(<BrainstormTimer initialMinutes={1} />);
    const playBtn = screen.getByRole('button', { name: /Start/i });

    await userEvent.click(playBtn);
    vi.advanceTimersByTime(30000); // 30 seconds

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    await userEvent.click(resetBtn);

    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('should call onTimeUp when timer finishes', async () => {
    const onTimeUp = vi.fn();
    render(<BrainstormTimer initialMinutes={1} onTimeUp={onTimeUp} />);

    const playBtn = screen.getByRole('button', { name: /Start/i });
    await userEvent.click(playBtn);

    vi.advanceTimersByTime(60000); // 60 seconds

    expect(onTimeUp).toHaveBeenCalled();
  });

  it('should show notification when time is up', async () => {
    render(<BrainstormTimer initialMinutes={1} />);

    const playBtn = screen.getByRole('button', { name: /Start/i });
    await userEvent.click(playBtn);

    vi.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(screen.getByText(/Time's up/i)).toBeInTheDocument();
    });
  });

  it('should have preset time buttons', () => {
    render(<BrainstormTimer initialMinutes={5} />);

    expect(screen.getByRole('button', { name: '1m' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5m' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10m' })).toBeInTheDocument();
  });

  it('should update time when preset button clicked', async () => {
    render(<BrainstormTimer initialMinutes={5} />);

    const preset10m = screen.getByRole('button', { name: '10m' });
    await userEvent.click(preset10m);

    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('should show music selector when music button clicked', async () => {
    render(<BrainstormTimer />);

    const musicBtn = screen.getByRole('button', { name: /Music/i });
    await userEvent.click(musicBtn);

    expect(screen.getByText(/Lofi Girl/i)).toBeInTheDocument();
    expect(screen.getByText(/Lo-fi Hip Hop/i)).toBeInTheDocument();
  });
});

// Helper for afterEach
import { afterEach } from 'vitest';
