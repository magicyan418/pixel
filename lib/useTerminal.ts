"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommandHistory } from "@/lib/types";
import { executeCommand } from "@/lib/commands";

/**
 * 通用终端控制器 Hook：封装命令处理、历史记录、清屏与特殊效果
 * 在任意页面复用：
 * const { history, onCommand, terminalRef, clear } = useTerminal();
 * <Terminal history={history} onCommand={onCommand} ref={terminalRef} />
 */
export function useTerminal() {
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const ipcardExecutedRef = useRef<boolean>(false);
  const router = useRouter();

  const safeJsonParse = useCallback((str: string) => {
    try {
      return JSON.parse(str);
    } catch (_) {
      return { type: str };
    }
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    ipcardExecutedRef.current = false;
  }, []);

  // 暴露到 window 供 commands 内部调用 clearTerminal()
  useEffect(() => {
    window.clearTerminal = clear;
  }, [clear]);

  const onCommand = useCallback((command: string) => {
    // 记录命令
    setHistory((prev) => [...prev, { type: "command", content: command }]);

    const cmd = command.trim().toLowerCase();

    // 特殊处理: ipcard（只允许展示一次，直到 clear）
    if (cmd === "ipcard") {
      if (!ipcardExecutedRef.current) {
        ipcardExecutedRef.current = true;
        const ipCardUrl = `https://api.oick.cn/api/netcard?apikey=57d43fec348c418e9739271e4eef76a2`;

        setTimeout(() => {
          setHistory((prev) => [
            ...prev,
            {
              type: "response",
              content: `<img src="${ipCardUrl}" alt="IP签名档" />`,
            },
          ]);

          // 尝试滚动到底部
          const root = terminalRef.current;
          if (root) {
            const scrollElement = root.querySelector(
              ".terminal-scrollbar"
            ) as HTMLDivElement | null;
            if (scrollElement) {
              setTimeout(() => {
                scrollElement.scrollTop = scrollElement.scrollHeight;
              }, 100);
            }
          }
        }, 300);
        return;
      }

      // 已经显示过，提示用户
      setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          {
            type: "response",
            content:
              "IP签名档已经显示在上方。如需刷新，请先清除终端（clear命令）后再试。",
          },
        ]);
      }, 300);
      return;
    }

    // 特殊处理: matrix（页面级全屏效果）
    if (cmd === "matrix") {
      setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          {
            type: "response",
            content:
              "<span style='color: #00ff00;'>Initializing the Matrix...</span>",
          },
        ]);

        setTimeout(() => {
          const canvas = document.createElement("canvas");
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          canvas.style.position = "fixed";
          canvas.style.top = "0";
          canvas.style.left = "0";
          canvas.style.zIndex = "1000";
          canvas.style.backgroundColor = "black";
          document.body.appendChild(canvas);

          const ctx = canvas.getContext("2d");
          const fontSize = 16;
          const columns = Math.floor(canvas.width / fontSize);
          const drops: number[] = [];
          for (let i = 0; i < columns; i++) drops[i] = 1;

          const draw = () => {
            if (!ctx) return;
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#0f0";
            ctx.font = `${fontSize}px monospace`;
            for (let i = 0; i < drops.length; i++) {
              const text = String.fromCharCode(Math.floor(Math.random() * 94) + 33);
              ctx.fillText(text, i * fontSize, drops[i] * fontSize);
              if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
              }
              drops[i]++;
            }
          };

          const interval = setInterval(draw, 33);
          setTimeout(() => {
            clearInterval(interval);
            document.body.removeChild(canvas);
          }, 10000);
        }, 1000);
      }, 300);

      return;
    }

    // 清屏时重置 ipcard 标记
    if (cmd === "clear") {
      ipcardExecutedRef.current = false;
    }

    // 交给命令系统处理
    let result = executeCommand(command);
    const parsedResult = safeJsonParse(result);
    const { type } = parsedResult as { type?: string };

    if (type === "SPECIAL_COMMAND_IPCARD") {
      // 已在上面处理
      return;
    }
    if (type === "SPECIAL_COMMAND_MATRIX") {
      // 已在上面处理
      return;
    }
    if (type === "SPECIAL_COMMAND_GOTO") {
      result = "正在跳转到路由 " + (parsedResult as any).routeName + " ...";
      router.push((parsedResult as any).routerUrl);
    }

    setTimeout(() => {
      setHistory((prev) => [...prev, { type: "response", content: result }]);
    }, 300);
  }, [router, safeJsonParse]);

  return { history, onCommand, terminalRef, clear };
}


