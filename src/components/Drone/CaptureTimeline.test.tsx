import { render, screen, fireEvent } from '@testing-library/react';
import CaptureTimeline from './CaptureTimeline';
import type { Capture } from '../../hooks/useCaptureStatus';

const CAPTURES: Capture[] = [
  {
    id: 'cap-1',
    siteId: 'site-1',
    status: 'ready',
    tiles_url: 'https://storage.googleapis.com/bucket/captures/cap-1/tiles/',
    captured_at: '2026-04-20T09:00:00Z',
    photo_count: 312,
    metadata: { gsd_cm: 2.4 },
  },
  {
    id: 'cap-2',
    siteId: 'site-1',
    status: 'ready',
    tiles_url: 'https://storage.googleapis.com/bucket/captures/cap-2/tiles/',
    captured_at: '2026-03-15T08:00:00Z',
    photo_count: 280,
    metadata: { gsd_cm: 2.8 },
  },
  {
    id: 'cap-3',
    siteId: 'site-1',
    status: 'ready',
    tiles_url: 'https://storage.googleapis.com/bucket/captures/cap-3/tiles/',
    captured_at: '2026-02-01T07:00:00Z',
    photo_count: 256,
    metadata: { gsd_cm: null },
  },
];

describe('CaptureTimeline', () => {
  test('renders all captures in the list', () => {
    render(
      <CaptureTimeline
        siteId="site-1"
        activeCaptureId="cap-1"
        captures={CAPTURES}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText(/20 Apr 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/15 Mar 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/01 Feb 2026/i)).toBeInTheDocument();
  });

  test('shows empty state when no captures', () => {
    render(
      <CaptureTimeline
        siteId="site-1"
        activeCaptureId=""
        captures={[]}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText(/no ready captures/i)).toBeInTheDocument();
  });

  test('calls onSelect with captureId and tilesUrl when a row is clicked', () => {
    const onSelect = jest.fn();
    render(
      <CaptureTimeline
        siteId="site-1"
        activeCaptureId="cap-1"
        captures={CAPTURES}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText(/15 Mar 2026/i));
    expect(onSelect).toHaveBeenCalledWith(
      'cap-2',
      'https://storage.googleapis.com/bucket/captures/cap-2/tiles/',
    );
  });

  test('active capture row has bold font weight', () => {
    render(
      <CaptureTimeline
        siteId="site-1"
        activeCaptureId="cap-1"
        captures={CAPTURES}
        onSelect={jest.fn()}
      />,
    );
    const activeText = screen.getByText(/20 Apr 2026/i);
    expect(activeText).toBeInTheDocument();
  });

  test('shows photo count for each capture', () => {
    render(
      <CaptureTimeline
        siteId="site-1"
        activeCaptureId="cap-1"
        captures={CAPTURES}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText(/312 photos/i)).toBeInTheDocument();
    expect(screen.getByText(/280 photos/i)).toBeInTheDocument();
    expect(screen.getByText(/256 photos/i)).toBeInTheDocument();
  });

  test('shows GSD value when available', () => {
    render(
      <CaptureTimeline
        siteId="site-1"
        activeCaptureId="cap-1"
        captures={CAPTURES}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText(/2\.4 cm\/px/)).toBeInTheDocument();
    expect(screen.getByText(/2\.8 cm\/px/)).toBeInTheDocument();
  });

  test('shows dash when GSD is null', () => {
    render(
      <CaptureTimeline
        siteId="site-1"
        activeCaptureId="cap-3"
        captures={[CAPTURES[2]]}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('does not call onSelect when capture has no tiles_url', () => {
    const onSelect = jest.fn();
    const noTilesCapture: Capture = {
      ...CAPTURES[0],
      id: 'cap-no-tiles',
      tiles_url: null,
    };
    render(
      <CaptureTimeline
        siteId="site-1"
        activeCaptureId="cap-1"
        captures={[noTilesCapture]}
        onSelect={onSelect}
      />,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
