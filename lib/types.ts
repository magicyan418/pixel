export interface CommandHistory {
  type: "command" | "response"
  content: string
}

// Extend Window interface to include our custom functions
declare global {
  interface Window {
    clearTerminal: () => void
  }
}
