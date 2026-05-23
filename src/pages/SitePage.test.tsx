import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockUseSiteCaptures = jest.fn();
jest.mock('../hooks/useSiteCaptures', () => ({
  useSiteCaptures: (...args: unknown[]) => mockUseSiteCaptures(...args),
}));

jest.mock('../hooks/useCaptureStatus', () => ({
  useCaptureStatus: () => ({ data: undefined, error: undefined }),
}));

jest.mock('../components/Drone/CaptureStatus', () => ({
  __esModule: true,
  default: () => <div data-testid="capture-status" />,
}));

jest.mock('../components/Drone/PotreeViewer', () => ({
  __esModule: true,
  default: ({ captureId }: { captureId: string }) => <div data-testid={`potree-${captureId}`} />,
}));

import SitePage from './SitePage';

function renderSite(siteId = 'site-17') {
  return render(
    <MemoryRouter initialEntries={[`/dashboard/${siteId}`]}>
      <Routes>
        <Route path="/dashboard/:siteId" element={<SitePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SitePage', () => {
  afterEach(() => jest.clearAllMocks());

  test('renders site id from route params', () => {
    mockUseSiteCaptures.mockReturnValue({ data: [], isLoading: false, error: undefined });
    renderSite();
    expect(screen.getByText('Site detail')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Site: site-17' })).toBeInTheDocument();
  });

  test('shows empty state when no captures exist', () => {
    mockUseSiteCaptures.mockReturnValue({ data: [], isLoading: false, error: undefined });
    renderSite();
    expect(screen.getByText(/no 3d model yet/i)).toBeInTheDocument();
  });

  test('shows loading spinner when isLoading is true', () => {
    mockUseSiteCaptures.mockReturnValue({ data: undefined, isLoading: true, error: undefined });
    renderSite('site-abc');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error alert when fetch fails', () => {
    mockUseSiteCaptures.mockReturnValue({ data: undefined, isLoading: false, error: new Error('fail') });
    renderSite();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
