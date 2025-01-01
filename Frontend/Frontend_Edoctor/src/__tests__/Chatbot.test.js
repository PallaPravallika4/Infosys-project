import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Chatbot from "./Chatbot";
import { FiMessageSquare, FiX, FiArrowUp } from "react-icons/fi";

describe("Chatbot Component", () => {
  it("should render the chatbot toggle button initially", () => {
    render(<Chatbot />);
    const toggleButton = screen.getByRole("button", { name: /message square/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it("should open the chatbot window when the toggle button is clicked", () => {
    render(<Chatbot />);
    const toggleButton = screen.getByRole("button", { name: /message square/i });
    fireEvent.click(toggleButton);

    const chatbotWindow = screen.getByText(/docbot/i);
    expect(chatbotWindow).toBeInTheDocument();
  });

  it("should send a user message and show the bot response", async () => {
    render(<Chatbot />);
    const toggleButton = screen.getByRole("button", { name: /message square/i });
    fireEvent.click(toggleButton);

    const inputField = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole("button", { name: /arrow up/i });

    fireEvent.change(inputField, { target: { value: "hi" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      const botMessage = screen.getByText(/how can i assist you/i);
      expect(botMessage).toBeInTheDocument();
    });
  });

  it("should close the chatbot when the close button is clicked", () => {
    render(<Chatbot />);
    const toggleButton = screen.getByRole("button", { name: /message square/i });
    fireEvent.click(toggleButton);

    const closeButton = screen.getByRole("button", { name: /x/i });
    fireEvent.click(closeButton);

    const toggleButtonAfterClose = screen.getByRole("button", { name: /message square/i });
    expect(toggleButtonAfterClose).toBeInTheDocument();
  });
});
