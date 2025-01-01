import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../components/Register"; // Adjust the path according to your project structure
import { BrowserRouter as Router } from "react-router-dom";
import api from "../services/api";

// Mock API call
jest.mock("../services/api", () => ({
  post: jest.fn(),
}));

describe("Register Component", () => {
  test("should render the registration form correctly", () => {
    render(
      <Router>
        <Register />
      </Router>
    );

    // Check if form fields are present
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
  });

  test("should show error messages for empty fields", async () => {
    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    // Wait for error messages to appear
    await waitFor(() => {
      expect(screen.getByText("Username is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  test("should show error message for invalid email format", async () => {
    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: "validuser" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "invalidemail" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "validpassword" } });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    // Check for error message on invalid email
    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });
  });

  test("should call the API and navigate on successful registration", async () => {
    const mockNavigate = jest.fn();
    const apiMock = api.post.mockResolvedValueOnce({
      data: { message: "Registration successful!" },
    });

    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: "validuser" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "validemail@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "validpassword" } });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith("/auth/register", {
        username: "validuser",
        email: "validemail@example.com",
        password: "validpassword",
        role: "PATIENT",
      });
    });

    // Verify successful redirection after registration
    expect(mockNavigate).toHaveBeenCalledWith("/verify-email", {
      state: { username: "validuser" },
    });
  });

  test("should show error message for failed registration attempt", async () => {
    const apiMock = api.post.mockRejectedValueOnce({
      response: { data: { message: "Registration failed." } },
    });

    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: "validuser" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "validemail@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "validpassword" } });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText("Registration failed: Registration failed.")).toBeInTheDocument();
    });
  });

  test("should disable register button when submitting", async () => {
    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: "validuser" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "validemail@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "validpassword" } });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    // Check that the register button is disabled when loading
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Registering.../i })).toBeInTheDocument();
    });
  });
});
