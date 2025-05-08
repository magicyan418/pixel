"use client";

import { useState, useEffect, useRef } from "react";
import Terminal from "@/components/Terminal";
import { executeCommand } from "@/lib/commands";
import type { CommandHistory } from "@/lib/types";
import { SplineScene } from "@/components/Robot/splite";
import { Spotlight } from "@/components/Robot/spotlight";

export default function Home() {
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleCommand = (command: string) => {
    // Add command to history
    setHistory((prev) => [...prev, { type: "command", content: command }]);

    // Execute command and get result
    const result = executeCommand(command);

    // Add result to history
    setTimeout(() => {
      setHistory((prev) => [...prev, { type: "response", content: result }]);
    }, 300); // Small delay for cool effect
  };

  const clearHistory = () => {
    setHistory([]);
  };

  // Expose clear function to the command executor
  useEffect(() => {
    window.clearTerminal = clearHistory;
  }, []);

  return (
    <div
      className="h-screen w-full bg-white text-black relative overflow-hidden font-serif"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 flex flex-col">
        {/* Main content */}
        <div className="flex-grow flex flex-col md:flex-row">
          {/* Left content - Terminal */}
          <div className="w-full md:w-1/2 h-full flex flex-col">
            <div
              className="absolute pointer-events-none bg-red-500 rounded-full opacity-[0.7] blur-md transition-transform duration-300 ease-out"
              style={{
                width: "250px",
                height: "250px",
                left: `${mousePosition.x - 125}px`,
                top: `${mousePosition.y - 125}px`,
                transform: `translate(${(mousePosition.x - 125) * 0.02}px, ${
                  (mousePosition.y - 125) * 0.02
                }px)`,
              }}
            />
            <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black">
              <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-2xl font-mono mb-4 gradient-text text-glow text-center font-bold">
                  Web Terminal
                </h1>
                <Terminal
                  history={history}
                  onCommand={handleCommand}
                  ref={terminalRef}
                />
              </div>
            </main>
          </div>

          {/* Right content - 3D Scene */}
          <div className="w-full md:w-1/2 h-full relative bg-black overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 grid-background"></div>
            <div className="relative z-10 w-full h-full">
              <Spotlight className="left-1/2 top-1/2" size={200} />
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
