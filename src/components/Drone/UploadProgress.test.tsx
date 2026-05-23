import { render, screen } from '@testing-library/react';
import UploadProgress from './UploadProgress';

describe('UploadProgress', () => {
  test('renders file count correctly', () => {
    render(<UploadProgress total={100} uploaded={45} failedFiles={[]} />);
    expect(screen.getByText(/45 \/ 100/)).toBeInTheDocument();
  });

  test('renders 0% when no files uploaded', () => {
    render(<UploadProgress total={50} uploaded={0} failedFiles={[]} />);
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  test('renders 100% when all files uploaded', () => {
    render(<UploadProgress total={50} uploaded={50} failedFiles={[]} />);
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  test('renders progress bar', () => {
    render(<UploadProgress total={100} uploaded={50} failedFiles={[]} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows failed file names when failedFiles is non-empty', () => {
    render(<UploadProgress total={10} uploaded={8} failedFiles={['photo1.jpg', 'photo2.jpg']} />);
    expect(screen.getByText('photo1.jpg')).toBeInTheDocument();
    expect(screen.getByText('photo2.jpg')).toBeInTheDocument();
    expect(screen.getByText(/2 failed/i)).toBeInTheDocument();
  });

  test('does not show failed section when failedFiles is empty', () => {
    render(<UploadProgress total={10} uploaded={10} failedFiles={[]} />);
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
  });

  test('shows ETA when startedAt is provided and upload is in progress', () => {
    const startedAt = Date.now() - 5000; // 5 seconds ago
    render(<UploadProgress total={100} uploaded={10} failedFiles={[]} startedAt={startedAt} />);
    expect(screen.getByText(/estimated time remaining/i)).toBeInTheDocument();
  });

  test('does not show ETA when upload not started', () => {
    render(<UploadProgress total={100} uploaded={0} failedFiles={[]} />);
    expect(screen.queryByText(/estimated time remaining/i)).not.toBeInTheDocument();
  });

  test('does not show ETA when upload is complete', () => {
    const startedAt = Date.now() - 5000;
    render(<UploadProgress total={100} uploaded={100} failedFiles={[]} startedAt={startedAt} />);
    expect(screen.queryByText(/estimated time remaining/i)).not.toBeInTheDocument();
  });
});
