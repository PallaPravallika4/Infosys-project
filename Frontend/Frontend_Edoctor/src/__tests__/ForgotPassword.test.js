import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPassword from "./ForgotPassword";
import api from "../services/api"; // Mock the API service
import { BrowserRouter as Router } from "react-router-dom";

// Mock Axios API response
jest.mock("../services/api");

describe("ForgotPassword Component", () => {
  it("should render the Forgot Password form", () => {
    render(
      <Router>
        <ForgotPassword />
      </Router>
    );

    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send otp/i })).toBeInTheDocument();
  });

  it("should show error if email is empty and the form is submitted", async () => {
    render(
      <Router>
        <ForgotPassword />
      </Router>
    );

    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it("should show error if email format is invalid", async () => {
    render(
      <Router>
        <ForgotPassword />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it("should send OTP and display success message", async () => {
    api.post.mockResolvedValueOnce({ data: "Reset password link sent successfully!" });

    render(
      <Router>
        <ForgotPassword />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() => {
      expect(screen.getByText(/reset password link sent successfully/i)).toBeInTheDocument();
    });
  });

  it("should show error message if API request fails", async () => {
    api.post.mockRejectedValueOnce({ response: { data: { error: "Failed to send reset password token" } } });

    render(
      <Router>
        <ForgotPassword />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() => {
      expect(screen.getByText(/error: failed to send reset password token/i)).toBeInTheDocument();
    });
  });

  it("should navigate to reset-password page after successful OTP request", async () => {
    api.post.mockResolvedValueOnce({ data: "Reset password link sent successfully!" });

    const { container } = render(
      <Router>
        <ForgotPassword />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() => {
      expect(container).toContainHTML("/reset-password");
    });
  });
});
