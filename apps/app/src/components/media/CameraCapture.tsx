'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'

type CameraCaptureProps = {
  label: string
  onCapture: (file: File) => void
  className?: string
}

export function CameraCapture({ label, onCapture, className }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
  }

  const close = () => {
    stopStream()
    setOpen(false)
  }

  const openCamera = async () => {
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      pickWithCaptureInput()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      setOpen(true)
    } catch {
      pickWithCaptureInput()
    }
  }

  useEffect(() => {
    if (!open || !videoRef.current || !streamRef.current) return
    videoRef.current.srcObject = streamRef.current
    void videoRef.current.play().catch(() => {})
  }, [open])

  useEffect(() => () => stopStream(), [])

  const pickWithCaptureInput = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.setAttribute('capture', 'environment')
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) onCapture(file)
    }
    input.click()
  }

  const takePhoto = () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(blob => {
      if (!blob) return
      const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' })
      onCapture(file)
      close()
    }, 'image/jpeg', 0.9)
  }

  return (
    <>
      <button type="button" onClick={openCamera} className={className}>
        <Camera className="h-4 w-4" /> {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-3">
            <div className="flex items-center justify-between text-white">
              <p className="text-sm font-bold">Càmera</p>
              <button type="button" onClick={close} className="p-2 rounded-full hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <video ref={videoRef} playsInline autoPlay muted className="w-full rounded-2xl bg-black aspect-[3/4] object-cover" />
            {error && <p className="text-xs text-red-300">{error}</p>}
            <button
              type="button"
              onClick={takePhoto}
              className="w-full py-3 rounded-2xl bg-white text-stone-900 font-black text-sm"
            >
              Fer foto
            </button>
          </div>
        </div>
      )}
    </>
  )
}
