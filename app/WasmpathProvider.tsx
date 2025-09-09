'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    __DOTLOTTIE_PLAYER_WASM_PATH__?: string;
  }
}

export default function WasmpathProvider() {
  useEffect(() => {
    // 设置 wasm 路径，只在浏览器执行
    window.__DOTLOTTIE_PLAYER_WASM_PATH__ = '/dotlottie-player.wasm'
  }, [])

  return null
}
