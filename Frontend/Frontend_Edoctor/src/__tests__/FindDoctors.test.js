import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FindDoctors from "../FindDoctors";
import axios from "../services/api";
import { BrowserRouter as Router } from "react-router-dom";

// Mock axios to simulate API calls
jest.mock("../services/api");

describe("FindDoctors", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock localStorage for username
    Storage.prototype.getItem = jest.fn(() => "testUser");
  });

  it("should render the Find Doctors page with search options", () => {
    render(
      <Router>
        <FindDoctors />
      </Router>
    );

    // Check if the search options are displayed
    expect(screen.getByText(/View All Doctors/i)).toBeInTheDocument();
    expect(screen.getByText(/Search Doctor by Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Search Doctor by Specialization/i)).toBeInTheDocument();
  });

  it("should show validation error when the doctor name field is empty and search is triggered", async () => {
    render(
      <Router>
        <FindDoctors />
      </Router>
    );

    // Trigger search by name with empty input
    fireEvent.click(screen.getByText(/Search Doctor by Name/i));

    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Doctor name is required./i)).toBeInTheDocument();
    });
  });

  it("should fetch and display doctors by name", async () => {
    const mockDoctors = [
      { doctorId: 1, name: "Dr. John", specialization: "Cardiologist", location: "New York", hospitalName: "HealthCare", chargedPerVisit: 500 },
    ];

    // Mock API response
    axios.get.mockResolvedValueOnce({ data: mockDoctors });

    render(
      <Router>
        <FindDoctors />
      </Router>
    );

    // Fill in the name input and search
    fireEvent.change(screen.getByPlaceholderText(/Enter Name/i), { target: { value: "John" } });
    fireEvent.click(screen.getByText(/Search Doctor by Name/i));

    // Wait for the result and check if doctors are displayed
    await waitFor(() => {
      expect(screen.getByText(/Dr. John/i)).toBeInTheDocument();
      expect(screen.getByText(/Cardiologist/i)).toBeInTheDocument();
    });
  });

  it("should display an alert when no doctors are found by name", async () => {
    // Mock API response with empty array
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <Router>
        <FindDoctors />
      </Router>
    );

    // Fill in the name input and search
    fireEvent.change(screen.getByPlaceholderText(/Enter Name/i), { target: { value: "NonExisting" } });
    fireEvent.click(screen.getByText(/Search Doctor by Name/i));

    // Wait for alert to be triggered
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("No doctors found for the given name."));
  });

  it("should fetch and display doctors by specialization", async () => {
    const mockDoctors = [
      { doctorId: 1, name: "Dr. Smith", specialization: "Dentist", location: "California", hospitalName: "SmileCare", chargedPerVisit: 300 },
    ];

    // Mock API response
    axios.get.mockResolvedValueOnce({ data: mockDoctors });

    render(
      <Router>
        <FindDoctors />
      </Router>
    );

    // Fill in the specialization input and search
    fireEvent.change(screen.getByPlaceholderText(/Enter Specialization/i), { target: { value: "Dentist" } });
    fireEvent.click(screen.getByText(/Search Doctor by Specialization/i));

    // Wait for the result and check if doctors are displayed
    await waitFor(() => {
      expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Dentist/i)).toBeInTheDocument();
    });
  });

  it("should display an alert when no doctors are found by specialization", async () => {
    // Mock API response with empty array
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <Router>
        <FindDoctors />
      </Router>
    );

    // Fill in the specialization input and search
    fireEvent.change(screen.getByPlaceholderText(/Enter Specialization/i), { target: { value: "NonExistingSpecialization" } });
    fireEvent.click(screen.getByText(/Search Doctor by Specialization/i));

    // Wait for alert to be triggered
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("No doctors found for the selected specialization."));
  });

  it("should reset search options when the 'Back to Search' button is clicked", () => {
    render(
      <Router>
        <FindDoctors />
      </Router>
    );

    // Simulate search results being displayed
    fireEvent.click(screen.getByText(/View All Doctors/i));

    // Check if 'Back to Search' button is shown
    fireEvent.click(screen.getByText(/Back to Search/i));

    // Check if the search options are visible again
    expect(screen.getByText(/View All Doctors/i)).toBeInTheDocument();
  });

  it("should call the API to fetch all doctors", async () => {
    const mockDoctors = [
      { doctorId: 1, name: "Dr. Alice", specialization: "Neurologist", location: "Los Angeles", hospitalName: "BrainCare", chargedPerVisit: 700 },
    ];

    // Mock API response
    axios.get.mockResolvedValueOnce({ data: mockDoctors });

    render(
      <Router>
        <FindDoctors />
      </Router>
    );

    // Click on 'View All Doctors'
    fireEvent.click(screen.getByText(/View All Doctors/i));

    // Check if doctors are displayed
    
    });
  });
