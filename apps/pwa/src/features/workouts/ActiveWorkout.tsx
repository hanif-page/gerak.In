import { previewHref } from '../../app/previewRoute';
import activity from '../../assets/icons/activity.svg';
import sparkles from '../../assets/icons/sparkles.svg';
import { workoutFixtures, type WorkoutProps } from './workoutFixtures';

export function ActiveWorkout({ exercise }: WorkoutProps) {
  const workout = workoutFixtures[exercise];
  const isAuto = exercise === 'auto';

  return (
    <section className="workout-active" aria-labelledby="workout-active-heading">
      <header className="workout-session-header">
        <div className="workout-session-top">
          <h1 id="workout-active-heading">
            <img src={activity} width={22} height={22} alt="" />
            Workout Session Active
          </h1>
          <span className="workout-inference" aria-label={`Preview only: AI Inference ${isAuto ? 'On' : 'Off'}`}>
            AI Inference {isAuto ? 'On' : 'Off'}
          </span>
        </div>
        <p className="workout-preview-status">PREVIEW SESSION · NO DEVICE CONNECTED</p>
      </header>

      <div className="workout-recognition">
        <h2>{workout.recognized}</h2>
        {isAuto && (
          <>
            <p className="workout-confidence">
              <img src={sparkles} width={16} height={16} alt="" />
              AI Confidence: 94%
            </p>
            <p className="workout-prediction-caption">Auto-Detect · Sample prediction</p>
          </>
        )}
      </div>

      <div className="workout-counter">
        <p className="workout-repetitions">{workout.repetitions}</p>
        <p className="workout-repetitions-label">REPETITIONS</p>
      </div>

      <dl className="workout-stats">
        <div>
          <dt>Estimated Calories</dt>
          <dd>{workout.calories} <span>kcal</span></dd>
        </div>
        <div>
          <dt>Session Time</dt>
          <dd>{workout.duration}</dd>
        </div>
      </dl>

      <div className="bottom-action workout-bottom-action">
        <a className="outline-button workout-action workout-stop" href={previewHref('summary', exercise)}>
          Stop &amp; Save Workout
        </a>
      </div>
    </section>
  );
}
