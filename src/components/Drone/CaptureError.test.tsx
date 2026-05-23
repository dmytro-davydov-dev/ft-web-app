import { render, screen, fireEvent } from '@testing-library/react';
import CaptureError from './CaptureError';

const mockRetry = jest.fn();

afterEach(() => jest.clearAllMocks());

describe('CaptureError', () => {
  test('renders too_few_features message', () => {
    render(<CaptureError errorDetail="too_few_features — ensure overlap" onRetry={mockRetry} />);
    expect(screen.getByText(/too few matched features/i)).toBeInTheDocument();
  });

  test('renders nodeodm_unreachable message', () => {
    render(<CaptureError errorDetail="nodeodm_unreachable" onRetry={mockRetry} />);
    expect(screen.getByText(/processing server unavailable/i)).toBeInTheDocument();
  });

  test('renders potree_conversion_failed message', () => {
    render(<CaptureError errorDetail="potree_conversion_failed" onRetry={mockRetry} />);
    expect(screen.getByText(/tile generation failed/i)).toBeInTheDocument();
  });

  test('renders unknown error message for unrecognised codes', () => {
    render(<CaptureError errorDetail="odm_memory_error" onRetry={mockRetry} />);
    expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
  });

  test('renders unknown message when errorDetail is undefined', () => {
    render(<CaptureError onRetry={mockRetry} />);
    expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
  });

  test('calls onRetry when Retry button is clicked', () => {
    render(<CaptureError errorDetail="too_few_features" onRetry={mockRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  test('shows Retrying… and disables button when isRetrying=true', () => {
    render(<CaptureError onRetry={mockRetry} isRetrying={true} />);
    const btn = screen.getByRole('button', { name: /retrying/i });
    expect(btn).toBeDisabled();
  });

  test('retry button is enabled when isRetrying=false', () => {
    render(<CaptureError onRetry={mockRetry} isRetrying={false} />);
    expect(screen.getByRole('button', { name: /retry/i })).not.toBeDisabled();
  });
});
