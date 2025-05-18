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
  const cornerTopLeftRef = useRef<HTMLDivElement>(null)
  const cornerTopRightRef = useRef<HTMLDivElement>(null)
  const cornerBottomRightRef = useRef<HTMLDivElement>(null)
  const cornerBottomLeftRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const duration = 0.5 // 增加动画持续时间
    const borderWidth = 60 // 边框宽度

    if (isActive) {
      // 创建流动动画
      const createFlowAnimation = (element: HTMLDivElement | null, direction: string) => {
        if (!element) return
        
        // 使用 gsap.to 而不是 fromTo，这样可以避免突变
        gsap.to(element, {
          backgroundPosition: direction === 'horizontal' ? '200% 0%' : '0% 200%', 
          repeat: -1, 
          duration: 8, // 增加动画时间，让过渡更加平滑
          ease: 'none',
          yoyo: false, // 不要使用 yoyo 效果
          repeatDelay: 0 // 无延迟重复
        });
      }

      // 显示边框动画
      gsap.to([topRef.current, bottomRef.current], {
        height: borderWidth,
        opacity: 1,
        duration,
        ease: 'power3.out',
        onComplete: () => {
          createFlowAnimation(topRef.current, 'horizontal')
          createFlowAnimation(bottomRef.current, 'horizontal')
        }
      })

      gsap.to([leftRef.current, rightRef.current], {
        width: borderWidth,
        opacity: 1,
        duration,
        ease: 'power3.out',
        onComplete: () => {
          createFlowAnimation(leftRef.current, 'vertical')
          createFlowAnimation(rightRef.current, 'vertical')
        }
      })

      // 角落元素动画
      gsap.to([cornerTopLeftRef.current, cornerTopRightRef.current, cornerBottomRightRef.current, cornerBottomLeftRef.current], {
        scale: 1,
        opacity: 1,
        duration: duration * 1.2,
        stagger: 0.1,
        ease: 'elastic.out(1, 0.5)'
      })

      // 粒子和数字雨效果
      if (particlesRef.current) {
        const container = particlesRef.current;
        const containerHeight = window.innerHeight;
        
        // 清除之前的元素
        container.innerHTML = '';
        
        // 创建粒子函数
        const createParticle = () => {
          const particle = document.createElement('div');
          particle.className = 'particle-element absolute w-2 h-2 rounded-full bg-white opacity-70';
          
          // 随机位置
          const side = Math.floor(Math.random() * 4);
          let x, y;
          
          if (side === 0) { // 上边
            x = Math.random() * 100;
            y = 0;
          } else if (side === 1) { // 右边
            x = 100;
            y = Math.random() * 100;
          } else if (side === 2) { // 下边
            x = Math.random() * 100;
            y = 100;
          } else { // 左边
            x = 0;
            y = Math.random() * 100;
          }
          
          particle.style.left = `${x}%`;
          particle.style.top = `${y}%`;
          container.appendChild(particle);
          
          // 粒子动画
          gsap.to(particle, {
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            opacity: 0,
            scale: Math.random() * 3 + 1,
            duration: Math.random() * 3 + 2,
            ease: 'power2.out',
            onComplete: () => {
              if (container.contains(particle)) {
                container.removeChild(particle);
              }
            }
          });
        };
        
        // 创建数字雨函数
        const createMatrixRain = () => {
          // 创建一个数字
          const digit = document.createElement('div');
          digit.className = 'matrix-digit absolute text-white opacity-0';
          digit.style.left = `${Math.random() * 100}%`;
          digit.style.top = '-20px';
          digit.style.fontSize = `${Math.random() * 10 + 10}px`;
          digit.textContent = Math.random() > 0.5 ? 
            String.fromCharCode(Math.floor(Math.random() * 10) + 48) : // 数字
            String.fromCharCode(Math.floor(Math.random() * 26) + 97);  // 字母
          
          container.appendChild(digit);
          
          // 数字下落动画
          gsap.to(digit, {
            y: containerHeight + 20,
            opacity: 0.7,
            duration: Math.random() * 3 + 2,
            ease: 'none',
            onComplete: () => {
              if (container.contains(digit)) {
                container.removeChild(digit);
              }
            }
          });
          
          // 数字闪烁动画
          gsap.to(digit, {
            opacity: 0.3,
            duration: 0.3,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
          });
        };
        
        // 初始创建一批粒子
        for (let i = 0; i < 20; i++) {
          createParticle();
        }
        
        // 初始创建一批数字雨
        for (let i = 0; i < 30; i++) {
          setTimeout(() => {
            createMatrixRain();
          }, Math.random() * 2000);
        }
        
        // 创建定时器管理对象
        const timers = {
          particle: null as NodeJS.Timeout | null,
          rain: null as NodeJS.Timeout | null
        };
        
        // 持续创建新的粒子
        timers.particle = setInterval(() => {
          if (!isActive) {
            if (timers.particle) clearInterval(timers.particle);
            return;
          }
          createParticle();
        }, 300);
        
        // 持续创建新的数字雨
        timers.rain = setInterval(() => {
          if (!isActive) {
            if (timers.rain) clearInterval(timers.rain);
            return;
          }
          createMatrixRain();
        }, 200);
        
        // 清理函数
        return () => {
          if (timers.particle) clearInterval(timers.particle);
          if (timers.rain) clearInterval(timers.rain);
        };
      }
    } else {
      // 隐藏动画
      const elements: (HTMLElement | null)[] = [topRef.current, bottomRef.current, leftRef.current, rightRef.current];
      gsap.killTweensOf(elements);
      
      gsap.to([topRef.current, bottomRef.current], {
        height: 0,
        opacity: 0,
        duration,
        ease: 'power3.in'
      })

      gsap.to([leftRef.current, rightRef.current], {
        width: 0,
        opacity: 0,
        duration,
        ease: 'power3.in'
      })

      // 角落元素隐藏动画
      gsap.to([cornerTopLeftRef.current, cornerTopRightRef.current, cornerBottomRightRef.current, cornerBottomLeftRef.current], {
        scale: 0,
        opacity: 0,
        duration: duration * 0.8,
        stagger: 0.05,
        ease: 'back.in(1.5)'
      })

      // 清除粒子
      if (particlesRef.current) {
        particlesRef.current.innerHTML = '';
      }
    }
  }, [isActive])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 上边框 */}
      <div
        ref={topRef}
        className="absolute top-0 left-0 right-0"
        style={{ 
          height: 0, 
          opacity: 0,
          background: 'linear-gradient(90deg, #000000 0%, #2a2a2a 15%, #4a4a4a 50%, #2a2a2a 85%, #000000 100%)',
          backgroundSize: '200% 100%',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.5)'
        }}
      />
      
      {/* 右边框 */}
      <div
        ref={rightRef}
        className="absolute top-0 right-0 bottom-0"
        style={{ 
          width: 0, 
          opacity: 0,
          background: 'linear-gradient(180deg, #000000 0%, #2a2a2a 15%, #4a4a4a 50%, #2a2a2a 85%, #000000 100%)',
          backgroundSize: '100% 200%',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
          borderRight: '1px solid rgba(255, 255, 255, 0.5)'
        }}
      />
      
      {/* 下边框 */}
      <div
        ref={bottomRef}
        className="absolute bottom-0 left-0 right-0"
        style={{ 
          height: 0, 
          opacity: 0,
          background: 'linear-gradient(90deg, #000000 0%, #2a2a2a 15%, #4a4a4a 50%, #2a2a2a 85%, #000000 100%)',
          backgroundSize: '200% 100%',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.5)'
        }}
      />
      
      {/* 左边框 */}
      <div
        ref={leftRef}
        className="absolute top-0 left-0 bottom-0"
        style={{ 
          width: 0, 
          opacity: 0,
          background: 'linear-gradient(180deg, #000000 0%, #2a2a2a 15%, #4a4a4a 50%, #2a2a2a 85%, #000000 100%)',
          backgroundSize: '100% 200%',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.5)'
        }}
      />

      {/* 角落元素 - 改为与黑色背景协调的风格 */}
      <div 
        ref={cornerTopLeftRef}
        className="absolute top-0 left-0 w-20 h-20 opacity-0 origin-top-left"
        style={{ 
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
          transform: 'scale(0)',
          filter: 'blur(2px)'
        }}
      />
      <div 
        ref={cornerTopRightRef}
        className="absolute top-0 right-0 w-20 h-20 opacity-0 origin-top-right"
        style={{ 
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
          transform: 'scale(0)',
          filter: 'blur(2px)'
        }}
      />
      <div 
        ref={cornerBottomRightRef}
        className="absolute bottom-0 right-0 w-20 h-20 opacity-0 origin-bottom-right"
        style={{ 
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
          transform: 'scale(0)',
          filter: 'blur(2px)'
        }}
      />
      <div 
        ref={cornerBottomLeftRef}
        className="absolute bottom-0 left-0 w-20 h-20 opacity-0 origin-bottom-left"
        style={{ 
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
          transform: 'scale(0)',
          filter: 'blur(2px)'
        }}
      />

      {/* 粒子容器 - 也用于数字雨 */}
      <div ref={particlesRef} className="absolute inset-0" />
      
      {/* 扫描线效果 */}
      {isActive && (
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-x-0 h-px opacity-80" 
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
              filter: 'blur(1px)',
              animation: 'scanVertical 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)'
            }} 
          />
          <div 
            className="absolute inset-y-0 w-px opacity-80"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
              filter: 'blur(1px)',
              animation: 'scanHorizontal 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)'
            }}
          />
        </div>
      )}

      {/* 添加数字雨效果 - 增强可见度 */}
      {isActive && (
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="matrix-rain" />
        </div>
      )}

      {/* 内联样式定义动画 */}
      <style jsx>{`
        @keyframes scanVertical {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes scanHorizontal {
          0% { left: 0%; }
          100% { left: 100%; }
        }
        
        /* 添加一些额外的酷炫效果 */
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.5; }
        }
        
        @keyframes glitch {
          0% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(-10px, 3px);
          }
          20% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(10px, -3px);
          }
          40% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-10px, -3px);
          }
          60% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(10px, 3px);
          }
          80% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(-10px, 3px);
          }
          100% {
            clip-path: inset(58% 0 43% 0);
            transform: translate(10px, -3px);
          }
        }
        
        /* 数字雨元素样式 */
        .matrix-digit {
          font-family: monospace;
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
          position: absolute;
        }
      `}</style>
    </div>
  )
}