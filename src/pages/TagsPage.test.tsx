import { render, screen } from '@testing-library/react';
import TagsPage from './TagsPage';
import type { Tag } from '../hooks/useTags';

// ── Mock useTags ──────────────────────────────────────────────────────────────
const mockUseTags = jest.fn();
jest.mock('../hooks/useTags', () => ({
  useTags: () => mockUseTags(),
}));

// ── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE_TAGS: Tag[] = [
  {
    id: 'tag-0001', label: 'Employee Badge 1', type: 'badge',
    batteryPct: 87, lastSeen: '2026-05-07T08:30:00Z',
    zoneId: 'zone-reception', floor: 1, status: 'active',
  },
  {
    id: 'tag-0002', label: 'Employee Badge 2', type: 'badge',
    batteryPct: 14, lastSeen: '2026-05-07T08:10:00Z',
    zoneId: 'zone-open-plan', floor: 1, status: 'low_battery',
  },
  {
    id: 'tag-0003', label: 'Employee Badge 3', type: 'badge',
    batteryPct: null, lastSeen: null,
    zoneId: null, floor: null, status: 'inactive',
  },
];

describe('TagsPage', () => {
  afterEach(() => jest.clearAllMocks());

  test('shows loading state', () => {
    mockUseTags.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<TagsPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error state', () => {
    mockUseTags.mockReturnValue({ data: undefined, error: new Error('fail'), isLoading: false });
    render(<TagsPage />);
    expect(screen.getByText(/Failed to load tags/)).toBeInTheDocument();
  });

  test('renders tag IDs in table', () => {
    mockUseTags.mockReturnValue({ data: SAMPLE_TAGS, error: undefined, isLoading: false });
    render(<TagsPage />);
    expect(screen.getByText('tag-0001')).toBeInTheDocument();
    expect(screen.getByText('tag-0002')).toBeInTheDocument();
    expect(screen.getByText('tag-0003')).toBeInTheDocument();
  });

  test('renders tag labels', () => {
    mockUseTags.mockReturnValue({ data: SAMPLE_TAGS, error: undefined, isLoading: false });
    render(<TagsPage />);
    expect(screen.getByText('Employee Badge 1')).toBeInTheDocument();
    expect(screen.getByText('Employee Badge 2')).toBeInTheDocument();
  });

  test('renders status chips', () => {
    mockUseTags.mockReturnValue({ data: SAMPLE_TAGS, error: undefined, isLoading: false });
    render(<TagsPage />);
    // KPI label + table row both say "Active"; table row has "Low battery" and "Inactive"
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Low battery').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  test('renders KPI — total tags', () => {
    mockUseTags.mockReturnValue({ data: SAMPLE_TAGS, error: undefined, isLoading: false });
    render(<TagsPage />);
    // KpiCard renders the count; 3 total tags
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('shows low-battery warning chip when applicable', () => {
    mockUseTags.mockReturnValue({ data: SAMPLE_TAGS, error: undefined, isLoading: false });
    render(<TagsPage />);
    // Summary chip reads "1 low battery"; row chip reads "Low battery"
    expect(screen.getByText('1 low battery')).toBeInTheDocument();
  });

  test('shows empty state when data is empty array', () => {
    mockUseTags.mockReturnValue({ data: [], error: undefined, isLoading: false });
    render(<TagsPage />);
    expect(screen.getByText(/No tags registered/)).toBeInTheDocument();
  });

  test('renders page heading', () => {
    mockUseTags.mockReturnValue({ data: SAMPLE_TAGS, error: undefined, isLoading: false });
    render(<TagsPage />);
    expect(screen.getByRole('heading', { name: /Tags/i })).toBeInTheDocument();
  });
});
