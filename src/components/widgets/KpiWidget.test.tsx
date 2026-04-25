import { render, screen } from '@testing-library/react';
import KpiWidget from './KpiWidget';

describe('KpiWidget', () => {
  test('renders provided label/value/note', () => {
    render(<KpiWidget label="Active tags" value="12" note="Live" />);

    expect(screen.getByText('Active tags')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  test('uses default value when no value is provided', () => {
    render(<KpiWidget label="Gateways online" />);

    expect(screen.getByText('Gateways online')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
