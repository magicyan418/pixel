"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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

// 组件属性类型
type ImagePreviewProps = {
  image: PreviewImageType
  onClose: () => void
}

const ImagePreview = ({ image, onClose }: ImagePreviewProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  // 计算图片适应屏幕的尺寸
  useEffect(() => {
    const img = new Image()
    img.src = image.src
    img.onload = () => {
      // 获取原始图片尺寸
      const imgRatio = img.width / img.height
      
      // 获取屏幕尺寸（为了最大化预览区域）
      const maxWidth = window.innerWidth * 0.9
      const maxHeight = window.innerHeight * 0.9
      
      // 计算最大可能尺寸
      let finalWidth, finalHeight
      
      if (imgRatio > maxWidth / maxHeight) {
        // 图片更宽，以宽度为限制
        finalWidth = maxWidth
        finalHeight = finalWidth / imgRatio
      } else {
        // 图片更高，以高度为限制
        finalHeight = maxHeight
        finalWidth = finalHeight * imgRatio
      }
      
      // 设置最终尺寸
      setDimensions({
        width: finalWidth,
        height: finalHeight
      })
      setIsLoaded(true)
    }
  }, [image.src])

  // 关闭预览的处理函数
  const handleClose = () => {
    setIsLoaded(false)
    onClose()
  }

  // 点击背景关闭
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={handleBackgroundClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isLoaded && (
          <motion.div
            className="relative"
            initial={{ 
              x: image.originalPosition.x - window.innerWidth / 2 + image.originalPosition.width / 2,
              y: image.originalPosition.y - window.innerHeight / 2 + image.originalPosition.height / 2,
              width: image.originalPosition.width,
              height: image.originalPosition.height,
              opacity: 0.9
            }}
            animate={{ 
              x: 0,
              y: 0,
              width: dimensions.width,
              height: dimensions.height,
              opacity: 1
            }}
            exit={{ 
              x: image.originalPosition.x - window.innerWidth / 2 + image.originalPosition.width / 2,
              y: image.originalPosition.y - window.innerHeight / 2 + image.originalPosition.height / 2,
              width: image.originalPosition.width,
              height: image.originalPosition.height,
              opacity: 0.9
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            {/* 关闭按钮 */}
            <motion.button
              className="absolute -top-10 right-0 rounded-full bg-white p-2 text-black"
              onClick={handleClose}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.2 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </motion.button>
            
            {/* 图片 */}
            <img
              src={image.src}
              alt="预览图片"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                objectFit: "contain",
              }}
              className="rounded-md shadow-2xl"
            />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default ImagePreview 