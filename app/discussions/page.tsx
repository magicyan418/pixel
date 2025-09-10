"use client"

import { useEffect, useRef, useState } from "react"
import { MessageSquare, Terminal, Github, Users, Clock } from "lucide-react"

export default function DiscussionsPage() {
  const giscusRef = useRef<HTMLDivElement>(null)
  const [terminalText, setTerminalText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  const welcomeText = "$ initializing discussion thread..."

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index < welcomeText.length) {
        setTerminalText(welcomeText.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
        setTimeout(() => setTerminalText("$ discussion ready. type your thoughts below ↓"), 1000)
      }
    }, 80)

    // 光标闪烁
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => {
      clearInterval(timer)
      clearInterval(cursorTimer)
    }
  }, [])

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://giscus.app/client.js"
    script.setAttribute("data-repo", "magicyan418/pixel")
    script.setAttribute("data-repo-id", "R_kgDOOZusPg")
    script.setAttribute("data-category", "General")
    script.setAttribute("data-category-id", "DIC_kwDOOZusPs4CsZmP")
    script.setAttribute("data-mapping", "pathname")
    script.setAttribute("data-strict", "0")
    script.setAttribute("data-reactions-enabled", "1")
    script.setAttribute("data-emit-metadata", "0")
    script.setAttribute("data-input-position", "bottom")
    script.setAttribute("data-theme", "dark")
    script.setAttribute("data-lang", "zh-CN")
    script.crossOrigin = "anonymous"
    script.async = true

    if (giscusRef.current) {
      giscusRef.current.appendChild(script)
    }

    return () => {
      if (giscusRef.current) {
        giscusRef.current.innerHTML = ""
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 动态背景 */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern animate-pulse" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* 页面标题区域 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <MessageSquare className="w-8 h-8 text-cyan-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              讨论区
            </h1>
          </div>

          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">在这里分享你的想法，与其他开发者交流技术心得</p>

          {/* 快速统计 */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-sm">
              <Github className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">GitHub 登录</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">实时互动</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">即时通知</span>
            </div>
          </div>
        </div>

        {/* 终端风格的欢迎区域 */}
        <div className="bg-black/80 backdrop-blur-sm border border-green-500/30 rounded-lg mb-8 overflow-hidden">
          <div className="bg-gray-800/50 px-4 py-2 border-b border-green-500/30 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <span className="text-green-400 text-sm font-mono ml-4">discussion-terminal</span>
          </div>

          <div className="p-6 font-mono">
            <div className="flex items-center gap-2 text-green-400">
              <Terminal className="w-4 h-4" />
              <span className="text-sm">root@giscus:~$</span>
            </div>
            <div className="mt-2 text-green-300">
              {terminalText}
              {showCursor && <span className="text-green-400">|</span>}
            </div>
          </div>
        </div>

        {/* 主评论区域 */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg overflow-hidden hover:border-cyan-500/30 transition-all duration-300">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 px-6 py-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">开始讨论</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">在线</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div ref={giscusRef} className="giscus-container" />
          </div>
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p className="mt-2">
            由{" "}
            <a
              href="https://giscus.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              giscus
            </a>{" "}
            驱动
          </p>
        </div>
      </div>
    </div>
  )
}
