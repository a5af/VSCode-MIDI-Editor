import { createStore } from 'solid-js/store';
import { PlaybackState } from '../utils/types';

const [playbackState, setPlaybackState] = createStore<PlaybackState>({
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  loop: {
    enabled: false,
    start: 0,
    end: 0
  }
});

export function play() {
  setPlaybackState({
    isPlaying: true,
    isPaused: false
  });
}

export function pause() {
  setPlaybackState({
    isPlaying: false,
    isPaused: true
  });
}

export function stop() {
  setPlaybackState({
    isPlaying: false,
    isPaused: false,
    currentTime: 0
  });
}

export function setCurrentTime(time: number) {
  setPlaybackState('currentTime', Math.max(0, time));
}

export function setLoop(enabled: boolean, start?: number, end?: number) {
  setPlaybackState('loop', {
    enabled,
    start: start ?? playbackState.loop.start,
    end: end ?? playbackState.loop.end
  });
}

export { playbackState };
