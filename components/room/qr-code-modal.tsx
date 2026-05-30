'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QrCodeModalProps {
  roomId: string
  onClose: () => void
}

export function QrCodeModal({ roomId, onClose }: QrCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const link = `${window.location.origin}/room/${roomId}`

  useEffect(() => {
    QRCode.toDataURL(link, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1a1a1a',
        light: '#faf5e8',
      },
    })
      .then(setQrDataUrl)
      .catch(console.error)
  }, [link])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onClose}
      data-testid="qr-modal-overlay"
    >
      <div
        className="stitch-paper-texture w-full max-w-sm mx-4 rounded-lg shadow-2xl relative overflow-hidden p-6"
        style={{
          border: '12px double #4d4635',
          outline: '4px solid #4d4635',
          outlineOffset: '4px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-stamp-text text-stamp-text text-primary text-center mb-6 tracking-widest">
          JOIN THE ROOM
        </h2>

        <div className="flex justify-center mb-4">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code to join room"
              className="w-64 h-64"
            />
          ) : (
            <div className="w-64 h-64 bg-warm-cream animate-pulse flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                qr_code
              </span>
            </div>
          )}
        </div>

        <p className="text-center font-body-md text-on-surface-variant mb-6 break-all">
          {link}
        </p>

        <button
          onClick={onClose}
          className="w-full bg-primary-container text-on-primary-container h-touch-target font-stamp-text text-stamp-text border-2 border-primary shadow-lg rounded-lg flex items-center justify-center gap-2 active:scale-95 hover:brightness-110 transition-all"
        >
          CLOSE
        </button>
      </div>
    </div>
  )
}
