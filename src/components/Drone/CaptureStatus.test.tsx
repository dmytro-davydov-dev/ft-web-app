import { render, screen } from '@testing-library/react';

const mockUseAuth = jest.fn();
jest.mock('../../context/AuthContext', () => ({ useAuth: () => mockUseAuth() }));

const mockApiFetch = jest.fn();
jest.mock('../../api/client', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));

const mockUseSWR = jest.fn();
jest.mock('swr', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseSWR(...args),
}));

import CaptureStatus from './CaptureStatus';

const makeCap = (status: string, detail?: string) => ({
  id: 'cap-1',
  siteId: 'site-1',
  status,
  tiles_url: null,
  captured_at: '2026-05-01T00:00:00Z',
  metadata: detail ? { detail } : undefined,
});

beforeEach(() => {
  mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
});
afterEach(() => jest.clearAllMocks());

describe('CaptureStatus', () => {
  test('shows loading state when data is undefined', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/loading status/i)).toBeInTheDocument();
  });

  test('shows error state when SWR errors', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: new Error('fail') });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/failed to load capture status/i)).toBeInTheDocument();
  });

  test('shows pending label', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('pending'), error: undefined });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/waiting for upload/i)).toBeInTheDocument();
  });

  test('shows uploading label', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('uploading'), error: undefined });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/uploading photos/i)).toBeInTheDocument();
  });

  test('shows processing label', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('processing'), error: undefined });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/processing with odm/i)).toBeInTheDocument();
  });

  test('shows tiling label', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('tiling'), error: undefined });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/generating 3d tiles/i)).toBeInTheDocument();
  });

  test('shows ready label', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('ready'), error: undefined });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/3d model ready/i)).toBeInTheDocument();
  });

  test('shows error label with detail message', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('error', 'ODM out of memory'), error: undefined });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/processing failed/i)).toBeInTheDocument();
    expect(screen.getByText(/odm out of memory/i)).toBeInTheDocument();
  });

  test('shows spinner for processing state (polling active)', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('processing'), error: undefined });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows spinner for tiling state (polling active)', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('tiling'), error: undefined });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
