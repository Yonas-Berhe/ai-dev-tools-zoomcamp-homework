/**
 * Frontend Integration Tests
 * Tests for React components and services
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import api from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  default: {
    createSession: vi.fn(),
    getSession: vi.fn(),
    listSessions: vi.fn(),
    deleteSession: vi.fn(),
  },
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHome = () => {
    return render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  it('should render the home page with title', () => {
    renderHome();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Real-time Collaborative/i);
    expect(screen.getAllByText(/CodeInterview/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should render create session form', () => {
    renderHome();

    expect(screen.getByPlaceholderText(/Senior Developer Interview/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Interview Session/i)).toBeInTheDocument();
  });

  it('should render join session form', () => {
    renderHome();

    expect(screen.getByPlaceholderText(/Paste the interview link/i)).toBeInTheDocument();
    expect(screen.getByText(/Join Interview/i)).toBeInTheDocument();
  });

  it('should render language selector with default JavaScript', () => {
    renderHome();

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('javascript');
  });

  it('should have all supported languages in dropdown', () => {
    renderHome();

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));
    const languages = options.map((opt) => opt.value);

    expect(languages).toContain('javascript');
    expect(languages).toContain('python');
    expect(languages).toContain('java');
    expect(languages).toContain('typescript');
    expect(languages).toContain('cpp');
  });

  it('should update form fields on input', () => {
    renderHome();

    const titleInput = screen.getByPlaceholderText(/Senior Developer Interview/i);
    fireEvent.change(titleInput, { target: { value: 'My Interview' } });

    expect(titleInput).toHaveValue('My Interview');
  });

  it('should call createSession API on form submit', async () => {
    api.createSession.mockResolvedValue({
      id: 'test-session-id',
      link: 'http://localhost:5173/interview/test-session-id',
    });

    renderHome();

    const titleInput = screen.getByPlaceholderText(/Senior Developer Interview/i);
    fireEvent.change(titleInput, { target: { value: 'Test Session' } });

    const submitButton = screen.getByText(/Create Interview Session/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Session',
          language: 'javascript',
        })
      );
    });
  });

  it('should display error message on API failure', async () => {
    api.createSession.mockRejectedValue(new Error('Network error'));

    renderHome();

    const submitButton = screen.getByText(/Create Interview Session/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('should disable join button when session ID is empty', () => {
    renderHome();

    const joinButton = screen.getByText(/Join Interview/i);
    expect(joinButton).toBeDisabled();
  });

  it('should enable join button when session ID is entered', () => {
    renderHome();

    const input = screen.getByPlaceholderText(/Paste the interview link/i);
    fireEvent.change(input, { target: { value: 'some-session-id' } });

    const joinButton = screen.getByText(/Join Interview/i);
    expect(joinButton).not.toBeDisabled();
  });

  it('should render feature cards', () => {
    renderHome();

    expect(screen.getByText(/Real-time Collaboration/i)).toBeInTheDocument();
    expect(screen.getByText(/Instant Execution/i)).toBeInTheDocument();
    expect(screen.getByText(/Multiple Languages/i)).toBeInTheDocument();
  });

  it('should render how it works section', () => {
    renderHome();

    expect(screen.getByText(/How it works/i)).toBeInTheDocument();
    expect(screen.getByText(/Create a new interview session/i)).toBeInTheDocument();
    expect(screen.getByText(/Share the link with your candidate/i)).toBeInTheDocument();
    // Use getAllByText for text that appears multiple times
    expect(screen.getAllByText(/Code together in real-time/i).length).toBeGreaterThanOrEqual(1);
  });
});
