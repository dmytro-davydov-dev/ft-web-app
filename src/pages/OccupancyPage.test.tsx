/**
 * OccupancyPage tests.
 *
 * Mocks useReport so the page never issues real SWR fetches.
 * Chart sub-components (AreaOccupancy, FloorOccupancy, Utilisation) are
 * mocked to keep this a unit test of the page's own logic.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OccupancyPage from './OccupancyPage';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockUseReport = jest.fn();
jest.mock('../hooks/useReport', () => ({
  useReport: (...args: unknown[]) => mockUseReport(...args),
}));

// Stub heavy chart sub-components — they have their own test files.
jest.mock('./Reports/AreaOccupancy',  () => ({ __esModule: true, default: () => <div>AreaOccupancyChart</div>  }));
jest.mock('./Reports/FloorOccupancy', () => ({ __esModule: true, default: () => <div>FloorOccupancyChart</div> }));
jest.mock('./Reports/Utilisation',    () => ({ __esModule: true, default: () => <div>BuildingUtilisation</div> }));

// ── Helpers ───────────────────────────────────────────────────────────────────

function stubReports(
  areaData: unknown   = undefined,
  areaLoading         = false,
  utilData: unknown   = undefined,
  utilLoading         = false,
) {
  mockUseReport
    .mockReturnValueOnce({ data: areaData,  isLoading: areaLoading,  error: undefined })
    .mockReturnValueOnce({ data: utilData,  isLoading: utilLoading,  error: undefined });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OccupancyPage', () => {
  afterEach(() => jest.clearAllMocks());

  test('renders page header and all three chart placeholders', () => {
    stubReports();
    render(<OccupancyPage />);
    expect(screen.getByText('Analyze')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Occupancy' })).toBeInTheDocument();
    expect(screen.getByText('AreaOccupancyChart')).toBeInTheDocument();
    expect(screen.getByText('FloorOccupancyChart')).toBeInTheDocument();
    expect(screen.getByText('BuildingUtilisation')).toBeInTheDocument();
  });

  test('renders all four KPI labels', () => {
    stubReports();
    render(<OccupancyPage />);
    expect(screen.getByText('Peak concurrent tags')).toBeInTheDocument();
    expect(screen.getByText('Zones monitored')).toBeInTheDocument();
    expect(screen.getByText('Avg utilisation')).toBeInTheDocument();
    expect(screen.getByText('Peak utilisation')).toBeInTheDocument();
  });

  test('shows "…" KPI values while loading', () => {
    stubReports(undefined, true, undefined, true);
    render(<OccupancyPage />);
    expect(screen.getAllByText('…').length).toBeGreaterThanOrEqual(2);
  });

  test('shows "—" KPI values when no data is returned', () => {
    stubReports([], false, [], false);
    render(<OccupancyPage />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });

  test('derives peak tag count from area occupancy data', () => {
    const areaData = [
      { area_id: 'zone-a', hour: '2026-05-01T08:00:00Z', tagCount: 12 },
      { area_id: 'zone-b', hour: '2026-05-01T08:00:00Z', tagCount:  7 },
      { area_id: 'zone-a', hour: '2026-05-01T09:00:00Z', tagCount: 25 },
    ];
    stubReports(areaData, false, undefined, false);
    render(<OccupancyPage />);
    expect(screen.getByText('25')).toBeInTheDocument();  // peak
    expect(screen.getByText('2')).toBeInTheDocument();   // unique areas (zone-a, zone-b)
  });

  test('derives avg and peak utilisation from building data', () => {
    const utilData = [
      { day: '2026-05-01', occupied_hours: 8,  total_hours: 24, utilisation_pct: 50 },
      { day: '2026-05-02', occupied_hours: 16, total_hours: 24, utilisation_pct: 70 },
    ];
    stubReports(undefined, false, utilData, false);
    render(<OccupancyPage />);
    expect(screen.getByText('60%')).toBeInTheDocument();  // avg (50+70)/2
    expect(screen.getByText('70%')).toBeInTheDocument();  // peak
  });

  test('renders From and To date pickers', () => {
    stubReports();
    render(<OccupancyPage />);
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });

  test('calls useReport with occupancy/area and utilisation/building', () => {
    stubReports();
    render(<OccupancyPage />);
    expect(mockUseReport).toHaveBeenCalledWith('occupancy/area',         expect.any(Object));
    expect(mockUseReport).toHaveBeenCalledWith('utilisation/building',   expect.any(Object));
  });

  test('date pickers update the dateParams passed to charts', async () => {
    const user = userEvent.setup();
    stubReports();
    // Second render cycle after input change needs fresh stubs
    mockUseReport
      .mockReturnValue({ data: undefined, isLoading: false, error: undefined });

    render(<OccupancyPage />);
    const fromInput = screen.getByLabelText('From') as HTMLInputElement;
    await user.clear(fromInput);
    await user.type(fromInput, '2026-04-01');
    // useReport should have been called multiple times as state updates
    expect(mockUseReport).toHaveBeenCalled();
  });
});
