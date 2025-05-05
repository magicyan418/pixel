"use client"

import { useState, useEffect, useRef } from "react"
import Terminal from "@/components/Terminal"
import { executeCommand } from "@/lib/commands"
import type { CommandHistory } from "@/lib/types"

export default function Home() {
  const [history, setHistory] = useState<CommandHistory[]>([])
  const terminalRef = useRef<HTMLDivElement>(null)

  const handleCommand = (command: string) => {
    // Add command to history
    setHistory((prev) => [...prev, { type: "command", content: command }])

    // Execute command and get result
    const result = executeCommand(command)

    // Add result to history
    setTimeout(() => {
      setHistory((prev) => [...prev, { type: "response", content: result }])
    }, 300) // Small delay for cool effect
  }

  const clearHistory = () => {
    setHistory([])
  }

  // Expose clear function to the command executor
  useEffect(() => {
    window.clearTerminal = clearHistory
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gradient-to-b from-gray-900 to-black text-green-500">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-2xl font-mono mb-4 gradient-text text-glow text-center font-bold">Web Terminal</h1>
        <Terminal history={history} onCommand={handleCommand} ref={terminalRef} />
      </div>
    </main>
  )
}
