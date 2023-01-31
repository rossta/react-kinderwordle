import { render, screen, within } from '@testing-library/react';
import App from './App';

test('renders title', () => {
  render(<App />);
  const { getByText } = within(screen.getByRole('title'));
  expect(getByText('Kinderwordle')).toBeInTheDocument();
});
