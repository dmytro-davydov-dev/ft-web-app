/**
 * ManagePeoplePage tests.
 *
 * Mocks usePeople and useTags so the component can be tested without Firebase / network.
 * Tests cover: loading, error, empty state, people list rendering, dialog open/close,
 * form validation, and optimistic person creation.
 */
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockUsePeople = jest.fn();
jest.mock('../../hooks/usePeople', () => ({
  usePeople: () => mockUsePeople(),
}));

const mockUseTags = jest.fn();
jest.mock('../../hooks/useTags', () => ({
  useTags: () => mockUseTags(),
}));

import ManagePeoplePage from './ManagePeoplePage';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const PILOT_PERSON = {
  id:               'person-001',
  firstName:        'Jane',
  lastName:         'Smith',
  email:            'jane@example.com',
  phone:            '+61 400 000 001',
  company:          'Acme Corp',
  role:             'Site Engineer',
  nationality:      'Australian',
  tagId:            'tag-001',
  pictureUrl:       null,
  supervisor:       'John Doe',
  emergencyContact: 'Bob Smith, +61 400 000 099',
};

const PILOT_TAGS = [
  { id: 'tag-001', label: 'Badge 001', type: 'badge', batteryPct: 85, lastSeen: null, zoneId: null, floor: null, status: 'active' },
  { id: 'tag-002', label: 'Badge 002', type: 'badge', batteryPct: 60, lastSeen: null, zoneId: null, floor: null, status: 'active' },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ManagePeoplePage />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ManagePeoplePage', () => {
  beforeEach(() => {
    mockUseTags.mockReturnValue({ data: PILOT_TAGS, isLoading: false, error: undefined });
  });

  afterEach(() => jest.clearAllMocks());

  // ── Loading / Error / Empty ─────────────────────────────────────────────────

  test('shows loading spinner', () => {
    mockUsePeople.mockReturnValue({ isLoading: true, data: undefined, error: undefined });
    renderPage();
    expect(screen.getByText('Loading people…')).toBeInTheDocument();
  });

  test('shows error alert', () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: undefined, error: new Error('Network fail') });
    renderPage();
    expect(screen.getByText(/Could not load people/)).toBeInTheDocument();
    expect(screen.getByText(/Network fail/)).toBeInTheDocument();
  });

  test('shows empty state with Add person button', () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    expect(screen.getByText('No people yet')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /add person/i }).length).toBeGreaterThanOrEqual(1);
  });

  // ── People list ─────────────────────────────────────────────────────────────

  test('renders person name, role, and company', () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: [PILOT_PERSON], error: undefined });
    renderPage();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Site Engineer · Acme Corp')).toBeInTheDocument();
  });

  test('renders person email and phone', () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: [PILOT_PERSON], error: undefined });
    renderPage();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('+61 400 000 001')).toBeInTheDocument();
  });

  test('renders tag chip for assigned badge', () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: [PILOT_PERSON], error: undefined });
    renderPage();
    expect(screen.getByText('tag-001')).toBeInTheDocument();
  });

  test('renders person count chip', () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: [PILOT_PERSON], error: undefined });
    renderPage();
    expect(screen.getByText('1 person')).toBeInTheDocument();
  });

  test('page heading is correct', () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: [PILOT_PERSON], error: undefined });
    renderPage();
    expect(screen.getByRole('heading', { name: 'People' })).toBeInTheDocument();
  });

  // ── Dialog open / close ─────────────────────────────────────────────────────

  test('opens dialog when Add person is clicked', () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: /add person/i })[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('New person')).toBeInTheDocument();
  });

  test('closes dialog on Cancel', () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: /add person/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // ── Form validation ─────────────────────────────────────────────────────────

  test('shows validation error when first name is empty', async () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: /add person/i })[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /add person/i }));
    expect(await screen.findByText('First name is required.')).toBeInTheDocument();
  });

  test('shows validation error when last name is empty', async () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: /add person/i })[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /add person/i }));
    expect(await screen.findByText('Last name is required.')).toBeInTheDocument();
  });

  // ── Optimistic creation ─────────────────────────────────────────────────────

  test('creates person and adds them to the list optimistically', async () => {
    jest.useFakeTimers();
    mockUsePeople.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();

    // Open dialog
    fireEvent.click(screen.getAllByRole('button', { name: /add person/i })[0]);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/last name/i),  { target: { value: 'Johnson' } });

    // Submit (scoped to dialog to avoid matching header/empty-state buttons)
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /add person/i }));

    // Advance past the 600 ms simulated async delay
    await act(async () => { jest.advanceTimersByTime(1000); });

    // Dialog should be closed and new person should appear in the list
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();

    jest.useRealTimers();
  });

  test('shows people count chip for multiple people', () => {
    mockUsePeople.mockReturnValue({ isLoading: false, data: [PILOT_PERSON, { ...PILOT_PERSON, id: 'p2', firstName: 'Bob', lastName: 'Lee', tagId: null }], error: undefined });
    renderPage();
    expect(screen.getByText('2 persons')).toBeInTheDocument();
  });
});
