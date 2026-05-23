import { render, screen, fireEvent } from '@testing-library/react';
import ViewerControls from './ViewerControls';

describe('ViewerControls', () => {
  const noop = jest.fn();

  afterEach(() => jest.clearAllMocks());

  test('renders point size slider', () => {
    render(<ViewerControls onPointSizeChange={noop} onColourByHeightChange={noop} onResetView={noop} />);
    expect(screen.getByLabelText('Point size')).toBeInTheDocument();
  });

  test('renders colour-by-height toggle', () => {
    render(<ViewerControls onPointSizeChange={noop} onColourByHeightChange={noop} onResetView={noop} />);
    expect(screen.getByText(/colour by height/i)).toBeInTheDocument();
  });

  test('renders reset view button', () => {
    render(<ViewerControls onPointSizeChange={noop} onColourByHeightChange={noop} onResetView={noop} />);
    expect(screen.getByText(/reset view/i)).toBeInTheDocument();
  });

  test('calls onPointSizeChange when slider changes', () => {
    const onChange = jest.fn();
    render(<ViewerControls onPointSizeChange={onChange} onColourByHeightChange={noop} onResetView={noop} />);
    const slider = screen.getByLabelText('Point size');
    fireEvent.change(slider, { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith(3);
  });

  test('calls onColourByHeightChange when toggle is clicked', () => {
    const onToggle = jest.fn();
    render(<ViewerControls onPointSizeChange={noop} onColourByHeightChange={onToggle} onResetView={noop} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(onToggle).toHaveBeenCalled();
  });

  test('calls onResetView when reset button is clicked', () => {
    const onReset = jest.fn();
    render(<ViewerControls onPointSizeChange={noop} onColourByHeightChange={noop} onResetView={onReset} />);
    fireEvent.click(screen.getByText(/reset view/i));
    expect(onReset).toHaveBeenCalled();
  });

  test('slider has default value of 1.5', () => {
    render(<ViewerControls onPointSizeChange={noop} onColourByHeightChange={noop} onResetView={noop} />);
    const slider = screen.getByLabelText('Point size') as HTMLInputElement;
    expect(parseFloat(slider.value)).toBe(1.5);
  });

  test('colour toggle starts unchecked', () => {
    render(<ViewerControls onPointSizeChange={noop} onColourByHeightChange={noop} onResetView={noop} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(false);
  });
});
