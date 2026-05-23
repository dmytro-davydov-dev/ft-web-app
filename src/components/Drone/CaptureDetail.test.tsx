import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockApiFetch = jest.fn();
jest.mock('../../api/client', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));

import CaptureDetail from './CaptureDetail';
import type { Capture } from '../../hooks/useCaptureStatus';

const BASE_CAPTURE: Capture = {
  id: 'cap-1',
  siteId: 'site-1',
  status: 'ready',
  tiles_url: 'https://storage.googleapis.com/bucket/captures/cap-1/tiles/',
  captured_at: '2026-04-20T09:00:00Z',
  photo_count: 312,
  metadata: {
    gsd_cm: 2.4,
    odm_version: '3.4.0',
    processed_at: '2026-04-20T12:34:00Z',
  },
};

describe('CaptureDetail', () => {
  afterEach(() => jest.clearAllMocks());

  test('renders flight date', () => {
    render(
      <CaptureDetail siteId="site-1" capture={BASE_CAPTURE} onDeleted={jest.fn()} />,
    );
    expect(screen.getAllByText(/20 April 2026/).length).toBeGreaterThan(0);
  });

  test('renders photo count', () => {
    render(
      <CaptureDetail siteId="site-1" capture={BASE_CAPTURE} onDeleted={jest.fn()} />,
    );
    expect(screen.getByText('312')).toBeInTheDocument();
  });

  test('renders GSD with High badge for < 3 cm', () => {
    render(
      <CaptureDetail siteId="site-1" capture={BASE_CAPTURE} onDeleted={jest.fn()} />,
    );
    expect(screen.getByText(/2\.4 cm\/px/)).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  test('renders Medium badge for 3–5 cm GSD', () => {
    const cap: Capture = { ...BASE_CAPTURE, metadata: { gsd_cm: 4.0 } };
    render(<CaptureDetail siteId="site-1" capture={cap} onDeleted={jest.fn()} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  test('renders Low badge for > 5 cm GSD', () => {
    const cap: Capture = { ...BASE_CAPTURE, metadata: { gsd_cm: 6.5 } };
    render(<CaptureDetail siteId="site-1" capture={cap} onDeleted={jest.fn()} />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  test('renders dash when GSD is null', () => {
    const cap: Capture = { ...BASE_CAPTURE, metadata: { gsd_cm: null } };
    render(<CaptureDetail siteId="site-1" capture={cap} onDeleted={jest.fn()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('renders ODM version', () => {
    render(
      <CaptureDetail siteId="site-1" capture={BASE_CAPTURE} onDeleted={jest.fn()} />,
    );
    expect(screen.getByText('3.4.0')).toBeInTheDocument();
  });

  test('opens confirmation dialog when delete button is clicked', () => {
    render(
      <CaptureDetail siteId="site-1" capture={BASE_CAPTURE} onDeleted={jest.fn()} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /delete capture/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  test('closes dialog on cancel', () => {
    render(
      <CaptureDetail siteId="site-1" capture={BASE_CAPTURE} onDeleted={jest.fn()} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /delete capture/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('calls DELETE API and onDeleted on success', async () => {
    mockApiFetch.mockResolvedValue({ ok: true, status: 204 });
    const onDeleted = jest.fn();
    render(
      <CaptureDetail siteId="site-1" capture={BASE_CAPTURE} onDeleted={onDeleted} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /delete capture/i }));
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/v1/drone/sites/site-1/captures/cap-1',
        { method: 'DELETE' },
      );
      expect(onDeleted).toHaveBeenCalledWith('cap-1');
    });
  });

  test('shows error message on HTTP 409 (in-flight capture)', async () => {
    mockApiFetch.mockResolvedValue({ ok: false, status: 409 });
    render(
      <CaptureDetail siteId="site-1" capture={BASE_CAPTURE} onDeleted={jest.fn()} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /delete capture/i }));
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => {
      expect(screen.getByText(/cannot delete.*processing/i)).toBeInTheDocument();
    });
  });

  test('shows error message on other HTTP errors', async () => {
    mockApiFetch.mockResolvedValue({ ok: false, status: 500 });
    render(
      <CaptureDetail siteId="site-1" capture={BASE_CAPTURE} onDeleted={jest.fn()} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /delete capture/i }));
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => {
      expect(screen.getByText(/delete failed/i)).toBeInTheDocument();
    });
  });

  test('shows error message on network failure', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));
    render(
      <CaptureDetail siteId="site-1" capture={BASE_CAPTURE} onDeleted={jest.fn()} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /delete capture/i }));
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
