import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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

const makeCap = (status: string, detail?: string, errorCode?: string) => ({
  id: 'cap-1',
  siteId: 'site-1',
  status,
  tiles_url: null,
  captured_at: '2026-05-01T00:00:00Z',
  metadata: detail ? { detail } : errorCode ? { error: errorCode } : undefined,
});

const mockMutate = jest.fn();

beforeEach(() => {
  mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
  mockUseSWR.mockReturnValue({ data: undefined, error: undefined, mutate: mockMutate });
});
afterEach(() => jest.clearAllMocks());

describe('CaptureStatus', () => {
  test('shows loading state when data is undefined', () => {
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/loading status/i)).toBeInTheDocument();
  });

  test('shows error state when SWR errors', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: new Error('fail'), mutate: mockMutate });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/failed to load capture status/i)).toBeInTheDocument();
  });

  test('shows pending label', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('pending'), error: undefined, mutate: mockMutate });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/waiting for upload/i)).toBeInTheDocument();
  });

  test('shows uploading label', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('uploading'), error: undefined, mutate: mockMutate });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/uploading photos/i)).toBeInTheDocument();
  });

  test('shows processing label', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('processing'), error: undefined, mutate: mockMutate });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/processing with odm/i)).toBeInTheDocument();
  });

  test('shows tiling label', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('tiling'), error: undefined, mutate: mockMutate });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/generating 3d tiles/i)).toBeInTheDocument();
  });

  test('shows ready label', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('ready'), error: undefined, mutate: mockMutate });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/3d model ready/i)).toBeInTheDocument();
  });

  test('shows CaptureError with too_few_features message for error status', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('error', undefined, 'too_few_features'), error: undefined, mutate: mockMutate });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/too few matched features/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  test('shows CaptureError with nodeodm_unreachable message', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('error', undefined, 'nodeodm_unreachable'), error: undefined, mutate: mockMutate });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/processing server unavailable/i)).toBeInTheDocument();
  });

  test('shows unknown error message for unrecognised error codes', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('error', undefined, 'odm_memory_error'), error: undefined, mutate: mockMutate });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
  });

  test('retry button calls process endpoint and mutate', async () => {
    mockUseSWR.mockReturnValue({ data: makeCap('error', undefined, 'too_few_features'), error: undefined, mutate: mockMutate });
    mockApiFetch.mockResolvedValue({ ok: true });
    mockMutate.mockResolvedValue(undefined);

    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/v1/drone/sites/site-1/captures/cap-1/process',
        { method: 'POST' },
      );
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  test('shows spinner for processing state (polling active)', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('processing'), error: undefined, mutate: mockMutate });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows spinner for tiling state (polling active)', () => {
    mockUseSWR.mockReturnValue({ data: makeCap('tiling'), error: undefined, mutate: mockMutate });
    render(<CaptureStatus siteId="site-1" captureId="cap-1" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
