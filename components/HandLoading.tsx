'use client'

import { useEffect, useRef } from 'react'
import { DotLottie } from '@lottiefiles/dotlottie-web'

const HandLoding = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // 自定义 wasm 路径
    DotLottie.setWasmUrl('/dotlottie-player.wasm')

    const player = new DotLottie({
      canvas: canvasRef.current,
      src: '/hand-loading.lottie',
      autoplay: true,
      loop: true,
    })

    return () => {
      player.destroy() // 卸载组件时清理
    }
  }, [])

  return <canvas ref={canvasRef} className='w-full h-full'/>
}

export default HandLoding
