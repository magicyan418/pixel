"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import Desktop from "@/components/Desktop";

const FloatBall = () => {
  const [dimensions, setDimensions] = useState({ width: 60, height: 60 });
  const [open, setOpen] = useState(false);
  const halfWidth = dimensions.width / 2;
  const halfHeight = dimensions.height / 2;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [constraints, setConstraints] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [ready, setReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 初始化DotLottie动画
  useEffect(() => {
    if (!canvasRef.current) return;

    DotLottie.setWasmUrl("/dotlottie-player.wasm");

    const player = new DotLottie({
      canvas: canvasRef.current,
      src: "/laughing_cat.lottie",
      autoplay: true,
      loop: true,
    });

    // 获取canvas的实际尺寸
    const updateDimensions = () => {
      if (canvasRef.current) {
        console.log(
          "canvas size",
          canvasRef.current.clientWidth,
          canvasRef.current.clientHeight
        );
        setDimensions({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        });
      }
    };

    updateDimensions();

    return () => {
      player.destroy();
    };
  }, [ready]);

  // 初始化约束和位置
  useEffect(() => {
    const updateConstraints = () => {
      const right = window.innerWidth - halfWidth;
      const bottom = window.innerHeight - halfHeight;

      setConstraints({
        top: -halfHeight,
        left: -halfWidth,
        right,
        bottom,
      });

      // 尝试从 localStorage 读取上次位置
      const saved = localStorage.getItem("floatBallPosition");
      if (saved) {
        const pos = JSON.parse(saved);
        x.set(Math.min(pos.x, right));
        y.set(Math.min(pos.y, bottom));
      } else {
        x.set(right - dimensions.width / 2);
        y.set(bottom - dimensions.height / 2);
      }

      setReady(true);
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [x, y, dimensions]);

  // 用定时器检测小球是否静止，静止后存储位置
  useEffect(() => {
    if (!ready) return;

    let lastX = x.get();
    let lastY = y.get();
    const interval = setInterval(() => {
      const currentX = x.get();
      const currentY = y.get();
      if (currentX === lastX && currentY === lastY) {
        // 静止，存储位置
        localStorage.setItem(
          "floatBallPosition",
          JSON.stringify({ x: currentX, y: currentY })
        );
      }
      lastX = currentX;
      lastY = currentY;
    }, 100); // 每100ms检测一次

    return () => clearInterval(interval);
  }, [ready, x, y]);

  console.log("constraints", constraints, ready);
  if (!ready) return null;

  return (
    <Drawer open={open} onOpenChange={(open) => setOpen(open)}>
      <motion.div
        drag
        dragMomentum={true}
        dragConstraints={constraints}
        className="fixed z-50"
        dragTransition={{
          bounceStiffness: 800, // 弹簧硬度
          bounceDamping: 50, // 阻尼
          power: 0.3, // 惯性力度
        }}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          cursor: "grab",
          x,
          y,
        }}
        whileTap={{ cursor: "grabbing", scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setIsDragging(false);
        }}
        onClick={(e) => {
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
          }else{
            setOpen(true);
          }
        }}
      >
        <canvas ref={canvasRef} />
      </motion.div>
      <DrawerContent className="pb-8 h-4/5">
        <VisuallyHidden>
          <DrawerTitle></DrawerTitle>
        </VisuallyHidden>
        <Desktop />
      </DrawerContent>
    </Drawer>
  );
};

export default FloatBall;
