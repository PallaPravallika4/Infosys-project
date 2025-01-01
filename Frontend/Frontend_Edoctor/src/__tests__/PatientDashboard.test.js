import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PatientDashboard from "../PatientDashboard";
import { BrowserRouter as Router } from "react-router-dom";
import api from "../services/api";

// Mock API calls
jest.mock("../services/api");

describe("PatientDashboard", () => {
  const mockUsername = "testUser";
  const mockPatientName = "John Doe";

  beforeEach(() => {
    // Mock localStorage
    global.localStorage.setItem("username", mockUsername);
  });

  afterEach(() => {
    // Clean up after each test
    global.localStorage.removeItem("username");
  });

  it("should render the loading state initially", () => {
    api.get.mockResolvedValueOnce({ data: {} }); // Mock successful API call

    render(
      <Router>
        <PatientDashboard />
      </Router>
    );

    // Expect loading message to be displayed
    expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
  });

  it("should render the patient's name when profile is fetched successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { name: mockPatientName } });

    render(
      <Router>
        <PatientDashboard />
      </Router>
    );

    // Wait for profile to load
    await waitFor(() => expect(screen.getByText(/Welcome, John Doe!/i)).toBeInTheDocument());
  });

  it("should render a message if there is an error fetching the profile", async () => {
    api.get.mockRejectedValueOnce(new Error("Failed to fetch"));

    render(
      <Router>
        <PatientDashboard />
      </Router>
    );

    // Wait for error handling to take place and display fallback UI
    await waitFor(() => expect(screen.getByText(/Welcome Patient!/i)).toBeInTheDocument());
  });

  it("should show the dropdown menu when Feedback button is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { name: mockPatientName } });

    render(
      <Router>
        <PatientDashboard />
      </Router>
    );

    // Click the Feedback button
    fireEvent.click(screen.getByText(/Feedback/));

    // Check if the dropdown menu is visible
    expect(screen.getByText(/All Feedbacks/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Feedbacks/i)).toBeInTheDocument();
  });

  it("should hide the dropdown menu when Feedback button is clicked again", async () => {
    api.get.mockResolvedValueOnce({ data: { name: mockPatientName } });

    render(
      <Router>
        <PatientDashboard />
      </Router>
    );

    // Click the Feedback button to open the dropdown
    fireEvent.click(screen.getByText(/Feedback/));

    // Click the Feedback button again to close the dropdown
    fireEvent.click(screen.getByText(/Feedback/));

    // Check if the dropdown menu is hidden
    expect(screen.queryByText(/All Feedbacks/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pending Feedbacks/i)).not.toBeInTheDocument();
  });

  it("should call handleLogout and redirect to login page", async () => {
    api.get.mockResolvedValueOnce({ data: { name: mockPatientName } });

    render(
      <Router>
        <PatientDashboard />
      </Router>
    );

    // Spy on navigate function
    const navigateSpy = jest.fn();
    useNavigate.mockReturnValue(navigateSpy);

    // Click the Logout button
    fireEvent.click(screen.getByText(/Logout/i));

    // Check if navigate function was called to redirect to the login page
    expect(navigateSpy).toHaveBeenCalledWith("/login");
  });
});
