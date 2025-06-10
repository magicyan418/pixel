"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import ImagePreview from "./components/ImagePreview"
import ConveyorBelt from "./components/ConveyorBelt"
import HandLoading from "@/components/HandLoading"
import gsap from "gsap"

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
  const mouseDownPosRef = useRef({ x: 0, y: 0 }) // 鼠标按下位置
  const clickedImageRef = useRef<ImageItem | null>(null) // 点击的图片引用
  const velocityRef = useRef({ x: 0, y: 0 }) // 滑动速度
  const lastMousePosRef = useRef({ x: 0, y: 0 }) // 上一帧鼠标位置
  const lastTimeRef = useRef<number>(0) // 上一帧时间戳

  // 图片相关引用
  const imagesRef = useRef<ImageItem[]>([]) // 所有图片项数组
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map()) // 图片缓存，避免重复加载
  const lastFrameTimeRef = useRef<number>(0) // 上一帧时间戳，用于计算帧间隔
  const usedImageIndicesRef = useRef<Set<number>>(new Set()) // 已使用的图片索引集合
  const availableImageIndicesRef = useRef<number[]>([]) // 可用的图片索引数组

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
  
  // 预览相关状态
  const [previewImage, setPreviewImage] = useState<PreviewImageType | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const isPreviewingRef = useRef(false) // 是否正在预览中（动画进行中）

  // 长按相关状态
  const [isLongPressing, setIsLongPressing] = useState(false)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const longPressThreshold = 500 // 长按阈值（毫秒）
  const scaleRef = useRef(1) // 缩放比例

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

  // 定义预览图片类型
  type PreviewImageType = {
    src: string
    originalPosition: {
      x: number
      y: number
      width: number
      height: number
    }
  }

  // 获取 Pixabay 图片
  useEffect(() => {
    setIsLoading(true)
    const fetchPixabayImages = async () => {
      try {
        // 调用 Pixabay API 获取图片
        const response = await fetch(
          "https://pixabay.com/api/?key=50283552-f0300aed1a542b4b8eeccbebe&q=art&min_width=300&min_height=400&editors_choice=true&per_page=30"
        )
        const data = await response.json()
        setPixabayImages(data.hits)
        // 初始化可用图片索引数组
        availableImageIndicesRef.current = Array.from({ length: data.hits.length }, (_, i) => i)
        // 打乱数组顺序
        for (let i = availableImageIndicesRef.current.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableImageIndicesRef.current[i], availableImageIndicesRef.current[j]] = 
          [availableImageIndicesRef.current[j], availableImageIndicesRef.current[i]];
        }
        
        setTimeout(() => {
          setIsLoading(false)
        }, 5000)
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

      // 如果不在拖拽状态且有速度，应用惯性
      if (!isDraggingRef.current && (Math.abs(velocityRef.current.x) > 0.1 || Math.abs(velocityRef.current.y) > 0.1)) {
        // 应用惯性
        targetOffsetRef.current = {
          x: targetOffsetRef.current.x + velocityRef.current.x,
          y: targetOffsetRef.current.y + velocityRef.current.y,
        }

        // 应用阻尼
        velocityRef.current = {
          x: velocityRef.current.x * 0.95,
          y: velocityRef.current.y * 0.95,
        }
      }

      // 绘制图片
      drawImages()

      // 检查是否需要生成更多图片（仅在非拖拽状态且非预览状态）
      if (!isDraggingRef.current && !isPreviewingRef.current) {
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

    // 如果所有图片都已使用，重置可用图片
    if (availableImageIndicesRef.current.length === 0) {
      // 重新生成可用图片索引数组
      availableImageIndicesRef.current = Array.from({ length: pixabayImages.length }, (_, i) => i)
      // 打乱数组顺序
      for (let i = availableImageIndicesRef.current.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableImageIndicesRef.current[i], availableImageIndicesRef.current[j]] = 
        [availableImageIndicesRef.current[j], availableImageIndicesRef.current[i]];
      }
    }

    // 从可用图片中取出一个索引
    const randomIndex = availableImageIndicesRef.current.pop()!
    // 记录已使用的索引
    usedImageIndicesRef.current.add(randomIndex)
    
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
    
    // 计算当前视窗中心点在整个场景中的位置
    const centerX = -offsetRef.current.x;
    const centerY = -offsetRef.current.y;

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

        // 计算图片填充相框的参数 (类似 object-fit: cover)
        const { width: frameWidth, height: frameHeight } = img
        const imgWidth = cachedImage.width
        const imgHeight = cachedImage.height
        
        // 计算适合相框的尺寸和位置偏移，确保填满相框
        let sourceX = 0, sourceY = 0, sourceWidth = imgWidth, sourceHeight = imgHeight
        
        // 计算图片缩放比例
        const widthRatio = frameWidth / imgWidth
        const heightRatio = frameHeight / imgHeight
        
        // 根据图片与相框的比例关系，计算裁剪区域
        if (widthRatio > heightRatio) {
          // 宽度比例大，以宽度为基准，裁剪高度
          sourceHeight = frameHeight / widthRatio
          
          // 计算图片相对于中心点的位置（-1到1之间）
          const relativeY = (img.y - centerY) / (1000); // 1000是一个缩放因子，可以调整
          
          // 计算裁剪区域，基于图片的相对位置
          const totalExcessHeight = imgHeight - sourceHeight;
          
          // 将relativeY映射到0-1之间，用于决定裁剪位置
          // 使用sin函数让变化更加平滑
          const factor = (Math.sin(relativeY * Math.PI) + 1) / 2;
          
          // 应用裁剪位置
          sourceY = Math.max(0, Math.min(totalExcessHeight, totalExcessHeight * factor));
          
        } else {
          // 高度比例大，以高度为基准，裁剪宽度
          sourceWidth = frameWidth / heightRatio
          
          // 计算图片相对于中心点的位置（-1到1之间）
          const relativeX = (img.x - centerX) / (1000); // 1000是一个缩放因子，可以调整
          
          // 计算裁剪区域，基于图片的相对位置
          const totalExcessWidth = imgWidth - sourceWidth;
          
          // 将relativeX映射到0-1之间，用于决定裁剪位置
          // 使用sin函数让变化更加平滑
          const factor = (Math.sin(relativeX * Math.PI) + 1) / 2;
          
          // 应用裁剪位置
          sourceX = Math.max(0, Math.min(totalExcessWidth, totalExcessWidth * factor));
        }

        // 绘制图片
        ctx.save() // 保存当前状态
        
        // 添加阴影效果
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)" // 阴影颜色
        ctx.shadowBlur = 10 // 阴影模糊程度
        ctx.shadowOffsetX = 0 // 阴影X偏移
        ctx.shadowOffsetY = 5 // 阴影Y偏移
        
        // 绘制图片，填满相框 (使用9参数版本的drawImage实现裁剪效果)
        ctx.drawImage(
          cachedImage,
          sourceX, sourceY, sourceWidth, sourceHeight, // 源图片的裁剪区域
          drawX, drawY, frameWidth, frameHeight // 目标区域
        )
        
        // 添加外边框
        ctx.lineWidth = 4 // 边框宽度
        ctx.strokeStyle = "white" // 边框颜色
        ctx.strokeRect(drawX, drawY, frameWidth, frameHeight)
        
        // 添加内边框（双边框效果）
        ctx.lineWidth = 2 // 内边框宽度
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)" // 内边框颜色
        ctx.strokeRect(drawX + 3, drawY + 3, frameWidth - 6, frameHeight - 6)
        
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

  // 检测点击位置是否在图片上，返回点击的图片
  const getClickedImage = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const viewportWidth = canvas.width
    const viewportHeight = canvas.height

    // 遍历所有图片，从后向前检查（后绘制的在上层）
    for (let i = imagesRef.current.length - 1; i >= 0; i--) {
      const img = imagesRef.current[i]
      const drawX = viewportWidth / 2 + img.x + offsetRef.current.x
      const drawY = viewportHeight / 2 + img.y + offsetRef.current.y

      // 检查点击位置是否在图片范围内
      if (
        clientX >= drawX &&
        clientX <= drawX + img.width &&
        clientY >= drawY &&
        clientY <= drawY + img.height
      ) {
        return img
      }
    }

    return null
  }

  // 处理图片点击预览
  const handleImageClick = (clientX: number, clientY: number) => {
    if (isPreviewingRef.current || showPreview) return

    // 获取点击的图片
    const clickedImage = getClickedImage(clientX, clientY)
    if (!clickedImage) return

    const canvas = canvasRef.current
    if (!canvas) return

    const viewportWidth = canvas.width
    const viewportHeight = canvas.height
    
    // 计算图片在画布上的当前位置
    const drawX = viewportWidth / 2 + clickedImage.x + offsetRef.current.x
    const drawY = viewportHeight / 2 + clickedImage.y + offsetRef.current.y

    // 设置预览图片信息
    setPreviewImage({
      src: clickedImage.src,
      originalPosition: {
        x: drawX,
        y: drawY,
        width: clickedImage.width,
        height: clickedImage.height,
      },
    })

    // 设置预览状态
    isPreviewingRef.current = true
    setShowPreview(true)
  }

  // 关闭预览
  const handleClosePreview = () => {
    setShowPreview(false)
    setPreviewImage(null)
    isPreviewingRef.current = false
  }

  // 处理长按开始
  const handleLongPressStart = () => {
    if (isPreviewingRef.current || showPreview) return

    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true)
      // 使用 GSAP 实现缩放动画
      gsap.to(scaleRef, {
        current: 0.94,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => {
          // 更新画布缩放
          const canvas = canvasRef.current
          if (canvas) {
            canvas.style.transform = `scale(${scaleRef.current})`
          }
        }
      })
    }, longPressThreshold)
  }

  // 处理长按结束
  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
    
    if (isLongPressing) {
      setIsLongPressing(false)
      // 恢复原始缩放
      gsap.to(scaleRef, {
        current: 1,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => {
          // 更新画布缩放
          const canvas = canvasRef.current
          if (canvas) {
            canvas.style.transform = `scale(${scaleRef.current})`
          }
        }
      })
    }
  }

  // 修改鼠标按下事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPreviewingRef.current || showPreview) return

    // 记录鼠标按下位置
    mouseDownPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    }
    lastMousePosRef.current = {
      x: e.clientX,
      y: e.clientY,
    }
    lastTimeRef.current = Date.now()

    // 检查是否点击了图片
    const clickedImage = getClickedImage(e.clientX, e.clientY)
    if (clickedImage) {
      // 记录点击的图片
      clickedImageRef.current = clickedImage
    }

    // 设置拖拽状态
    isDraggingRef.current = true
    startPosRef.current = {
      x: e.clientX - targetOffsetRef.current.x,
      y: e.clientY - targetOffsetRef.current.y,
    }

    // 开始长按检测
    handleLongPressStart()
  }

  // 鼠标移动事件处理
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || isPreviewingRef.current || showPreview) return // 如果不在拖拽状态，则返回

    // 计算速度
    const now = Date.now()
    const deltaTime = now - lastTimeRef.current
    if (deltaTime > 0) {
      velocityRef.current = {
        x: (e.clientX - lastMousePosRef.current.x) / deltaTime * 16,
        y: (e.clientY - lastMousePosRef.current.y) / deltaTime * 16,
      }
    }

    // 更新上一帧位置和时间
    lastMousePosRef.current = {
      x: e.clientX,
      y: e.clientY,
    }
    lastTimeRef.current = now

    // 更新目标偏移量
    targetOffsetRef.current = {
      x: e.clientX - startPosRef.current.x,
      y: e.clientY - startPosRef.current.y,
    }
  }

  // 修改鼠标释放事件处理
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPreviewingRef.current || showPreview) return
    
    // 结束长按检测
    handleLongPressEnd()
    
    // 如果正在拖拽，则结束拖拽状态
    if (isDraggingRef.current) {
      isDraggingRef.current = false

      // 检查是否有点击的图片
      if (clickedImageRef.current) {
        // 计算鼠标移动距离
        const dx = e.clientX - mouseDownPosRef.current.x
        const dy = e.clientY - mouseDownPosRef.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // 如果移动距离小于阈值，则视为点击
        if (distance < 5) {
          handleImageClick(e.clientX, e.clientY)
        }

        // 清除点击的图片引用
        clickedImageRef.current = null
      }
    }
  }

  // 修改鼠标离开事件处理
  const handleMouseLeave = () => {
    if (isPreviewingRef.current || showPreview) return
    
    // 结束长按检测
    handleLongPressEnd()
    
    isDraggingRef.current = false // 结束拖拽状态
    clickedImageRef.current = null // 清除点击的图片引用
  }

  // 修改触摸事件处理
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isPreviewingRef.current || showPreview) return

    if (e.touches.length === 1) { // 单指触摸
      // 记录触摸起始位置
      mouseDownPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      lastMousePosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      lastTimeRef.current = Date.now()

      // 检查是否点击了图片
      const clickedImage = getClickedImage(e.touches[0].clientX, e.touches[0].clientY)
      if (clickedImage) {
        // 记录点击的图片
        clickedImageRef.current = clickedImage
      }

      // 设置拖拽状态
      isDraggingRef.current = true
      startPosRef.current = {
        x: e.touches[0].clientX - targetOffsetRef.current.x,
        y: e.touches[0].clientY - targetOffsetRef.current.y,
      }

      // 开始长按检测
      handleLongPressStart()
    }
  }

  // 触摸移动事件处理
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || isPreviewingRef.current || showPreview || e.touches.length !== 1) return

    // 计算速度
    const now = Date.now()
    const deltaTime = now - lastTimeRef.current
    if (deltaTime > 0) {
      velocityRef.current = {
        x: (e.touches[0].clientX - lastMousePosRef.current.x) / deltaTime * 16,
        y: (e.touches[0].clientY - lastMousePosRef.current.y) / deltaTime * 16,
      }
    }

    // 更新上一帧位置和时间
    lastMousePosRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    lastTimeRef.current = now

    // 更新目标偏移量
    targetOffsetRef.current = {
      x: e.touches[0].clientX - startPosRef.current.x,
      y: e.touches[0].clientY - startPosRef.current.y,
    }

    e.preventDefault() // 防止页面滚动
  }

  // 修改触摸结束事件处理
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isPreviewingRef.current || showPreview) return
    
    // 结束长按检测
    handleLongPressEnd()
    
    // 如果正在拖拽，则结束拖拽状态
    if (isDraggingRef.current) {
      isDraggingRef.current = false

      // 检查是否有点击的图片
      if (clickedImageRef.current && e.changedTouches.length > 0) {
        // 计算触摸移动距离
        const dx = e.changedTouches[0].clientX - mouseDownPosRef.current.x
        const dy = e.changedTouches[0].clientY - mouseDownPosRef.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // 如果移动距离小于阈值，则视为点击
        if (distance < 5) {
          handleImageClick(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
        }

        // 清除点击的图片引用
        clickedImageRef.current = null
      }
    }

    // 检查是否需要生成更多图片
    checkAndGenerateMoreImages()
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {isLoading ? (
        // 加载状态显示
        <div className="flex h-full w-full items-center justify-center text-white">
          <HandLoading />
        </div>
      ) : (
        <>
          {/* 画布 */}
          <canvas
            ref={canvasRef}
            className={`h-full w-full ${isDraggingRef.current ? "cursor-grabbing" : "cursor-grab"}`}
            style={{ transformOrigin: 'center center' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          
          {/* 图片预览组件 */}
          {showPreview && previewImage && (
            <ImagePreview
              image={previewImage}
              onClose={handleClosePreview}
            />
          )}

          {/* 传送带边框组件 */}
          <ConveyorBelt isActive={isLongPressing} />
        </>
      )}
    </main>
  )
}
