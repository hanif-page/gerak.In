import check from '../../assets/icons/check.svg';
import flag from '../../assets/icons/flag.svg';
import { workoutFixtures, type WorkoutProps } from './workoutFixtures';

export function WorkoutSummary({ exercise }: WorkoutProps) {
  const workout = workoutFixtures[exercise];

  return (
    <section className="workout-summary" aria-labelledby="workout-summary-heading">
      <h1 id="workout-summary-heading">Workout Summary</h1>

      <div className="workout-complete">
        <div className="workout-complete-icon">
          <img src={check} width={40} height={40} alt="" />
        </div>
        <p>Preview complete · Not saved to server</p>
      </div>

      <section className="workout-summary-card" aria-labelledby="workout-completed-heading">
        <header className="workout-summary-card-header">
          <h2 id="workout-completed-heading">Session Completed</h2>
          <img src={flag} width={22} height={22} alt="" />
        </header>
        <div className="workout-summary-divider" />
        <div className="workout-summary-totals">
          <p>Total Reps: {workout.summaryRepetitions} {workout.label}</p>
          <p>Estimated Calories: {workout.calories} kcal</p>
        </div>
        <div className="workout-summary-divider" />
        {exercise === 'auto' && <p className="workout-average-confidence">Average Model Confidence: 92%</p>}
      </section>

      <div className="bottom-action workout-bottom-action">
        <a className="primary-button workout-action" href="#/">Return to Dashboard</a>
      </div>
    </section>
  );
}
