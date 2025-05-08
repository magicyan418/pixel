"use client"

import type React from "react"

import { useState, useEffect, useRef, forwardRef, type ForwardedRef } from "react"
import type { CommandHistory } from "@/lib/types"

interface TerminalProps {
  history: CommandHistory[]
  onCommand: (command: string) => void
}

const Terminal = forwardRef(({ history, onCommand }: TerminalProps, ref: ForwardedRef<HTMLDivElement>) => {
  const [input, setInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalContentRef = useRef<HTMLDivElement>(null)

  // Focus input when terminal is clicked
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle command submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onCommand(input)
      setCommandHistory((prev) => [input, ...prev])
      setInput("")
      setHistoryIndex(-1)
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 500)
    }
  }

  // Handle keyboard navigation through command history
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    }
  }

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight
    }
  }, [history])

  // Focus input on initial render
  useEffect(() => {
    focusInput()
  }, [])

  return (
    <div
      ref={ref}
      className="w-full h-[70vh] terminal-window rounded-md overflow-hidden flex flex-col"
      onClick={focusInput}
    >
      {/* Terminal header with buttons */}
      <div className="terminal-header flex items-center px-4 py-2">
        <div className="flex">
          <div className="terminal-button terminal-button-red"></div>
          <div className="terminal-button terminal-button-yellow"></div>
          <div className="terminal-button terminal-button-green"></div>
        </div>
        <div className="mx-auto text-center gradient-text font-semibold">Web Terminal v1.0.0</div>
      </div>

      <div ref={terminalContentRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm terminal-scrollbar">
        {/* Welcome message */}
        <div className="mb-4">
          <p className="gradient-text text-glow font-bold text-lg">Welcome to Web Terminal v1.0.0</p>
          <p className="text-gray-400">
            Type <span className="gradient-text-blue text-glow-blue">&apos;help&apos;</span> to see available commands
          </p>
        </div>

        {/* Command history */}
        {history.map((item, index) => (
          <div key={index} className="mb-2">
            {item.type === "command" ? (
              <div>
                <span className="gradient-text-blue text-glow-blue">user@magicyan418</span>
                <span className="text-white">:</span>
                <span className="gradient-text-purple text-glow-purple">~</span>
                <span className="text-white">$ </span>
                <span className={isTyping && index === history.length - 1 ? "typing-animation" : ""}>
                  {item.content}
                </span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap ml-2 gradient-text-gold">{item.content}</div>
            )}
          </div>
        ))}
      </div>

      {/* Command input */}
      <div className="border-t border-gray-800 bg-black bg-opacity-70 p-2">
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="flex-shrink-0">
            <span className="gradient-text-blue text-glow-blue">user@magicyan418</span>
            <span className="text-white">:</span>
            <span className="gradient-text-purple text-glow-purple">~</span>
            <span className="text-white">$ </span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none gradient-text ml-1"
            aria-label="Terminal input"
          />
        </form>
      </div>
    </div>
  )
})

Terminal.displayName = "Terminal"

export default Terminal
