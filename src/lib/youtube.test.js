import { expect, test } from 'bun:test';
import { getYouTubeId, getYouTubeStart } from './youtube';

test('getYouTubeId reads every link shape the editor can paste', () => {
  expect(getYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  expect(getYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30')).toBe(
    'dQw4w9WgXcQ'
  );
  expect(getYouTubeId('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe(
    'dQw4w9WgXcQ'
  );
  expect(getYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
    'dQw4w9WgXcQ'
  );
  expect(getYouTubeId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe(
    'dQw4w9WgXcQ'
  );
  expect(getYouTubeId('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
    'dQw4w9WgXcQ'
  );
});

test('getYouTubeId rejects anything that is not a video link', () => {
  expect(getYouTubeId('https://vimeo.com/12345')).toBe(null);
  expect(getYouTubeId('https://www.youtube.com/@channel')).toBe(null);
  expect(getYouTubeId('not a url')).toBe(null);
  expect(getYouTubeId(undefined)).toBe(null);
});

test('getYouTubeStart normalises both timestamp forms', () => {
  expect(getYouTubeStart('https://youtu.be/dQw4w9WgXcQ?t=90')).toBe(90);
  expect(getYouTubeStart('https://youtu.be/dQw4w9WgXcQ?t=1m30s')).toBe(90);
  expect(getYouTubeStart('https://youtu.be/dQw4w9WgXcQ?start=45')).toBe(45);
  expect(getYouTubeStart('https://youtu.be/dQw4w9WgXcQ')).toBe(null);
});
