import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface ConveyorBeltProps {
  isActive: boolean
}

export default function ConveyorBelt({ isActive }: ConveyorBeltProps) {
  const topRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const duration = 0.3 // 动画持续时间
    const borderWidth = 60 // 边框宽度

    if (isActive) {
      // 显示动画
      gsap.to([topRef.current, bottomRef.current], {
        height: borderWidth,
        opacity: 0.8,
        duration,
        ease: 'power2.out'
      })

      gsap.to([leftRef.current, rightRef.current], {
        width: borderWidth,
        opacity: 0.8,
        duration,
        ease: 'power2.out'
      })
    } else {
      // 隐藏动画
      gsap.to([topRef.current, bottomRef.current], {
        height: 0,
        opacity: 0,
        duration,
        ease: 'power2.in'
      })

      gsap.to([leftRef.current, rightRef.current], {
        width: 0,
        opacity: 0,
        duration,
        ease: 'power2.in'
      })
    }
  }, [isActive])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* 上边框 */}
      <div
        ref={topRef}
        className="absolute top-0 left-0 right-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        style={{ height: 0, opacity: 0 }}
      />
      
      {/* 右边框 */}
      <div
        ref={rightRef}
        className="absolute top-0 right-0 bottom-0 bg-gradient-to-b from-transparent via-blue-500 to-transparent"
        style={{ width: 0, opacity: 0 }}
      />
      
      {/* 下边框 */}
      <div
        ref={bottomRef}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        style={{ height: 0, opacity: 0 }}
      />
      
      {/* 左边框 */}
      <div
        ref={leftRef}
        className="absolute top-0 left-0 bottom-0 bg-gradient-to-b from-transparent via-blue-500 to-transparent"
        style={{ width: 0, opacity: 0 }}
      />
    </div>
  )
} 