import type { Activity } from '../../app/previewRoute';
import footprints from '../../assets/icons/footprints.svg';
import flame from '../../assets/icons/flame.svg';
import radio from '../../assets/icons/radio.svg';

// Presentation fixtures, not readings or calculated calorie estimates.
const examples = {
  idle: { steps: '4,120', calories: 185, status: 'Sitting' },
  walking: { steps: '4,125', calories: 185, status: 'Walking (Moderate Pace)' },
};

export function NormalActivity({ activity }: { activity: Activity }) {
  const example = examples[activity];
  return (
    <>
      <section className="activity-card" aria-labelledby="activity-title" aria-describedby="preview-description">
        <div className="card-heading">
          <h2 id="activity-title">Today's Passive Activity</h2>
          <img src={footprints} width="22" height="22" alt="" />
        </div>
        <p className="step-metric"><span>{example.steps}</span> <span className="metric-unit">Steps</span></p>
        <div className="metric-divider" />
        <div className="calories-row">
          <div>
            <p className="calorie-metric">{example.calories} <span className="calorie-unit">kcal</span></p>
            <p className="metric-label">Estimated Daily Calories</p>
          </div>
          <img src={flame} width="28" height="28" alt="" />
        </div>
      </section>

      <section className="sensor-card" aria-labelledby="sensor-title" aria-describedby="preview-description">
        <div className="card-heading">
          <h2 id="sensor-title">Live Sensor Status</h2>
          <img src={radio} width="18" height="18" alt="" />
        </div>
        <p className="current-activity" role="status">
          <span className={`activity-indicator${activity === 'walking' ? ' is-walking' : ''}`} aria-hidden="true"><span /></span>
          <span>Current Status: {example.status}</span>
        </p>
        <p className="sensor-caption">ESP32 · ON-DEVICE MOTION SENSING</p>
      </section>

      <nav className="activity-preview" aria-label="Sensor state preview">
        <span>Preview sensor state</span>
        <div>
          <a href="#/" aria-current={activity === 'idle' ? 'true' : undefined}>Idle</a>
          <a href="#/normal?activity=walking" aria-current={activity === 'walking' ? 'true' : undefined}>Walking</a>
        </div>
      </nav>

    </>
  );
}
