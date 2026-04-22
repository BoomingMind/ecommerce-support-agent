/**
 * InputBox Component
 * ==================
 * Text input form for the chat application.
 * Features:
 * - Text input with placeholder
 * - Send button with icon
 * - Disabled state while loading
 *
 * Props:
 * - onSend: Callback function to handle message submission
 * - isLoading: Boolean to disable input during API calls
 */

import React, { useState } from "react";
import { Send } from "lucide-react";  // Lucide icon for send button
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function InputBox({ onSend, isLoading }) {
  // Local state for the input field value
  const [input, setInput] = useState("");

  /**
   * Handles form submission
   * Prevents default browser behavior and sends message if valid
   */
  const handleSubmit = (e) => {
    e.preventDefault();  // Prevent page reload on form submit

    // Only send if input is not empty and not currently loading
    if (input.trim() && !isLoading) {
      onSend(input);      // Call parent handler
      setInput("");       // Clear input after sending
    }
  };

  return (
    // Form wraps input and button for native submit handling
    <form onSubmit={handleSubmit} className="flex w-full gap-3">
      {/* Text input field */}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={isLoading}  // Disable during API calls
        className="flex-1 bg-white border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
      />

      {/* Send button */}
      <Button
        type="submit"
        disabled={!input.trim() || isLoading}  // Disable if empty or loading
        className="h-11 w-11 p-0 bg-neutral-900 hover:bg-neutral-800 text-white"
      >
        {/* Send icon from lucide-react */}
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

export default InputBox;