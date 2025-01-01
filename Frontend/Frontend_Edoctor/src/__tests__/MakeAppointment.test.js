import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MakeAppointment from "../MakeAppointment";
import axios from "../services/api";

// Mock axios to simulate API calls
jest.mock("../services/api");

describe("MakeAppointment", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should render the appointment form correctly", () => {
    render(<MakeAppointment />);

    // Check if the form elements are present
    expect(screen.getByLabelText(/Doctor ID:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Appointment Date & Time:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason:/i)).toBeInTheDocument();
    expect(screen.getByText(/Book Appointment/i)).toBeInTheDocument();
  });

  it("should show validation errors when the form is submitted with missing fields", async () => {
    render(<MakeAppointment />);

    // Click the submit button without filling out the form
    fireEvent.click(screen.getByText(/Book Appointment/i));

    // Check for error messages
    await waitFor(() => {
      expect(screen.getByText(/Doctor ID is required./i)).toBeInTheDocument();
      expect(screen.getByText(/Appointment date and time are required./i)).toBeInTheDocument();
      expect(screen.getByText(/Reason is required./i)).toBeInTheDocument();
    });
  });

  it("should call the API and submit the form successfully", async () => {
    // Mock axios post success response
    axios.post.mockResolvedValueOnce({ data: {} });

    render(<MakeAppointment />);

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/Doctor ID:/i), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText(/Appointment Date & Time:/i), { target: { value: "2025-01-01T10:00" } });
    fireEvent.change(screen.getByLabelText(/Reason:/i), { target: { value: "Checkup" } });

    // Submit the form
    fireEvent.click(screen.getByText(/Book Appointment/i));

    // Check if success alert is displayed
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Appointment booked successfully!"));

    // Check if form fields are cleared
    expect(screen.getByLabelText(/Doctor ID:/i).value).toBe("");
    expect(screen.getByLabelText(/Appointment Date & Time:/i).value).toBe("");
    expect(screen.getByLabelText(/Reason:/i).value).toBe("");
  });

  it("should show an error alert when the appointment booking fails", async () => {
    // Mock axios post failure response
    axios.post.mockRejectedValueOnce(new Error("Failed to book appointment"));

    render(<MakeAppointment />);

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/Doctor ID:/i), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText(/Appointment Date & Time:/i), { target: { value: "2025-01-01T10:00" } });
    fireEvent.change(screen.getByLabelText(/Reason:/i), { target: { value: "Checkup" } });

    // Submit the form
    fireEvent.click(screen.getByText(/Book Appointment/i));

    // Check if error alert is displayed
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Failed to book appointment. Please try again."));
  });

  it("should show validation errors if the form is incomplete", async () => {
    render(<MakeAppointment />);

    // Leave the fields empty and click submit
    fireEvent.click(screen.getByText(/Book Appointment/i));

    // Check that the validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/Doctor ID is required./i)).toBeInTheDocument();
      expect(screen.getByText(/Appointment date and time are required./i)).toBeInTheDocument();
      expect(screen.getByText(/Reason is required./i)).toBeInTheDocument();
    });
  });

  it("should update the input values correctly when typed into", () => {
    render(<MakeAppointment />);

    // Check the inputs for doctor ID, appointment date, and reason
    fireEvent.change(screen.getByLabelText(/Doctor ID:/i), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText(/Appointment Date & Time:/i), { target: { value: "2025-01-01T10:00" } });
    fireEvent.change(screen.getByLabelText(/Reason:/i), { target: { value: "Checkup" } });

    // Assert that the values are updated in the form fields
    expect(screen.getByLabelText(/Doctor ID:/i).value).toBe("123");
    expect(screen.getByLabelText(/Appointment Date & Time:/i).value).toBe("2025-01-01T10:00");
    expect(screen.getByLabelText(/Reason:/i).value).toBe("Checkup");
  });
});
