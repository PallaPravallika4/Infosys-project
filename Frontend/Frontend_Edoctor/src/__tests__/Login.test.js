import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../components/Login"; // Adjust the path according to your project structure
import { BrowserRouter as Router } from "react-router-dom";

// Mock API module (since backend is not connected)
jest.mock("../services/api", () => ({
  post: jest.fn(),
}));

describe("Login Component", () => {
  test("should render login form correctly", () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    // Check if the login form is rendered
    expect(screen.getByText("LOGIN")).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  test("should show error message for empty username and password", async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Wait for validation error messages
    await waitFor(() => {
      expect(screen.getByText("Username is required.")).toBeInTheDocument();
      expect(screen.getByText("Password is required.")).toBeInTheDocument();
    });
  });

  test("should show error message for invalid username format", async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: "user#1" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "validpassword" } });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Wait for validation error message
    await waitFor(() => {
      expect(screen.getByText("Username can only contain alphanumeric characters.")).toBeInTheDocument();
    });
  });

  test("should show error message for username length less than 3 characters", async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: "us" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "validpassword" } });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Wait for validation error message
    await waitFor(() => {
      expect(screen.getByText("Username must be at least 3 characters long.")).toBeInTheDocument();
    });
  });

  test("should show error message for password length less than 6 characters", async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: "validuser" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "short" } });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Wait for validation error message
    await waitFor(() => {
      expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
    });
  });

  test("should call API and navigate on successful login", async () => {
    const mockNavigate = jest.fn();
    const api = require("../services/api");
    api.post.mockResolvedValueOnce({
      data: { name: "John Doe", role: "ADMIN" },
    });

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: "validuser" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "validpassword" } });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("auth/login", {
        username: "validuser",
        password: "validpassword",
      });
    });

    // Verify redirection to the admin dashboard
    expect(mockNavigate).toHaveBeenCalledWith("/admin-dashboard");
  });

  test("should show error message for failed login attempt", async () => {
    const mockNavigate = jest.fn();
    const api = require("../services/api");
    api.post.mockRejectedValueOnce({
      response: { data: { error: "Login failed. Please check your credentials." } },
    });

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: "wronguser" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "wrongpassword" } });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText("Login failed. Please check your credentials.")).toBeInTheDocument();
    });
  });
});
