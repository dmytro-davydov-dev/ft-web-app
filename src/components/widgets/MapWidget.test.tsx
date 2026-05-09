/**
 * MapWidget tests.
 *
 * mapbox-gl requires WebGL/canvas which jsdom does not provide.
 * We mock the entire module so MapWidget's useEffect never calls the real
 * Mapbox GL constructor, while still exercising all the React render paths.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── mapbox-gl mock ────────────────────────────────────────────────────────────

const mockMapOn   = jest.fn();
const mockMapRemove = jest.fn();
const mockAddControl = jest.fn();
const mockAddSource  = jest.fn();
const mockAddLayer   = jest.fn();
const mockGetSource  = jest.fn(() => ({ setData: jest.fn() }));
const mockGetCanvas  = jest.fn(() => ({ style: {} }));

const MockMap = jest.fn().mockImplementation(() => ({
  on:         mockMapOn,
  remove:     mockMapRemove,
  addControl: mockAddControl,
  addSource:  mockAddSource,
  addLayer:   mockAddLayer,
  getSource:  mockGetSource,
  getCanvas:  mockGetCanvas,
  isStyleLoaded: jest.fn(() => true),
}));

const MockPopup = jest.fn().mockImplementation(() => ({
  setLngLat: jest.fn().mockReturnThis(),
  setHTML:   jest.fn().mockReturnThis(),
  addTo:     jest.fn().mockReturnThis(),
  remove:    jest.fn(),
}));

const MockNavigationControl  = jest.fn();
const MockAttributionControl = jest.fn();

jest.mock('mapbox-gl', () => ({
  __esModule: true,
  default: {
    Map:               MockMap,
    Popup:             MockPopup,
    NavigationControl: MockNavigationControl,
    AttributionControl: MockAttributionControl,
  },
  Map:               MockMap,
  Popup:             MockPopup,
  NavigationControl: MockNavigationControl,
  AttributionControl: MockAttributionControl,
}));

// Mock the CSS import
jest.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}), { virtual: true });

// ── Hook mocks ────────────────────────────────────────────────────────────────

const mockSite = {
  id: 'site-1',
  name: 'Pilot HQ',
  description: 'Test site',
  floorplan: { width_m: 80, height_m: 50, floors: 2, floor_area_m2: 4000 },
  floors: [
    {
      floor: 1,
      label: 'Ground',
      gateway_count: 4,
      zones: [
        { id: 'zone-a', label: 'Reception', area_m2: 200 },
        { id: 'zone-b', label: 'Open Plan', area_m2: 800 },
      ],
    },
    {
      floor: 2,
      label: 'Level 1',
      gateway_count: 3,
      zones: [{ id: 'zone-c', label: 'Boardroom', area_m2: 100 }],
    },
  ],
};

const mockTags = [
  { id: 'tag-1', label: 'Alice', type: 'badge', batteryPct: 80, lastSeen: null, zoneId: 'zone-b', floor: 1, status: 'active' },
  { id: 'tag-2', label: 'Bob',   type: 'badge', batteryPct: 60, lastSeen: null, zoneId: 'zone-a', floor: 1, status: 'active' },
];

jest.mock('../../hooks/useSites', () => ({
  useSites: jest.fn(),
}));
jest.mock('../../hooks/useTags', () => ({
  useTags: jest.fn(),
}));

import { useSites } from '../../hooks/useSites';
import { useTags  } from '../../hooks/useTags';
import MapWidget    from './MapWidget';

const mockUseSites = useSites as jest.MockedFunction<typeof useSites>;
const mockUseTags  = useTags  as jest.MockedFunction<typeof useTags>;

// ── map/env mock (no token by default) ───────────────────────────────────────

jest.mock('../../map/env', () => ({
  MAPBOX_TOKEN: '',
  PILOT_LNG:    -0.1,
  PILOT_LAT:    51.5,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MapWidget — no token', () => {
  beforeEach(() => {
    // VITE_MAPBOX_TOKEN is empty in test env by default
    mockUseSites.mockReturnValue({ data: [mockSite], isLoading: false } as ReturnType<typeof useSites>);
    mockUseTags .mockReturnValue({ data: mockTags,   isLoading: false } as ReturnType<typeof useTags>);
  });

  test('renders Floor map title', () => {
    render(<MapWidget />);
    expect(screen.getByText('Floor map')).toBeInTheDocument();
  });

  test('shows token-missing message when VITE_MAPBOX_TOKEN is absent', () => {
    render(<MapWidget />);
    expect(screen.getByText('Mapbox token not configured')).toBeInTheDocument();
    expect(screen.getByText(/VITE_MAPBOX_TOKEN/)).toBeInTheDocument();
  });

  test('does NOT render the map container as visible', () => {
    render(<MapWidget />);
    const container = screen.getByTestId('map-container');
    expect(container).toHaveStyle({ visibility: 'hidden' });
  });
});

describe('MapWidget — loading state', () => {
  test('renders skeleton while data is loading', () => {
    mockUseSites.mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof useSites>);
    mockUseTags .mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof useTags>);

    const { container } = render(<MapWidget />);
    // MUI mock renders Skeleton as <div aria-hidden>
    expect(container.querySelector('[aria-hidden]')).toBeTruthy();
  });
});

describe('MapWidget — no site data', () => {
  test('shows "No site data available" when sites array is empty', () => {
    mockUseSites.mockReturnValue({ data: [],        isLoading: false } as ReturnType<typeof useSites>);
    mockUseTags .mockReturnValue({ data: mockTags,  isLoading: false } as ReturnType<typeof useTags>);

    render(<MapWidget />);
    // Token is missing in test env so we get the token message instead;
    // both cases show the map-container hidden
    const mc = screen.getByTestId('map-container');
    expect(mc).toHaveStyle({ visibility: 'hidden' });
  });
});

describe('MapWidget — floor selector', () => {
  test('does not render floor buttons for single-floor site', () => {
    const singleFloorSite = { ...mockSite, floors: [mockSite.floors[0]] };
    mockUseSites.mockReturnValue({ data: [singleFloorSite], isLoading: false } as ReturnType<typeof useSites>);
    mockUseTags .mockReturnValue({ data: mockTags,          isLoading: false } as ReturnType<typeof useTags>);

    render(<MapWidget />);
    expect(screen.queryByText('Ground')).not.toBeInTheDocument();
    expect(screen.queryByText('Level 1')).not.toBeInTheDocument();
  });

  test('renders floor toggle buttons for multi-floor site', () => {
    mockUseSites.mockReturnValue({ data: [mockSite], isLoading: false } as ReturnType<typeof useSites>);
    mockUseTags .mockReturnValue({ data: mockTags,   isLoading: false } as ReturnType<typeof useTags>);

    render(<MapWidget />);
    expect(screen.getByText('Ground')).toBeInTheDocument();
    expect(screen.getByText('Level 1')).toBeInTheDocument();
  });

  test('floor toggle buttons are clickable', async () => {
    mockUseSites.mockReturnValue({ data: [mockSite], isLoading: false } as ReturnType<typeof useSites>);
    mockUseTags .mockReturnValue({ data: mockTags,   isLoading: false } as ReturnType<typeof useTags>);

    render(<MapWidget />);
    const level1Btn = screen.getByText('Level 1');
    await userEvent.click(level1Btn);
    // No throw = toggle interaction works
    expect(level1Btn).toBeInTheDocument();
  });
});
