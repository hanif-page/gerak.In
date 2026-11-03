import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dashboard } from './Dashboard';

beforeEach(() => window.history.replaceState(null, '', '/#/'));
afterEach(() => vi.restoreAllMocks());

function openPreview(hash: string) {
  window.history.replaceState(null, '', `/${hash}`);
  return render(<Dashboard />);
}

describe('normal mode previews', () => {
  it('renders Figma metrics with sample-data and disconnected disclosures', () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: 'Tracker' })).toBeInTheDocument();
    expect(screen.getByText('4,120')).toBeInTheDocument();
    expect(screen.getByText(/Sample data only/)).toBeInTheDocument();
    expect(screen.getByText('Estimated Daily Calories')).toBeInTheDocument();
    expect(screen.getByText('Current Status: Sitting')).toBeInTheDocument();
    expect(screen.getByText('Not connected')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Normal Mode' })).toHaveAttribute('aria-current', 'page');
  });

  it('links between idle and walking without switching out of normal mode', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(screen.getByRole('link', { name: 'Walking' }));
    expect(await screen.findByText('Current Status: Walking (Moderate Pace)')).toBeInTheDocument();
    expect(screen.getByText('4,125')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Normal Mode' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('link', { name: 'Idle' }));
    expect(await screen.findByText('Current Status: Sitting')).toBeInTheDocument();
  });

  it('only offers Start Active Workout after switching to Workout Mode', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    expect(screen.queryByRole('link', { name: 'Start Active Workout' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Walking' }));
    await screen.findByText('Current Status: Walking (Moderate Pace)');
    expect(screen.queryByRole('link', { name: 'Start Active Workout' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Workout Mode' }));
    expect(await screen.findByRole('heading', { name: 'Choose your exercise' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start Active Workout' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/workout?exercise=push-up');
  });

  it('responds to browser offline and online events without claiming device connectivity', () => {
    const online = vi.spyOn(navigator, 'onLine', 'get');
    online.mockReturnValue(true);
    render(<Dashboard />);
    online.mockReturnValue(false);
    fireEvent(window, new Event('offline'));
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText(/cached interface, not live tracking/)).toBeInTheDocument();
    online.mockReturnValue(true);
    fireEvent(window, new Event('online'));
    expect(screen.getByText('Not connected')).toBeInTheDocument();
    expect(screen.queryByText(/cached interface, not live tracking/)).not.toBeInTheDocument();
  });
});

describe('workout selection and static flow', () => {
  it('opens workout mode and selects only the clicked card', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(screen.getByRole('link', { name: 'Workout Mode' }));
    const choices = await screen.findByRole('navigation', { name: 'Exercise selection' });
    expect(within(choices).getByRole('link', { name: 'Push-ups' })).toHaveAttribute('aria-current', 'true');
    for (const label of ['Jumping Jacks', 'Auto-Detect (TinyML)', 'Push-ups']) {
      await user.click(within(choices).getByRole('link', { name: label }));
      await waitFor(() => expect(within(choices).getByRole('link', { name: label })).toHaveAttribute('aria-current', 'true'));
      expect(within(choices).getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'true')).toHaveLength(1);
    }
    await user.click(screen.getByRole('link', { name: 'Normal Mode' }));
    expect(await screen.findByText('Current Status: Sitting')).toBeInTheDocument();
  });

  it.each([
    { exercise: 'push-up', title: 'PUSH UPS', reps: '10', calories: /20\.1/, label: 'Push-ups' },
    { exercise: 'jumping-jack', title: 'JUMPING JACKS', reps: '18', calories: /14\.2/, label: 'Jumping Jacks' },
    { exercise: 'auto', title: 'JUMPING JACKS', reps: '18', calories: /14\.2/, label: 'Jumping Jacks' },
  ])('links $exercise through active tracking, summary, and dashboard', async ({ exercise, title, reps, calories, label }) => {
    const user = userEvent.setup();
    openPreview(`#/workout?exercise=${exercise}`);
    expect(screen.getByRole('link', { name: 'Start Active Workout' })).toHaveAttribute('href', `#/active?exercise=${exercise}`);
    await user.click(screen.getByRole('link', { name: 'Start Active Workout' }));
    expect(await screen.findByRole('heading', { name: 'Workout Session Active' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText(reps, { exact: true })).toBeInTheDocument();
    expect(screen.getByText(calories)).toBeInTheDocument();
    expect(screen.getByText(/PREVIEW SESSION/)).toBeInTheDocument();
    if (exercise === 'auto') {
      expect(screen.getByText('AI Inference On')).toBeInTheDocument();
      expect(screen.getByText('AI Confidence: 94%')).toBeInTheDocument();
    } else {
      expect(screen.getByText('AI Inference Off')).toBeInTheDocument();
      expect(screen.queryByText(/AI Confidence:/)).not.toBeInTheDocument();
    }
    await user.click(screen.getByRole('link', { name: 'Stop & Save Workout' }));
    expect(await screen.findByRole('heading', { name: 'Workout Summary' })).toBeInTheDocument();
    expect(screen.getByText(/Total Reps:/)).toHaveTextContent(label);
    expect(screen.getByText('Preview complete · Not saved to server')).toBeInTheDocument();
    if (exercise === 'auto') {
      expect(screen.getByText('Average Model Confidence: 92%')).toBeInTheDocument();
      expect(screen.getByText('Total Reps: 25 Jumping Jacks')).toBeInTheDocument();
    } else {
      expect(screen.queryByText(/Average Model Confidence/)).not.toBeInTheDocument();
    }
    expect(screen.queryByText(/Saved to Laptop Server/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Return to Dashboard' }));
    expect(await screen.findByText('Current Status: Sitting')).toBeInTheDocument();
  });

  it('restores the previous screen with browser history', async () => {
    const user = userEvent.setup();
    openPreview('#/workout?exercise=auto');
    await user.click(screen.getByRole('link', { name: 'Start Active Workout' }));
    await screen.findByRole('heading', { name: 'Workout Session Active' });
    window.history.back();
    await screen.findByRole('heading', { name: 'Choose your exercise' });
    expect(screen.getByRole('link', { name: 'Auto-Detect (TinyML)' })).toHaveAttribute('aria-current', 'true');
  });

  it('does not let the skip link change the preview route', async () => {
    const user = userEvent.setup();
    openPreview('#/summary?exercise=auto');
    await user.click(screen.getByRole('link', { name: 'Skip to tracker' }));
    expect(window.location.hash).toBe('#/summary?exercise=auto');
    expect(screen.getByRole('main')).toHaveFocus();
  });
});
