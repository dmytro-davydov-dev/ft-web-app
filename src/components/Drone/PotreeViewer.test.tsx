import { render, screen, act, waitFor } from '@testing-library/react';

// Mock ViewerControls to avoid deep tree in PotreeViewer tests
jest.mock('./ViewerControls', () => ({
  __esModule: true,
  default: () => <div data-testid="viewer-controls" />,
}));

import PotreeViewer from './PotreeViewer';

const TILES_URL = 'https://storage.googleapis.com/bucket/captures/cap-1/tiles/';

function makePotreeMock(fail = false) {
  const mockViewer = {
    setFOV: jest.fn(),
    setPointBudget: jest.fn(),
    scene: { addPointCloud: jest.fn() },
    fitToScreen: jest.fn(),
    setPointSize: jest.fn(),
    setColorType: jest.fn(),
  };

  const Potree = {
    Viewer: jest.fn().mockReturnValue(mockViewer),
    loadPointCloud: jest.fn().mockImplementation((_url: string, _name: string, cb: (e: { pointcloud: unknown }) => void) => {
      if (!fail) setTimeout(() => cb({ pointcloud: {} }), 0);
    }),
    PointColorType: { HEIGHT: 1, RGB: 0 },
  };

  return { Potree, mockViewer };
}

describe('PotreeViewer', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete (window as Window & { Potree?: unknown }).Potree;
    // Remove any injected scripts
    document.querySelectorAll('script[src*="potree"]').forEach((s) => s.remove());
    document.querySelectorAll('link[href*="potree"]').forEach((s) => s.remove());
  });

  test('shows loading spinner initially', () => {
    render(<PotreeViewer tilesUrl={TILES_URL} captureId="cap-1" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('loads Potree from window when already present', async () => {
    const { Potree, mockViewer } = makePotreeMock();
    (window as Window & { Potree?: unknown }).Potree = Potree;

    await act(async () => {
      render(<PotreeViewer tilesUrl={TILES_URL} captureId="cap-1" />);
    });

    await waitFor(() => {
      expect(mockViewer.setFOV).toHaveBeenCalledWith(60);
      expect(mockViewer.setPointBudget).toHaveBeenCalledWith(1_000_000);
    });
  });

  test('hides spinner after point cloud loads', async () => {
    const { Potree } = makePotreeMock();
    (window as Window & { Potree?: unknown }).Potree = Potree;

    await act(async () => {
      render(<PotreeViewer tilesUrl={TILES_URL} captureId="cap-1" />);
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('loads tiles from the correct metadata.json URL', async () => {
    const { Potree } = makePotreeMock();
    (window as Window & { Potree?: unknown }).Potree = Potree;

    await act(async () => {
      render(<PotreeViewer tilesUrl={TILES_URL} captureId="cap-1" />);
    });

    await waitFor(() => {
      const [calledUrl] = (Potree.loadPointCloud as jest.Mock).mock.calls[0];
      expect(calledUrl).toBe(`${TILES_URL}metadata.json`);
    });
  });

  test('shows viewer controls after loading', async () => {
    const { Potree } = makePotreeMock();
    (window as Window & { Potree?: unknown }).Potree = Potree;

    await act(async () => {
      render(<PotreeViewer tilesUrl={TILES_URL} captureId="cap-1" />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('viewer-controls')).toBeInTheDocument();
    });
  });

  test('renders container div for Potree', () => {
    render(<PotreeViewer tilesUrl={TILES_URL} captureId="cap-1" />);
    // Outer Box + inner container div should exist
    const { container } = render(<PotreeViewer tilesUrl={TILES_URL} captureId="cap-2" />);
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0);
  });
});
