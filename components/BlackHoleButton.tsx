"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"

interface BlackHoleButtonProps {
  buttonText?: string
  duration?: number
  intensity?: number
  onClick?: () => void
}

interface StarParticle {
  x: number
  y: number
  size: number
  color: string
  distance: number
  angle: number
  radialVelocity: number
  angularVelocity: number
  opacity: number
  distortion: number
}

interface AccretionDiskSegment {
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  color: string
  angularVelocity: number
  opacity: number
}

interface GravitationalLensRay {
  startX: number
  startY: number
  controlX: number
  controlY: number
  endX: number
  endY: number
  width: number
  color: string
  opacity: number
}

interface EllipseParams {
  radiusX: number
  radiusY: number
  rotation: number
  offsetX: number
  offsetY: number
}

interface AnimationState {
  phase: number
  progress: number
  totalProgress: number
}

export default function BlackHoleButton({
  buttonText = "召唤卡冈图雅",
  duration = 6000,
  intensity = 1.0,
  onClick,
}: BlackHoleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  const [isActive, setIsActive] = useState(false)

  // Black hole center position
  const center = useRef({ x: 0, y: 0 })

  // Black hole event horizon radius
  const eventHorizonRadius = useRef(0)

  // Black hole ellipse parameters
  const ellipseParams = useRef<EllipseParams>({
    radiusX: 0,
    radiusY: 0,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
  })

  // Animation state
  const animationState = useRef<AnimationState>({
    phase: 0,
    progress: 0,
    totalProgress: 0,
  })

  // Button size
  const buttonSize = useRef({
    width: 0,
    height: 0,
  })

  // Particles
  const stars = useRef<StarParticle[]>([])
  const accretionDisk = useRef<AccretionDiskSegment[]>([])
  const lensRays = useRef<GravitationalLensRay[]>([])

  // Initialize Canvas
  const initCanvas = () => {
    if (!canvasRef.current || !containerRef.current) {
      console.error("Canvas or container ref is null")
      return
    }

    const canvas = canvasRef.current
    const container = containerRef.current

    // Set Canvas size to twice the window size to cover a larger area
    canvas.width = window.innerWidth * 2
    canvas.height = window.innerHeight * 2

    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    canvas.style.position = "fixed"
    canvas.style.left = "50%"
    canvas.style.top = "50%"
    canvas.style.transform = "translate(-50%, -50%)"
    canvas.style.zIndex = "50" // Ensure it's above other elements
    canvas.style.pointerEvents = "none"

    // Get rendering context
    ctxRef.current = canvas.getContext("2d")

    if (!ctxRef.current) {
      console.error("Failed to get canvas context")
      return
    }

    // Set black hole center position to button center
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const buttonCenterX = buttonRect.left + buttonRect.width / 2
      const buttonCenterY = buttonRect.top + buttonRect.height / 2

      // Convert button center position to canvas coordinates
      center.current.x = buttonCenterX * 2 // Because canvas width is twice the window
      center.current.y = buttonCenterY * 2 // Because canvas height is twice the window

      // Record button size for later use in transforming button to black hole
      buttonSize.current.width = buttonRect.width * 2
      buttonSize.current.height = buttonRect.height * 2

      console.log("Button center:", buttonCenterX, buttonCenterY)
      console.log("Canvas center:", center.current.x, center.current.y)
      console.log("Button size:", buttonSize.current.width, buttonSize.current.height)
    } else {
      console.error("Button ref is null")
    }
  }

  // Create star particles
  const createStars = (count: number): StarParticle[] => {
    const newStars: StarParticle[] = []
    const maxDistance = Math.max(window.innerWidth, window.innerHeight) * 1.5

    for (let i = 0; i < count; i++) {
      // Randomly generate star angle and distance
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * maxDistance

      // Calculate star position
      const x = center.current.x + Math.cos(angle) * distance
      const y = center.current.y + Math.sin(angle) * distance

      // Randomly generate star size, color, and speed
      const size = Math.random() * 2 + 1
      const colors = ["#ffffff", "#ffffdd", "#ffeecc", "#ddddff", "#ccffff", "#ffccee", "#eeeeff"]
      const color = colors[Math.floor(Math.random() * colors.length)]

      // Calculate radial and angular velocity based on distance
      const distFactor = 1 - Math.min(1, distance / maxDistance)
      const radialVelocity = (0.1 + distFactor * 2) * intensity
      const angularVelocity = (0.0005 + distFactor * 0.001) * intensity

      newStars.push({
        x,
        y,
        size,
        color,
        distance,
        angle,
        radialVelocity,
        angularVelocity,
        opacity: 1,
        distortion: 0,
      })
    }

    return newStars
  }

  // Create accretion disk
  const createAccretionDisk = (): AccretionDiskSegment[] => {
    const newDisk: AccretionDiskSegment[] = []
    const rings = 7 // Number of rings in the accretion disk
    const minRadius = eventHorizonRadius.current * 1.3
    const maxRadius = eventHorizonRadius.current * 3.5

    // Cool color array - one color per ring
    const colors = [
      "#1a237e", // Deep blue
      "#3949ab", // Blue
      "#0d47a1", // Deep blue
      "#01579b", // Deep cyan blue
      "#006064", // Deep cyan
      "#004d40", // Deep teal
      "#0b5394", // Indigo
    ]

    // Create rings
    for (let i = 0; i < rings; i++) {
      // Calculate ring inner and outer radius, making rings thinner
      const ringWidth = ((maxRadius - minRadius) / rings) * 0.7 // Reduce ring width
      const gap = ((maxRadius - minRadius) / rings) * 0.3 // Gap between rings
      const innerRadius = minRadius + (ringWidth + gap) * i
      const outerRadius = innerRadius + ringWidth

      // Ensure each ring has a different color
      const color = colors[i % colors.length]

      // Angular velocity, inner rings rotate faster
      const angularVelocity = (0.02 + (rings - i) * 0.005) * intensity

      // Each ring is a complete circle
      newDisk.push({
        innerRadius,
        outerRadius,
        startAngle: 0,
        endAngle: Math.PI * 2,
        color,
        angularVelocity,
        opacity: 0.5, // Lower opacity for subtlety
      })
    }

    return newDisk
  }

  // Create gravitational lens rays
  const createLensRays = (count: number): GravitationalLensRay[] => {
    const newRays: GravitationalLensRay[] = []
    const maxDistance = Math.max(window.innerWidth, window.innerHeight) * 0.7

    for (let i = 0; i < count; i++) {
      // Ray start point
      const startAngle = Math.random() * Math.PI * 2
      const startDistance = eventHorizonRadius.current * 1.5 + Math.random() * eventHorizonRadius.current * 5
      const startX = center.current.x + Math.cos(startAngle) * startDistance
      const startY = center.current.y + Math.sin(startAngle) * startDistance

      // Ray end point
      const endDistance = Math.random() * maxDistance
      const endAngle = startAngle + (Math.random() - 0.5) * 0.5
      const endX = center.current.x + Math.cos(endAngle) * endDistance
      const endY = center.current.y + Math.sin(endAngle) * endDistance

      // Control point - for creating curved rays
      const distortFactor = Math.random() * 0.3 + 0.7
      const controlDistance = startDistance * 0.5
      const controlAngle = startAngle + (Math.random() - 0.5) * 2 * Math.PI * distortFactor
      const controlX = center.current.x + Math.cos(controlAngle) * controlDistance
      const controlY = center.current.y + Math.sin(controlAngle) * controlDistance

      // Line width
      const width = Math.random() * 1.5 + 0.5

      // Color - mainly white and light blue
      const colors = ["rgba(255,255,255,0.4)", "rgba(200,230,255,0.5)", "rgba(230,240,255,0.3)"]
      const color = colors[Math.floor(Math.random() * colors.length)]

      newRays.push({
        startX,
        startY,
        controlX,
        controlY,
        endX,
        endY,
        width,
        color,
        opacity: Math.random() * 0.4 + 0.2,
      })
    }

    return newRays
  }

  // Start black hole animation
  const startBlackHoleAnimation = () => {
    console.log("Starting black hole animation")

    if (isActive) {
      console.log("Animation already active, ignoring")
      return
    }

    setIsActive(true)
    animationState.current.phase = 0
    animationState.current.progress = 0
    animationState.current.totalProgress = 0

    // Initialize black hole
    if (!canvasRef.current) {
      console.error("Canvas ref is null")
      return
    }

    initCanvas()

    // Set initial black hole event horizon radius
    const baseRadius = Math.min(window.innerWidth, window.innerHeight) * 0.08
    eventHorizonRadius.current = baseRadius
    console.log("Event horizon radius:", eventHorizonRadius.current)

    // Set ellipse parameters
    ellipseParams.current.radiusX = buttonSize.current.width / 2 // Initial X radius is half button width
    ellipseParams.current.radiusY = buttonSize.current.height / 2 // Initial Y radius is half button height
    ellipseParams.current.rotation = (Math.random() * Math.PI) / 4 // Random rotation angle
    console.log("Ellipse params:", ellipseParams.current)

    // Hide button
    if (buttonRef.current) {
      buttonRef.current.style.opacity = "0"
      buttonRef.current.style.pointerEvents = "none"
    } else {
      console.error("Button ref is null")
    }

    // Create stars
    stars.current = createStars(300)
    console.log("Created stars:", stars.current.length)

    // Create gravitational lens rays
    lensRays.current = createLensRays(40)
    console.log("Created lens rays:", lensRays.current.length)

    // Create accretion disk
    accretionDisk.current = createAccretionDisk()
    console.log("Created accretion disk:", accretionDisk.current.length)

    // Start animation loop
    lastTimeRef.current = performance.now()
    startTimeRef.current = lastTimeRef.current
    console.log("Animation starting at:", startTimeRef.current)

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime
      const elapsedTime = currentTime - startTimeRef.current

      // Update animation state
      const phaseDuration = duration / 3 // Three phases, each taking a third
      animationState.current.totalProgress = Math.min(1, elapsedTime / duration)

      if (elapsedTime < phaseDuration) {
        // Phase 0: Black hole formation
        animationState.current.phase = 0
        animationState.current.progress = elapsedTime / phaseDuration
      } else if (elapsedTime < phaseDuration * 2) {
        // Phase 1: Black hole stable
        animationState.current.phase = 1
        animationState.current.progress = (elapsedTime - phaseDuration) / phaseDuration
      } else {
        // Phase 2: Black hole disappearing
        animationState.current.phase = 2
        animationState.current.progress = (elapsedTime - phaseDuration * 2) / phaseDuration
      }

      // Update and draw
      updateBlackHole(deltaTime)
      drawBlackHole()

      // Continue animation or end
      if (elapsedTime < duration) {
        animationIdRef.current = requestAnimationFrame(animate)
      } else {
        console.log("Animation complete")
        setIsActive(false)

        // Clear canvas
        if (ctxRef.current && canvasRef.current) {
          ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }

        if (animationIdRef.current !== null) {
          cancelAnimationFrame(animationIdRef.current)
          animationIdRef.current = null
        }

        // Show button
        if (buttonRef.current) {
          buttonRef.current.style.opacity = "1"
          buttonRef.current.style.pointerEvents = "auto"
        }
      }
    }

    animationIdRef.current = requestAnimationFrame(animate)
    console.log("Animation frame requested:", animationIdRef.current)
  }

  // Update black hole state
  const updateBlackHole = (deltaTime: number) => {
    // Update animation progress
    if (animationState.current.phase === 0) {
      // Formation phase
      animationState.current.progress += (deltaTime / 1000) * 0.5 // Black hole formation speed
      if (animationState.current.progress >= 1) {
        animationState.current.progress = 1
        animationState.current.phase = 1
      }
    } else if (animationState.current.phase === 1) {
      // Stable phase
      const stableDuration = (duration * 0.6) / 1000 // Stable phase duration (seconds)
      animationState.current.progress += deltaTime / 1000 / stableDuration
      if (animationState.current.progress >= 1) {
        animationState.current.progress = 0
        animationState.current.phase = 2
      }
    } else {
      // Disappearing phase
      animationState.current.progress += (deltaTime / 1000) * 0.7 // Black hole disappearing speed
      if (animationState.current.progress >= 1) {
        // Animation end
        setIsActive(false)
        if (animationIdRef.current !== null) {
          cancelAnimationFrame(animationIdRef.current)
          animationIdRef.current = null
        }
        return
      }
    }

    // Calculate overall progress
    if (animationState.current.phase === 0) {
      animationState.current.totalProgress = animationState.current.progress * 0.3
    } else if (animationState.current.phase === 1) {
      animationState.current.totalProgress = 0.3 + animationState.current.progress * 0.4
    } else {
      animationState.current.totalProgress = 0.7 + animationState.current.progress * 0.3
    }

    // Update black hole parameters based on progress
    const intensityValue = intensity

    // Update event horizon radius
    if (animationState.current.phase === 0) {
      // Formation phase, grow from 0 to max
      eventHorizonRadius.current = buttonSize.current.width * 0.5 * animationState.current.progress * intensityValue
    } else if (animationState.current.phase === 1) {
      // Stable phase, with pulsing effect
      const pulseFactor = 1 + Math.sin(animationState.current.progress * Math.PI * 6) * 0.1
      eventHorizonRadius.current = buttonSize.current.width * 0.5 * pulseFactor * intensityValue
    } else {
      // Disappearing phase, gradually shrink
      eventHorizonRadius.current =
        buttonSize.current.width * 0.5 * (1 - animationState.current.progress) * intensityValue
    }

    // Update ellipse parameters
    const baseRadiusX = eventHorizonRadius.current
    const baseRadiusY = eventHorizonRadius.current

    // Time-varying ellipse distortion
    const timeDistortion = Math.sin(Date.now() / 1000) * 0.2

    // Set different ellipse parameters based on phase
    if (animationState.current.phase === 0) {
      // Formation phase, gradually change from circle to ellipse
      const eccentricity = animationState.current.progress * 0.3 * intensityValue // Ellipse eccentricity
      ellipseParams.current.radiusX = baseRadiusX * (1 + eccentricity + timeDistortion)
      ellipseParams.current.radiusY = baseRadiusY * (1 - eccentricity + timeDistortion * 0.5)
      ellipseParams.current.rotation = (animationState.current.progress * Math.PI) / 6 // Rotation angle

      // Random offset of center point, but keep near button
      const maxOffset = buttonSize.current.width * 0.1 * animationState.current.progress
      ellipseParams.current.offsetX = (Math.random() * 2 - 1) * maxOffset
      ellipseParams.current.offsetY = (Math.random() * 2 - 1) * maxOffset
    } else if (animationState.current.phase === 1) {
      // Stable phase, ellipse shape fluctuates
      const time = Date.now() / 1000
      const waveX = Math.sin(time * 1.5) * 0.2 * intensityValue
      const waveY = Math.cos(time * 2.0) * 0.15 * intensityValue

      ellipseParams.current.radiusX = baseRadiusX * (1.3 + waveX + timeDistortion)
      ellipseParams.current.radiusY = baseRadiusY * (0.8 + waveY + timeDistortion * 0.5)
      ellipseParams.current.rotation += (deltaTime / 1000) * 0.2 // Slow rotation

      // Center point slight oscillation
      const orbitRadius = buttonSize.current.width * 0.15
      ellipseParams.current.offsetX = Math.cos(time * 0.7) * orbitRadius
      ellipseParams.current.offsetY = Math.sin(time * 0.5) * orbitRadius
    } else {
      // Disappearing phase, ellipse gradually returns to circle
      const eccentricity = (1 - animationState.current.progress) * 0.3 * intensityValue
      ellipseParams.current.radiusX = baseRadiusX * (1 + eccentricity)
      ellipseParams.current.radiusY = baseRadiusY * (1 - eccentricity)
      ellipseParams.current.rotation -= (deltaTime / 1000) * 0.5 // Reverse rotation

      // Center point gradually returns to original position
      ellipseParams.current.offsetX *= 1 - (deltaTime / 1000) * 2
      ellipseParams.current.offsetY *= 1 - (deltaTime / 1000) * 2
    }

    // Update star particles
    stars.current.forEach((star) => {
      // Update star position and distortion
      const distanceToCenter = Math.sqrt(
        Math.pow(star.x - center.current.x - ellipseParams.current.offsetX, 2) +
          Math.pow(star.y - center.current.y - ellipseParams.current.offsetY, 2),
      )

      // Calculate gravitational influence based on distance
      const gravitationalPull = Math.min(1, (eventHorizonRadius.current * 5) / Math.max(1, distanceToCenter))
      star.distortion = gravitationalPull * intensityValue

      // Update angle and radial velocity
      star.angle += (star.angularVelocity * deltaTime) / 1000
      star.radialVelocity = gravitationalPull * 50 * intensityValue

      // If star is pulled into black hole, regenerate at a distance
      if (distanceToCenter < eventHorizonRadius.current || star.opacity <= 0) {
        // Reset star position to a distance
        const angle = Math.random() * Math.PI * 2
        const distance = Math.max(window.innerWidth, window.innerHeight) * (1 + Math.random())

        star.x = center.current.x + Math.cos(angle) * distance
        star.y = center.current.y + Math.sin(angle) * distance
        star.opacity = 0.1 + Math.random() * 0.9
        star.distance = distance
        star.angle = angle
        star.distortion = 0
      } else {
        // Update position
        const moveAngle = Math.atan2(
          star.y - center.current.y - ellipseParams.current.offsetY,
          star.x - center.current.x - ellipseParams.current.offsetX,
        )

        star.x -= (Math.cos(moveAngle) * star.radialVelocity * deltaTime) / 1000
        star.y -= (Math.sin(moveAngle) * star.radialVelocity * deltaTime) / 1000

        // Update opacity
        if (distanceToCenter < eventHorizonRadius.current * 3) {
          star.opacity -= (deltaTime / 1000) * gravitationalPull
        }
      }
    })

    // Update accretion disk
    accretionDisk.current.forEach((segment) => {
      // Update angle
      segment.startAngle += (segment.angularVelocity * deltaTime) / 1000
      segment.endAngle += (segment.angularVelocity * deltaTime) / 1000

      // Update opacity based on black hole phase
      if (animationState.current.phase === 0) {
        segment.opacity = Math.min(1, segment.opacity + (deltaTime / 1000) * 0.5)
      } else if (animationState.current.phase === 2) {
        segment.opacity = Math.max(0, segment.opacity - (deltaTime / 1000) * 0.7)
      }
    })

    // Update gravitational lens rays
    lensRays.current.forEach((ray) => {
      // Update opacity based on black hole phase
      if (animationState.current.phase === 0) {
        ray.opacity = Math.min(0.7, ray.opacity + (deltaTime / 1000) * 0.3)
      } else if (animationState.current.phase === 2) {
        ray.opacity = Math.max(0, ray.opacity - (deltaTime / 1000) * 0.5)
      } else {
        // Stable phase, ray opacity fluctuates
        ray.opacity = 0.3 + Math.sin(Date.now() / 500) * 0.2
      }

      // Update control point position for more dynamic ray bending
      const centerX = center.current.x + ellipseParams.current.offsetX
      const centerY = center.current.y + ellipseParams.current.offsetY
      const startToCenterX = centerX - ray.startX
      const startToCenterY = centerY - ray.startY
      const distanceToCenter = Math.sqrt(startToCenterX * startToCenterX + startToCenterY * startToCenterY)

      // Calculate control point position to make rays bend around black hole
      const bendFactor = Math.min(1, (eventHorizonRadius.current * 3) / distanceToCenter) * intensityValue
      const perpX = -startToCenterY / distanceToCenter
      const perpY = startToCenterX / distanceToCenter

      ray.controlX = (ray.startX + ray.endX) / 2 + perpX * distanceToCenter * bendFactor * 0.5
      ray.controlY = (ray.startY + ray.endY) / 2 + perpY * distanceToCenter * bendFactor * 0.5
    })
  }

  // Draw black hole and effects
  const drawBlackHole = () => {
    if (!ctxRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = ctxRef.current

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Determine overall opacity
    let globalOpacity = 1
    if (animationState.current.phase === 0) {
      globalOpacity = animationState.current.progress
    } else if (animationState.current.phase === 2) {
      globalOpacity = 1 - animationState.current.progress
    }

    // Set canvas global opacity
    context.globalAlpha = globalOpacity

    // Draw space distortion effect
    drawSpaceDistortion(context)

    // Draw gravitational lensing
    drawGravitationalLensing(context)

    // Draw star particles
    drawStars(context)

    // Draw event horizon
    drawEventHorizon(context)

    // Draw overall glow effect
    drawOverallGlow(context)

    // Reset global opacity
    context.globalAlpha = 1
  }

  // Draw space distortion effect
  const drawSpaceDistortion = (context: CanvasRenderingContext2D) => {
    try {
      // Ensure radius is always positive
      const innerRadius = Math.max(0.1, eventHorizonRadius.current * 1.5)
      const distortionRadius = Math.max(innerRadius + 0.1, eventHorizonRadius.current * 8)
      const centerX = center.current.x + ellipseParams.current.offsetX
      const centerY = center.current.y + ellipseParams.current.offsetY

      // Create radial gradient
      const gradient = context.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, distortionRadius)

      gradient.addColorStop(0, "rgba(30, 10, 50, 0.8)")
      gradient.addColorStop(0.3, "rgba(40, 20, 70, 0.6)")
      gradient.addColorStop(0.7, "rgba(30, 20, 60, 0.3)")
      gradient.addColorStop(1, "rgba(20, 10, 40, 0)")

      context.fillStyle = gradient

      // Draw elliptical distortion area
      context.save()
      context.translate(centerX, centerY)
      context.rotate(ellipseParams.current.rotation)

      // Ensure scale ratio is positive
      const scaleX = (Math.max(0.1, ellipseParams.current.radiusX) / Math.max(0.1, eventHorizonRadius.current)) * 8
      const scaleY = (Math.max(0.1, ellipseParams.current.radiusY) / Math.max(0.1, eventHorizonRadius.current)) * 8
      context.scale(scaleX, scaleY)

      context.beginPath()
      context.arc(0, 0, distortionRadius, 0, Math.PI * 2)
      context.restore()
      context.fill()
    } catch (error) {
      console.error("Error in drawSpaceDistortion:", error)
      // Use fallback drawing method
      context.fillStyle = "rgba(40, 20, 70, 0.3)"
      context.beginPath()
      context.ellipse(
        center.current.x + ellipseParams.current.offsetX,
        center.current.y + ellipseParams.current.offsetY,
        Math.max(0.1, Math.abs(ellipseParams.current.radiusX * 8)),
        Math.max(0.1, Math.abs(ellipseParams.current.radiusY * 8)),
        ellipseParams.current.rotation,
        0,
        Math.PI * 2,
      )
      context.fill()
    }
  }

  // Draw gravitational lensing effect
  const drawGravitationalLensing = (context: CanvasRenderingContext2D) => {
    lensRays.current.forEach((ray) => {
      context.strokeStyle = ray.color
      context.globalAlpha = ray.opacity * (1 - animationState.current.progress * 0.3)
      context.lineWidth = ray.width

      context.beginPath()
      context.moveTo(ray.startX, ray.startY)
      context.quadraticCurveTo(ray.controlX, ray.controlY, ray.endX, ray.endY)
      context.stroke()
    })

    // Reset opacity
    context.globalAlpha = 1
  }

  // Draw star particles
  const drawStars = (context: CanvasRenderingContext2D) => {
    stars.current.forEach((star) => {
      if (star.opacity <= 0) return

      context.fillStyle = star.color
      context.globalAlpha = star.opacity

      if (star.distortion > 0) {
        // Draw distorted star
        context.save()
        context.translate(star.x, star.y)

        // Calculate star angle relative to black hole
        const angleToCenter = Math.atan2(
          star.y - (center.current.y + ellipseParams.current.offsetY),
          star.x - (center.current.x + ellipseParams.current.offsetX),
        )
        context.rotate(angleToCenter)

        // Elliptical shape distortion
        context.beginPath()
        context.ellipse(0, 0, star.size * (1 + star.distortion), star.size, 0, 0, Math.PI * 2)
        context.fill()

        context.restore()
      } else {
        // Draw normal star
        context.beginPath()
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        context.fill()
      }
    })

    // Reset opacity
    context.globalAlpha = 1
  }

  // Draw event horizon
  const drawEventHorizon = (context: CanvasRenderingContext2D) => {
    try {
      const radius = Math.max(0.1, eventHorizonRadius.current)
      const centerX = center.current.x + ellipseParams.current.offsetX
      const centerY = center.current.y + ellipseParams.current.offsetY

      // Create radial gradient
      const gradient = context.createRadialGradient(
        centerX,
        centerY,
        0.1, // Ensure inner radius is positive
        centerX,
        centerY,
        radius,
      )

      gradient.addColorStop(0, "rgba(0, 0, 0, 1)")
      gradient.addColorStop(0.7, "rgba(5, 0, 10, 1)")
      gradient.addColorStop(0.9, "rgba(20, 0, 40, 0.9)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)")

      context.fillStyle = gradient

      // Draw elliptical black hole
      context.save()
      context.translate(centerX, centerY)
      context.rotate(ellipseParams.current.rotation)

      // Ensure scale ratio is positive
      const scaleX = Math.max(0.1, ellipseParams.current.radiusX) / Math.max(0.1, radius)
      const scaleY = Math.max(0.1, ellipseParams.current.radiusY) / Math.max(0.1, radius)
      context.scale(scaleX, scaleY)

      context.beginPath()
      context.arc(0, 0, radius, 0, Math.PI * 2)
      context.restore()
      context.fill()
    } catch (error) {
      console.error("Error in drawEventHorizon:", error)
      // Use fallback drawing method, ensure all parameters are positive
      context.fillStyle = "rgba(0, 0, 0, 1)"

      // Ensure all radii are positive
      const radiusX = Math.max(0.1, Math.abs(ellipseParams.current.radiusX))
      const radiusY = Math.max(0.1, Math.abs(ellipseParams.current.radiusY))

      context.beginPath()
      context.ellipse(
        center.current.x + ellipseParams.current.offsetX,
        center.current.y + ellipseParams.current.offsetY,
        radiusX,
        radiusY,
        ellipseParams.current.rotation,
        0,
        Math.PI * 2,
      )
      context.fill()
    }
  }

  // Draw overall glow effect
  const drawOverallGlow = (context: CanvasRenderingContext2D) => {
    try {
      const innerRadius = Math.max(0.1, eventHorizonRadius.current)
      const glowRadius = Math.max(innerRadius + 0.1, eventHorizonRadius.current * 3)
      const centerX = center.current.x + ellipseParams.current.offsetX
      const centerY = center.current.y + ellipseParams.current.offsetY

      // Create radial gradient
      const gradient = context.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, glowRadius)

      gradient.addColorStop(0, "rgba(155, 77, 223, 0.4)")
      gradient.addColorStop(0.3, "rgba(120, 60, 180, 0.3)")
      gradient.addColorStop(0.7, "rgba(80, 40, 120, 0.2)")
      gradient.addColorStop(1, "rgba(40, 20, 80, 0)")

      context.fillStyle = gradient

      // Draw elliptical glow
      context.save()
      context.translate(centerX, centerY)
      context.rotate(ellipseParams.current.rotation)

      // Ensure scale ratio is positive
      const scaleX = (Math.max(0.1, ellipseParams.current.radiusX) / Math.max(0.1, eventHorizonRadius.current)) * 3
      const scaleY = (Math.max(0.1, ellipseParams.current.radiusY) / Math.max(0.1, eventHorizonRadius.current)) * 3
      context.scale(scaleX, scaleY)

      context.beginPath()
      context.arc(0, 0, glowRadius, 0, Math.PI * 2)
      context.restore()
      context.fill()
    } catch (error) {
      console.error("Error in drawOverallGlow:", error)
      // Use fallback drawing method, ensure all parameters are positive
      context.fillStyle = "rgba(120, 60, 180, 0.2)"

      // Ensure all radii are positive
      const radiusX = Math.max(0.1, Math.abs(ellipseParams.current.radiusX * 3))
      const radiusY = Math.max(0.1, Math.abs(ellipseParams.current.radiusY * 3))

      context.beginPath()
      context.ellipse(
        center.current.x + ellipseParams.current.offsetX,
        center.current.y + ellipseParams.current.offsetY,
        radiusX,
        radiusY,
        ellipseParams.current.rotation,
        0,
        Math.PI * 2,
      )
      context.fill()
    }
  }

  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Button clicked")

    if (isActive) {
      console.log("Already active, ignoring click")
      return
    }

    // Start black hole animation
    startBlackHoleAnimation()

    // Call onClick handler if provided
    if (onClick) {
      console.log("Calling provided onClick handler")
      onClick()
    }
  }

  // Resize canvas on window resize
  const resizeCanvas = () => {
    if (isActive) {
      initCanvas()
    }
  }

  // Set up event listeners
  useEffect(() => {
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)

      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current)
        animationIdRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative inline-block" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
        style={{ display: isActive ? "block" : "none" }}
      />
      <motion.button
        ref={buttonRef}
        onClick={handleClick}
        className="relative cursor-pointer py-2.5 px-2.5 text-base font-semibold text-white bg-gradient-to-br from-[#6b33a0] to-[#4c1d80] border border-[#9b4ddf] rounded-xl shadow-[0_0_15px_rgba(155,77,223,0.5)] transition-all duration-300 z-10 min-w-[150px] outline-none overflow-hidden"
        whileHover={{
          y: -2,
          boxShadow: "0 0 20px rgba(155, 77, 223, 0.7)",
        }}
        whileTap={{
          y: 1,
          boxShadow: "0 0 8px rgba(155, 77, 223, 0.4)",
        }}
      >
        <span className="relative z-10 drop-shadow-md">{buttonText}</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#9b4ddf] to-[#6b33a0] opacity-0 z-0"
          whileHover={{ opacity: 1 }}
        />
      </motion.button>
    </div>
  )
}
