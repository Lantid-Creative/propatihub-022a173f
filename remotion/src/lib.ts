import { interpolate } from "remotion";

export const C = {
  green: '#1F5C3F', greenLight: '#2A7A54', greenDark: '#163D2B',
  gold: '#D4942A', goldLight: '#E8B44C', cream: '#FAF7F2',
  dark: '#0F1A14', darkCard: '#1A2E22', white: '#FFFFFF',
  gray: '#94A3A8', grayLight: '#CBD5D0', red: '#C0392B',
};

export const fade = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

export const slideUp = (frame: number, start: number, dur = 20, dist = 40) =>
  interpolate(frame, [start, start + dur], [dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

export const slideLeft = (frame: number, start: number, dur = 20, dist = 60) =>
  interpolate(frame, [start, start + dur], [dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
