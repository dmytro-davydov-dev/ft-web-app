import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SitePage from './SitePage';

describe('SitePage', () => {
  test('renders current site id from route params', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/site-17']}>
        <Routes>
          <Route path="/dashboard/:siteId" element={<SitePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Site detail')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Site: site-17' })).toBeInTheDocument();
    expect(screen.getByText('Site-level data and floor map will be wired in Phase 4.')).toBeInTheDocument();
  });
});
