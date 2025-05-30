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
  // 用于跟踪ipcard命令是否已经执行
  const ipcardExecutedRef = useRef<boolean>(false);

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

    // 特殊处理ipcard命令，防止重复渲染
    if (command.trim().toLowerCase() === "ipcard") {
      if (!ipcardExecutedRef.current) {
        ipcardExecutedRef.current = true;
        
        // 生成一个固定的缓存URL
        const today = new Date().toISOString().split('T')[0];
        const timestamp = Date.now(); // 添加时间戳确保每次都是新图片
        const ipCardUrl = `https://api.oick.cn/api/netcard?_t=${timestamp}&_cache=${today}`;
        
        // 添加结果到历史记录，使用img标签以便SafeHTML组件能够提取并使用ImageContent组件渲染
        setTimeout(() => {
          setHistory((prev) => [
            ...prev, 
            { 
              type: "response", 
              content: `<img src="${ipCardUrl}" alt="IP签名档" />` 
            }
          ]);
        }, 300);
        
        return;
      } else {
        // 如果已经执行过，提示用户
        setTimeout(() => {
          setHistory((prev) => [
            ...prev, 
            { 
              type: "response", 
              content: "IP签名档已经显示在上方。如需刷新，请先清除终端（clear命令）后再试。" 
            }
          ]);
        }, 300);
        
        return;
      }
    }

    // 如果执行clear命令，重置ipcard执行状态
    if (command.trim().toLowerCase() === "clear") {
      ipcardExecutedRef.current = false;
    }

    // Execute command and get result
    const result = executeCommand(command);

    // 处理特殊命令结果
    if (result === "SPECIAL_COMMAND_IPCARD") {
      // 这个分支不会执行，因为我们已经在上面处理了ipcard命令
      // 但为了代码的完整性，我们保留这个检查
      return;
    }

    // Add result to history
    setTimeout(() => {
      setHistory((prev) => [...prev, { type: "response", content: result }]);
    }, 300); // Small delay for cool effect
  };

  const clearHistory = () => {
    setHistory([]);
    // 重置ipcard执行状态
    ipcardExecutedRef.current = false;
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
                  像素终端
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
