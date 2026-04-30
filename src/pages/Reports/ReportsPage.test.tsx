/**
 * ReportsPage tests.
 * Mocks all 5 child chart/table components to keep tests fast.
 * Verifies tab navigation renders the correct component.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportsPage from './ReportsPage';

jest.mock('./AreaOccupancy',  () => ({ __esModule: true, default: () => <div>AreaOccupancy</div>   }));
jest.mock('./FloorOccupancy', () => ({ __esModule: true, default: () => <div>FloorOccupancy</div>  }));
jest.mock('./Utilisation',    () => ({ __esModule: true, default: () => <div>Utilisation</div>     }));
jest.mock('./PeopleDay',      () => ({ __esModule: true, default: () => <div>PeopleDay</div>       }));
jest.mock('./Alerts',         () => ({ __esModule: true, default: () => <div>Alerts</div>          }));

describe('ReportsPage', () => {
  test('renders page heading', () => {
    render(<ReportsPage />);
    expect(screen.getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    expect(screen.getByText('Analyze')).toBeInTheDocument();
  });

  test('renders all 5 tab buttons', () => {
    render(<ReportsPage />);
    expect(screen.getByRole('tab', { name: 'Area Occupancy'  })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Floor Occupancy' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Utilisation'     })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'People Day'      })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Alerts'          })).toBeInTheDocument();
  });

  test('shows AreaOccupancy by default', () => {
    render(<ReportsPage />);
    expect(screen.getByText('AreaOccupancy')).toBeInTheDocument();
    expect(screen.queryByText('FloorOccupancy')).toBeNull();
  });

  test('switches to Floor Occupancy tab', async () => {
    render(<ReportsPage />);
    await userEvent.click(screen.getByRole('tab', { name: 'Floor Occupancy' }));
    expect(screen.getByText('FloorOccupancy')).toBeInTheDocument();
    expect(screen.queryByText('AreaOccupancy')).toBeNull();
  });

  test('switches to Utilisation tab', async () => {
    render(<ReportsPage />);
    await userEvent.click(screen.getByRole('tab', { name: 'Utilisation' }));
    expect(screen.getByRole('tab', { name: 'Utilisation' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('AreaOccupancy')).toBeNull();
  });

  test('switches to People Day tab', async () => {
    render(<ReportsPage />);
    await userEvent.click(screen.getByRole('tab', { name: 'People Day' }));
    expect(screen.getByText('PeopleDay')).toBeInTheDocument();
  });

  test('switches to Alerts tab', async () => {
    render(<ReportsPage />);
    await userEvent.click(screen.getByRole('tab', { name: 'Alerts' }));
    // The mock renders <div>Alerts</div>; confirm the tab panel content is present
    // by checking the tab is active and no other chart is shown.
    expect(screen.getByRole('tab', { name: 'Alerts' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('AreaOccupancy')).toBeNull();
  });

  test('active tab has aria-selected=true', async () => {
    render(<ReportsPage />);
    const areaTab = screen.getByRole('tab', { name: 'Area Occupancy' });
    expect(areaTab).toHaveAttribute('aria-selected', 'true');

    const alertsTab = screen.getByRole('tab', { name: 'Alerts' });
    await userEvent.click(alertsTab);
    expect(alertsTab).toHaveAttribute('aria-selected', 'true');
    expect(areaTab).toHaveAttribute('aria-selected', 'false');
  });
});
