import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddPatient from "../components/AddPatient";
import axios from "../services/api";

// Mocking the axios module to simulate backend API requests
jest.mock("../services/api");

describe("AddPatient Component", () => {
  beforeEach(() => {
    // Resetting the mock before each test
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
  });

  test("should render the Add Patient form", () => {
    render(<AddPatient />);

    // Check if form fields are rendered
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Blood Group:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gender:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Profile/i })).toBeInTheDocument();
  });

  test("should show error message when required fields are empty", async () => {
    render(<AddPatient />);

    fireEvent.click(screen.getByRole("button", { name: /Add Profile/i }));

    // Expect error messages
    expect(await screen.findByText(/Name is required./i)).toBeInTheDocument();
    expect(await screen.findByText(/Mobile Number is required./i)).toBeInTheDocument();
    expect(await screen.findByText(/Blood Group is required./i)).toBeInTheDocument();
    expect(await screen.findByText(/Age is required./i)).toBeInTheDocument();
    expect(await screen.findByText(/Address is required./i)).toBeInTheDocument();
  });

  test("should validate mobile number format", async () => {
    render(<AddPatient />);

    fireEvent.change(screen.getByLabelText(/Mobile Number:/i), {
      target: { value: "12345" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Add Profile/i }));

    // Expect validation error for mobile number
    expect(await screen.findByText(/Please enter a valid 10-digit mobile number./i)).toBeInTheDocument();
  });

  test("should validate age", async () => {
    render(<AddPatient />);

    fireEvent.change(screen.getByLabelText(/Age:/i), {
      target: { value: "-5" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Add Profile/i }));

    // Expect validation error for age
    expect(await screen.findByText(/Please enter a valid age./i)).toBeInTheDocument();
  });

  test("should disable submit button when form is submitting", () => {
    render(<AddPatient />);

    fireEvent.change(screen.getByLabelText(/Name:/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Mobile Number:/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/Blood Group:/i), {
      target: { value: "O+" },
    });
    fireEvent.change(screen.getByLabelText(/Age:/i), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText(/Address:/i), {
      target: { value: "1234 Main St" },
    });

    // Simulate loading state
    axios.post.mockResolvedValueOnce({ data: { patientId: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: /Add Profile/i }));

    // Check if button is disabled during the request
    expect(screen.getByRole("button", { name: /Add Profile/i })).toBeDisabled();
  });

  test("should handle successful profile creation", async () => {
    render(<AddPatient />);

    // Mock successful POST request
    axios.post.mockResolvedValueOnce({ data: { patientId: "1234" } });

    fireEvent.change(screen.getByLabelText(/Name:/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Mobile Number:/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/Blood Group:/i), {
      target: { value: "O+" },
    });
    fireEvent.change(screen.getByLabelText(/Age:/i), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText(/Address:/i), {
      target: { value: "1234 Main St" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Profile/i }));

    await waitFor(() => {
      expect(screen.getByText("Profile added successfully! Check your email for the patient ID.")).toBeInTheDocument();
    });
  });

  test("should handle error during profile submission", async () => {
    render(<AddPatient />);

    // Mock error during POST request
    axios.post.mockRejectedValueOnce(new Error("Failed to add profile"));

    fireEvent.change(screen.getByLabelText(/Name:/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Mobile Number:/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/Blood Group:/i), {
      target: { value: "O+" },
    });
    fireEvent.change(screen.getByLabelText(/Age:/i), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText(/Address:/i), {
      target: { value: "1234 Main St" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Profile/i }));

    await waitFor(() => {
      expect(screen.getByText("Error saving profile. Please try again.")).toBeInTheDocument();
    });
  });
});
