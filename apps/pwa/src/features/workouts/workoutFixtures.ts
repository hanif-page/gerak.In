import type { Exercise } from '../../app/previewRoute';

export type WorkoutProps = { exercise: Exercise };

export const workoutFixtures = {
  'push-up': {
    label: 'Push-ups',
    recognized: 'PUSH UPS',
    repetitions: 10,
    summaryRepetitions: 10,
    calories: '20.1',
    duration: '02:00',
  },
  'jumping-jack': {
    label: 'Jumping Jacks',
    recognized: 'JUMPING JACKS',
    repetitions: 18,
    summaryRepetitions: 18,
    calories: '14.2',
    duration: '02:45',
  },
  auto: {
    label: 'Jumping Jacks',
    recognized: 'JUMPING JACKS',
    repetitions: 18,
    // The summary is a separate Figma snapshot, not a persisted active session.
    summaryRepetitions: 25,
    calories: '14.2',
    duration: '02:45',
  },
} satisfies Record<Exercise, {
  label: string;
  recognized: string;
  repetitions: number;
  summaryRepetitions: number;
  calories: string;
  duration: string;
}>;
