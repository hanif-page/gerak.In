import { previewHref } from '../../app/previewRoute';
import cpu from '../../assets/icons/cpu.svg';
import dumbbell from '../../assets/icons/dumbbell.svg';
import accessibility from '../../assets/icons/accessibility.svg';
import scanLine from '../../assets/icons/scan-line.svg';
import circle from '../../assets/icons/circle.svg';
import circleCheck from '../../assets/icons/circle-check.svg';
import type { WorkoutProps } from './workoutFixtures';
import './workouts.css';

const choices = [
  { exercise: 'push-up', label: 'Push-ups', icon: dumbbell },
  { exercise: 'jumping-jack', label: 'Jumping Jacks', icon: accessibility },
] as const;

export function WorkoutSetup({ exercise }: WorkoutProps) {
  return (
    <>
      <div className="workout-info">
        <img src={cpu} width={24} height={24} alt="" />
        <p>Choose a target exercise or preview TinyML auto-detection. Put on your armband when device tracking is connected.</p>
      </div>

      <section className="workout-choose" aria-labelledby="workout-choose-heading">
        <h2 id="workout-choose-heading">Choose your exercise</h2>
        <nav className="workout-choices" aria-label="Exercise selection">
          {choices.map((choice) => (
            <a
              key={choice.exercise}
              className="workout-exercise-card"
              href={previewHref('workout', choice.exercise)}
              aria-label={choice.label}
              aria-current={exercise === choice.exercise ? 'true' : undefined}
            >
              <div className="workout-exercise-icons">
                <img src={choice.icon} width={30} height={30} alt="" />
                {exercise === choice.exercise && <img src={circleCheck} width={20} height={20} alt="" />}
              </div>
              <span>{choice.label}</span>
            </a>
          ))}
          <a
            className="workout-auto-card"
            href={previewHref('workout', 'auto')}
            aria-label="Auto-Detect (TinyML)"
            aria-current={exercise === 'auto' ? 'true' : undefined}
          >
            <img src={scanLine} width={30} height={30} alt="" />
            <span className="workout-auto-copy">
              <strong>Auto-Detect (TinyML)</strong>
              <span>Let your movement decide.</span>
            </span>
            <img src={exercise === 'auto' ? circleCheck : circle} width={20} height={20} alt="" />
          </a>
        </nav>
      </section>

      <div className="bottom-action workout-bottom-action">
        <a className="primary-button workout-action" href={previewHref('active', exercise)}>
          Start Active Workout
        </a>
      </div>
    </>
  );
}
