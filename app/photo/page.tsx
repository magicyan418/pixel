"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  // Canvas 相关引用
  const canvasRef = useRef<HTMLCanvasElement>(null) // 画布元素引用
  const contextRef = useRef<CanvasRenderingContext2D | null>(null) // 画布上下文引用
  const animationRef = useRef<number>(0) // 动画帧请求ID引用

  // 位置和拖拽相关状态
  const offsetRef = useRef({ x: 0, y: 0 }) // 当前偏移量
  const targetOffsetRef = useRef({ x: 0, y: 0 }) // 目标偏移量（用于平滑过渡）
  const isDraggingRef = useRef(false) // 是否正在拖拽
  const startPosRef = useRef({ x: 0, y: 0 }) // 拖拽起始位置

  // 图片相关引用
  const imagesRef = useRef<ImageItem[]>([]) // 所有图片项数组
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map()) // 图片缓存，避免重复加载
  const lastFrameTimeRef = useRef<number>(0) // 上一帧时间戳，用于计算帧间隔

  // 网格配置
  const gridInfoRef = useRef({
    imgWidth: 300,  // 图片宽度
    imgHeight: 400, // 图片高度
    gap: 60,        // 图片间距
    get cellWidth() { return this.imgWidth + this.gap }, // 动态计算单元格宽度
    get cellHeight() { return this.imgHeight + this.gap }, // 动态计算单元格高度
  })

  // 组件状态
  const [isInitialized, setIsInitialized] = useState(false) // 是否已初始化
  const [pixabayImages, setPixabayImages] = useState<PixabayImage[]>([]) // Pixabay API 返回的图片数组
  const [isLoading, setIsLoading] = useState(true) // 是否正在加载

  // 定义 Pixabay 图片类型
  type PixabayImage = {
    id: number // 图片ID
    webformatURL: string // 网页格式URL（中等尺寸）
    largeImageURL: string // 大尺寸URL
  }

  // 定义图片项类型
  type ImageItem = {
    id: number // 唯一标识符
    gridX: number // 网格坐标X
    gridY: number // 网格坐标Y
    x: number // 像素坐标X
    y: number // 像素坐标Y
    width: number // 图片宽度
    height: number // 图片高度
    src: string // 图片源URL
    loaded: boolean // 是否已加载完成
  }

  // 获取 Pixabay 图片
  useEffect(() => {
    const fetchPixabayImages = async () => {
      try {
        setIsLoading(true)
        // 调用 Pixabay API 获取图片
        const response = await fetch(
          "https://pixabay.com/api/?key=50283552-f0300aed1a542b4b8eeccbebe&q=city&min_width=300&min_height=400&editors_choice=true&per_page=25"
        )
        const data = await response.json()
        setPixabayImages(data.hits)
        setIsLoading(false)
      } catch (error) {
        console.error("获取 Pixabay 图片失败:", error)
        setIsLoading(false)
      }
    }

    fetchPixabayImages()
  }, []) // 组件挂载时执行一次

  // 初始化画布
  useEffect(() => {
    // 如果还在加载或没有图片，则返回
    if (isLoading || pixabayImages.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    // 设置画布大小为窗口大小
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // 获取绘图上下文
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    contextRef.current = ctx

    // 生成初始图片
    generateInitialImages()

    // 处理窗口大小变化
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        drawImages() // 重新绘制图片
      }
    }

    window.addEventListener("resize", handleResize)

    // 标记初始化完成
    setIsInitialized(true)

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isLoading, pixabayImages]) // 依赖 pixabayImages 和 isLoading

  // 启动动画循环
  useEffect(() => {
    if (!isInitialized) return

    let isAnimating = true // 动画状态标志

    const animate = (timestamp: number) => {
      if (!isAnimating) return // 如果不再动画，则返回

      // 计算帧间隔时间
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp
      }
      const deltaTime = timestamp - lastFrameTimeRef.current
      lastFrameTimeRef.current = timestamp

      // 平滑过渡到目标偏移量
      const easing = 0.1 // 缓动系数
      const dx = targetOffsetRef.current.x - offsetRef.current.x
      const dy = targetOffsetRef.current.y - offsetRef.current.y

      // 如果偏移量差异足够大，则进行平滑过渡
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        offsetRef.current = {
          x: offsetRef.current.x + dx * Math.min(easing * (deltaTime / 16), 1),
          y: offsetRef.current.y + dy * Math.min(easing * (deltaTime / 16), 1),
        }
      }

      // 绘制图片
      drawImages()

      // 检查是否需要生成更多图片（仅在非拖拽状态）
      if (!isDraggingRef.current) {
        checkAndGenerateMoreImages()
      }

      // 继续动画循环
      animationRef.current = requestAnimationFrame(animate)
    }

    // 开始动画循环
    animationRef.current = requestAnimationFrame(animate)

    // 清理函数
    return () => {
      isAnimating = false // 设置标志为 false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isInitialized]) // 仅依赖 isInitialized

  // 将网格坐标转换为像素坐标
  const gridToPixel = (gridX: number, gridY: number) => {
    const { imgWidth, imgHeight, gap } = gridInfoRef.current
  
    // 根据列的奇偶性计算Y轴偏移（蜂窝状排列效果）
    const yOffset = gridX % 2 === 0 ? 0 : imgHeight / 2
  
    // 直接使用 gap 计算位置
    return {
      x: gridX * (imgWidth + gap),
      y: gridY * (imgHeight + gap) + yOffset,
    }
  }

  // 获取随机图片URL
  const getRandomImageUrl = () => {
    if (pixabayImages.length === 0) {
      return "../favicon.ico" // 备用图片
    }
    // 随机选择一张图片
    const randomIndex = Math.floor(Math.random() * pixabayImages.length)
    return pixabayImages[randomIndex].webformatURL
  }

  // 生成初始图片
  const generateInitialImages = () => {
    if (pixabayImages.length === 0) return

    const rows = 5 // 行数
    const cols = 5 // 列数
    const { imgWidth, imgHeight } = gridInfoRef.current

    const centerGridX = 0 // 中心点X坐标
    const centerGridY = 0 // 中心点Y坐标
    const newImages: ImageItem[] = []

    // 生成围绕中心点的网格
    for (let gridY = centerGridY - Math.floor(rows / 2); gridY <= centerGridY + Math.floor(rows / 2); gridY++) {
      for (let gridX = centerGridX - Math.floor(cols / 2); gridX <= centerGridX + Math.floor(cols / 2); gridX++) {
        const id = newImages.length

        // 计算像素坐标
        const { x, y } = gridToPixel(gridX, gridY)

        // 添加新图片
        newImages.push({
          id,
          gridX,
          gridY,
          x,
          y,
          width: imgWidth,
          height: imgHeight,
          src: getRandomImageUrl(),
          loaded: false,
        })
      }
    }

    // 更新图片数组并预加载
    imagesRef.current = newImages
    preloadImages(newImages)
  }

  // 预加载图片（批量加载，避免一次性加载过多）
  const preloadImages = (imagesToLoad: ImageItem[]) => {
    // 每批加载的图片数量
    const batchSize = 5
    let currentIndex = 0

    const loadBatch = () => {
      // 获取当前批次的图片
      const batch = imagesToLoad.slice(currentIndex, currentIndex + batchSize)
      if (batch.length === 0) return

      batch.forEach((img) => {
        // 检查图片是否已缓存
        if (imageCacheRef.current.has(img.src)) {
          // 已缓存，标记为已加载
          const imgIndex = imagesRef.current.findIndex((i) => i.id === img.id)
          if (imgIndex >= 0) {
            imagesRef.current[imgIndex].loaded = true
          }
          return
        }

        // 创建新图片对象并加载
        const image = new Image()
        image.crossOrigin = "anonymous" // 允许跨域
        image.onload = () => {
          // 加载成功，添加到缓存
          imageCacheRef.current.set(img.src, image)
          // 标记图片已加载
          const imgIndex = imagesRef.current.findIndex((i) => i.id === img.id)
          if (imgIndex >= 0) {
            imagesRef.current[imgIndex].loaded = true
          }
        }
        image.onerror = () => {
          // 加载失败时使用备用图片
          const backupImage = new Image()
          backupImage.src = "../favicon.ico"
          imageCacheRef.current.set(img.src, backupImage)
        }
        image.src = img.src
      })

      // 更新索引并加载下一批
      currentIndex += batchSize
      if (currentIndex < imagesToLoad.length) {
        // 延迟加载下一批，避免一次性请求过多
        setTimeout(loadBatch, 100)
      }
    }

    // 开始批量加载
    loadBatch()
  }

  // 绘制图片到画布
  const drawImages = () => {
    const canvas = canvasRef.current
    const ctx = contextRef.current
    if (!canvas || !ctx) return

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 计算可视区域（略微扩大以提前渲染）
    const bufferFactor = 1.5 // 缓冲因子，扩大可视区域
    const viewportWidth = canvas.width
    const viewportHeight = canvas.height

    // 计算可视区域边界
    const viewportLeft = -offsetRef.current.x - (viewportWidth * bufferFactor) / 2
    const viewportRight = -offsetRef.current.x + (viewportWidth * bufferFactor) / 2
    const viewportTop = -offsetRef.current.y - (viewportHeight * bufferFactor) / 2
    const viewportBottom = -offsetRef.current.y + (viewportHeight * bufferFactor) / 2

    // 绘制可视区域内的图片
    imagesRef.current.forEach((img) => {
      // 检查图片是否在可视区域内，不在则跳过绘制（优化性能）
      if (
        img.x + img.width < viewportLeft ||
        img.x > viewportRight ||
        img.y + img.height < viewportTop ||
        img.y > viewportBottom
      ) {
        return // 图片不在可视区域，跳过绘制
      }

      // 获取缓存的图片
      const cachedImage = imageCacheRef.current.get(img.src)
      if (cachedImage && cachedImage.complete) {
        // 计算图片在画布上的位置
        const drawX = viewportWidth / 2 + img.x + offsetRef.current.x
        const drawY = viewportHeight / 2 + img.y + offsetRef.current.y

        // 绘制图片
        ctx.save() // 保存当前状态
        
        // 添加阴影效果
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)" // 阴影颜色
        ctx.shadowBlur = 10 // 阴影模糊程度
        ctx.shadowOffsetX = 0 // 阴影X偏移
        ctx.shadowOffsetY = 5 // 阴影Y偏移
        
        // 绘制图片
        ctx.drawImage(cachedImage, drawX, drawY, img.width, img.height)
        
        // 添加外边框
        ctx.lineWidth = 4 // 边框宽度
        ctx.strokeStyle = "white" // 边框颜色
        ctx.strokeRect(drawX, drawY, img.width, img.height)
        
        // 添加内边框（双边框效果）
        ctx.lineWidth = 2 // 内边框宽度
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)" // 内边框颜色
        ctx.strokeRect(drawX + 3, drawY + 3, img.width - 6, img.height - 6)
        
        ctx.restore() // 恢复之前的状态
      }
    })
  }

  // 检查图片是否已存在于指定网格位置
  const isImageExistAtGrid = (gridX: number, gridY: number) => {
    return imagesRef.current.some((img) => img.gridX === gridX && img.gridY === gridY)
  }

  // 检查是否需要生成更多图片
  const checkAndGenerateMoreImages = () => {
    if (pixabayImages.length === 0) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    // 计算当前可视区域的边界
    const bufferFactor = 1.2 // 缓冲因子
    const viewportWidth = canvas.width
    const viewportHeight = canvas.height
    const { cellWidth, cellHeight, imgWidth, imgHeight } = gridInfoRef.current

    // 计算可视区域边界
    const viewportLeft = -offsetRef.current.x - (viewportWidth * bufferFactor) / 2
    const viewportRight = -offsetRef.current.x + (viewportWidth * bufferFactor) / 2
    const viewportTop = -offsetRef.current.y - (viewportHeight * bufferFactor) / 2
    const viewportBottom = -offsetRef.current.y + (viewportHeight * bufferFactor) / 2

    // 计算网格边界
    const leftGridX = Math.floor(viewportLeft / cellWidth) - 1
    const rightGridX = Math.ceil(viewportRight / cellWidth) + 1
    const topGridY = Math.floor(viewportTop / cellHeight) - 1
    const bottomGridY = Math.ceil(viewportBottom / cellHeight) + 1

    // 在可视区域边界内填充缺失的图片
    const newImages: ImageItem[] = []

    // 遍历网格区域
    for (let gridY = topGridY; gridY <= bottomGridY; gridY++) {
      for (let gridX = leftGridX; gridX <= rightGridX; gridX++) {
        // 检查这个网格位置是否已有图片
        if (!isImageExistAtGrid(gridX, gridY)) {
          const id = imagesRef.current.length + newImages.length

          // 计算像素坐标
          const { x, y } = gridToPixel(gridX, gridY)

          // 添加新图片
          newImages.push({
            id,
            gridX,
            gridY,
            x,
            y,
            width: imgWidth,
            height: imgHeight,
            src: getRandomImageUrl(),
            loaded: false,
          })
        }
      }
    }

    // 如果有新图片，更新数组并预加载
    if (newImages.length > 0) {
      // 更新图片数组
      imagesRef.current = [...imagesRef.current, ...newImages]
      // 预加载新图片
      preloadImages(newImages)
    }
  }

  // 鼠标按下事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true // 设置拖拽状态
    startPosRef.current = {
      x: e.clientX - targetOffsetRef.current.x,
      y: e.clientY - targetOffsetRef.current.y,
    }
  }

  // 鼠标移动事件处理
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return // 如果不在拖拽状态，则返回

    // 更新目标偏移量
    targetOffsetRef.current = {
      x: e.clientX - startPosRef.current.x,
      y: e.clientY - startPosRef.current.y,
    }
  }

  // 鼠标释放事件处理
  const handleMouseUp = () => {
    isDraggingRef.current = false // 结束拖拽状态
  }

  // 鼠标离开事件处理
  const handleMouseLeave = () => {
    isDraggingRef.current = false // 结束拖拽状态
  }

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) { // 单指触摸
      isDraggingRef.current = true
      startPosRef.current = {
        x: e.touches[0].clientX - targetOffsetRef.current.x,
        y: e.touches[0].clientY - targetOffsetRef.current.y,
      }
    }
  }

  // 触摸移动事件处理
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return

    // 更新目标偏移量
    targetOffsetRef.current = {
      x: e.touches[0].clientX - startPosRef.current.x,
      y: e.touches[0].clientY - startPosRef.current.y,
    }

    e.preventDefault() // 防止页面滚动
  }

  // 触摸结束事件处理
  const handleTouchEnd = () => {
    isDraggingRef.current = false
    // 检查是否需要生成更多图片
    checkAndGenerateMoreImages()
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {isLoading ? (
        // 加载状态显示
        <div className="flex h-full w-full items-center justify-center text-white">
          <p className="text-xl">加载中...</p>
        </div>
      ) : (
        // 画布
        <canvas
          ref={canvasRef}
          className={`h-full w-full ${isDraggingRef.current ? "cursor-grabbing" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}
    </main>
  )
}
