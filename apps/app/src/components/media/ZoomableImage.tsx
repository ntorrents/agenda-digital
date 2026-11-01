'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const MIN_SCALE = 1
const MAX_SCALE = 4
const DOUBLE_TAP_MS = 280
const DOUBLE_TAP_ZOOM = 2.5

type Point = { x: number; y: number }

function distance(a: Point, b: Point) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

function midPoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function ZoomableImage({
  src,
  alt,
  onInteractChange,
}: {
  src: string
  alt: string
  /** true cuando scale > 1 (para bloquear swipe de galería / cierre accidental) */
  onInteractChange?: (zoomed: boolean) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })

  const scaleRef = useRef(1)
  const offsetRef = useRef<Point>({ x: 0, y: 0 })
  const pinchRef = useRef<{ startDist: number; startScale: number; startOffset: Point; startMid: Point } | null>(null)
  const panRef = useRef<{ startX: number; startY: number; origX: number; origY: number; pointerId: number } | null>(null)
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null)

  const publish = useCallback(
    (nextScale: number, nextOffset: Point) => {
      scaleRef.current = nextScale
      offsetRef.current = nextOffset
      setScale(nextScale)
      setOffset(nextOffset)
      onInteractChange?.(nextScale > 1.01)
    },
    [onInteractChange]
  )

  const reset = useCallback(() => {
    publish(1, { x: 0, y: 0 })
  }, [publish])

  // Al cambiar de foto, resetear zoom
  useEffect(() => {
    reset()
  }, [src, reset])

  const constrainOffset = useCallback((s: number, o: Point): Point => {
    const el = containerRef.current
    if (!el || s <= 1) return { x: 0, y: 0 }
    const { width, height } = el.getBoundingClientRect()
    const maxX = ((s - 1) * width) / 2
    const maxY = ((s - 1) * height) / 2
    return {
      x: clamp(o.x, -maxX, maxX),
      y: clamp(o.y, -maxY, maxY),
    }
  }, [])

  const zoomAt = useCallback(
    (clientX: number, clientY: number, nextScale: number) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = clientX - rect.left - rect.width / 2
      const cy = clientY - rect.top - rect.height / 2
      const prev = scaleRef.current
      const ratio = nextScale / prev
      const nextOffset = constrainOffset(nextScale, {
        x: offsetRef.current.x - cx * (ratio - 1),
        y: offsetRef.current.y - cy * (ratio - 1),
      })
      publish(nextScale, nextOffset)
    },
    [constrainOffset, publish]
  )

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const delta = -e.deltaY * 0.0015
      const next = clamp(scaleRef.current * (1 + delta), MIN_SCALE, MAX_SCALE)
      if (next <= MIN_SCALE) {
        reset()
        return
      }
      zoomAt(e.clientX, e.clientY, next)
    },
    [reset, zoomAt]
  )

  // Listeners nativos (passive: false) para poder preventDefault en pinch/pan
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        panRef.current = null
        const a = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        const b = { x: e.touches[1].clientX, y: e.touches[1].clientY }
        pinchRef.current = {
          startDist: distance(a, b) || 1,
          startScale: scaleRef.current,
          startOffset: { ...offsetRef.current },
          startMid: midPoint(a, b),
        }
        return
      }

      if (e.touches.length === 1 && scaleRef.current > 1.01) {
        const t = e.touches[0]
        panRef.current = {
          startX: t.clientX,
          startY: t.clientY,
          origX: offsetRef.current.x,
          origY: offsetRef.current.y,
          pointerId: t.identifier,
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault()
        const a = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        const b = { x: e.touches[1].clientX, y: e.touches[1].clientY }
        const dist = distance(a, b) || 1
        const mid = midPoint(a, b)
        const nextScale = clamp(
          pinchRef.current.startScale * (dist / pinchRef.current.startDist),
          MIN_SCALE,
          MAX_SCALE
        )
        const rect = el.getBoundingClientRect()
        const startLocal = {
          x: pinchRef.current.startMid.x - rect.left - rect.width / 2,
          y: pinchRef.current.startMid.y - rect.top - rect.height / 2,
        }
        const midLocal = {
          x: mid.x - rect.left - rect.width / 2,
          y: mid.y - rect.top - rect.height / 2,
        }
        const ratio = nextScale / pinchRef.current.startScale
        const nextOffset = constrainOffset(nextScale, {
          x: pinchRef.current.startOffset.x + midLocal.x - startLocal.x * ratio,
          y: pinchRef.current.startOffset.y + midLocal.y - startLocal.y * ratio,
        })
        publish(nextScale, nextOffset)
        return
      }

      if (e.touches.length === 1 && panRef.current && scaleRef.current > 1.01) {
        e.preventDefault()
        const t = e.touches[0]
        const nextOffset = constrainOffset(scaleRef.current, {
          x: panRef.current.origX + (t.clientX - panRef.current.startX),
          y: panRef.current.origY + (t.clientY - panRef.current.startY),
        })
        publish(scaleRef.current, nextOffset)
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current = null
      if (e.touches.length === 0) panRef.current = null

      if (e.changedTouches.length === 1 && e.touches.length === 0) {
        const t = e.changedTouches[0]
        const now = Date.now()
        const last = lastTapRef.current
        if (
          last &&
          now - last.time < DOUBLE_TAP_MS &&
          Math.hypot(t.clientX - last.x, t.clientY - last.y) < 40
        ) {
          lastTapRef.current = null
          if (scaleRef.current > 1.05) {
            reset()
          } else {
            zoomAt(t.clientX, t.clientY, DOUBLE_TAP_ZOOM)
          }
        } else {
          lastTapRef.current = { time: now, x: t.clientX, y: t.clientY }
        }
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [constrainOffset, publish, reset, zoomAt])

  // Pan con ratón cuando hay zoom
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    if (scaleRef.current <= 1.01) return
    e.currentTarget.setPointerCapture(e.pointerId)
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: offsetRef.current.x,
      origY: offsetRef.current.y,
      pointerId: e.pointerId,
    }
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!panRef.current || panRef.current.pointerId !== e.pointerId) return
      if (scaleRef.current <= 1.01) return
      const nextOffset = constrainOffset(scaleRef.current, {
        x: panRef.current.origX + (e.clientX - panRef.current.startX),
        y: panRef.current.origY + (e.clientY - panRef.current.startY),
      })
      publish(scaleRef.current, nextOffset)
    },
    [constrainOffset, publish]
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (panRef.current?.pointerId === e.pointerId) panRef.current = null
  }, [])

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (scaleRef.current > 1.05) {
        reset()
      } else {
        zoomAt(e.clientX, e.clientY, DOUBLE_TAP_ZOOM)
      }
    },
    [reset, zoomAt]
  )

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden touch-none select-none"
      style={{ cursor: scale > 1.01 ? 'grab' : 'zoom-in' }}
      onClick={(e) => e.stopPropagation()}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
        }}
      >
        <Image src={src} alt={alt} fill className="object-contain pointer-events-none" unoptimized priority />
      </div>
    </div>
  )
}
