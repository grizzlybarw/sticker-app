import { useState, useRef, useEffect, useCallback } from 'react'
import { STICKER_PACKS } from '../data/stickers.js'
import { playPop, playDelete, playSelect } from '../utils/sound.js'

function getXY(e) {
  if (e.touches && e.touches.length > 0) return [e.touches[0].clientX, e.touches[0].clientY]
  if (e.changedTouches && e.changedTouches.length > 0) return [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
  return [e.clientX, e.clientY]
}

export default function WorkspaceScreen({ background, initialPack, onBack }) {
  const [placedStickers, setPlacedStickers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [sparkles, setSparkles] = useState([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [ghostSticker, setGhostSticker] = useState(null)
  const [activePack, setActivePack] = useState(initialPack || STICKER_PACKS[0])

  const canvasRef = useRef(null)
  const dragRef = useRef(null)
  const isMutedRef = useRef(false)
  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])

  // Drag from sticker tray
  const startTrayDrag = useCallback((emoji, e) => {
    e.preventDefault()
    const [x, y] = getXY(e)
    dragRef.current = { type: 'tray', emoji }
    setGhostSticker({ emoji, x, y })
    setSelectedId(null)
  }, [])

  // Drag placed sticker
  const startPlacedDrag = useCallback((sticker, e) => {
    e.preventDefault()
    e.stopPropagation()
    const [x, y] = getXY(e)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const screenX = rect.left + (sticker.x / 100) * rect.width
    const screenY = rect.top + (sticker.y / 100) * rect.height
    dragRef.current = {
      type: 'placed',
      id: sticker.id,
      startX: x, startY: y,
      startTime: Date.now(),
      offsetX: x - screenX,
      offsetY: y - screenY,
    }
  }, [])

  const addSparkle = useCallback((x, y) => {
    const id = Date.now() + Math.random()
    setSparkles(prev => [...prev, { id, x, y }])
    setTimeout(() => setSparkles(prev => prev.filter(s => s.id !== id)), 900)
  }, [])

  // Global pointer move/end handlers
  useEffect(() => {
    const handleMove = (e) => {
      if (!dragRef.current) return
      if (e.cancelable) e.preventDefault()
      const [x, y] = getXY(e)

      if (dragRef.current.type === 'tray') {
        setGhostSticker({ emoji: dragRef.current.emoji, x, y })
      } else if (dragRef.current.type === 'placed') {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        const px = ((x - dragRef.current.offsetX - rect.left) / rect.width) * 100
        const py = ((y - dragRef.current.offsetY - rect.top) / rect.height) * 100
        const id = dragRef.current.id
        setPlacedStickers(prev => prev.map(s =>
          s.id === id
            ? { ...s, x: Math.max(2, Math.min(98, px)), y: Math.max(2, Math.min(98, py)) }
            : s
        ))
      }
    }

    const handleEnd = (e) => {
      if (!dragRef.current) return
      const [x, y] = getXY(e)

      if (dragRef.current.type === 'tray') {
        const emoji = dragRef.current.emoji   // capture before ref is cleared
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          const px = ((x - rect.left) / rect.width) * 100
          const py = ((y - rect.top) / rect.height) * 100
          const newId = `s${Date.now()}${Math.random().toString(36).slice(2, 6)}`
          setPlacedStickers(prev => [...prev, {
            id: newId,
            emoji,
            x: px, y: py,
            size: 3.5,
            rotation: 0,
          }])
          addSparkle(x, y)
          if (!isMutedRef.current) playPop()
        }
        setGhostSticker(null)

      } else if (dragRef.current.type === 'placed') {
        const dx = x - dragRef.current.startX
        const dy = y - dragRef.current.startY
        const dt = Date.now() - dragRef.current.startTime
        const isTap = Math.hypot(dx, dy) < 8 && dt < 350
        if (isTap) {
          const id = dragRef.current.id
          // Bring to front + select/deselect
          setPlacedStickers(prev => {
            const s = prev.find(item => item.id === id)
            if (!s) return prev
            return [...prev.filter(item => item.id !== id), s]
          })
          setSelectedId(prev => {
            if (prev !== id && !isMutedRef.current) playSelect()
            return prev === id ? null : id
          })
        }
      }

      dragRef.current = null
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [addSparkle])

  // Sticker controls
  const deleteSelected = useCallback(() => {
    if (!isMutedRef.current) playDelete()
    setPlacedStickers(prev => prev.filter(s => s.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  const scaleSelected = useCallback((factor) => {
    setPlacedStickers(prev => prev.map(s =>
      s.id === selectedId ? { ...s, size: Math.max(1.2, Math.min(9, s.size * factor)) } : s
    ))
  }, [selectedId])

  const rotateSelected = useCallback((deg) => {
    setPlacedStickers(prev => prev.map(s =>
      s.id === selectedId ? { ...s, rotation: s.rotation + deg } : s
    ))
  }, [selectedId])

  const handleClear = () => {
    setPlacedStickers([])
    setSelectedId(null)
    setShowClearConfirm(false)
  }

  const handleSave = async () => {
    setSelectedId(null)
    await new Promise(r => setTimeout(r, 150))
    try {
      const { default: html2canvas } = await import('html2canvas')
      const imageCanvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })
      imageCanvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], 'my-sticker-page.png', { type: 'image/png' })
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], title: 'My Sticker Page!' }); return } catch {}
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'my-sticker-page.png'
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  const handleCanvasPointerDown = (e) => {
    // Only deselect if clicking directly on canvas background (not on a sticker)
    if (e.target === canvasRef.current || e.target.classList.contains('bg-deco')) {
      setSelectedId(null)
    }
  }

  const selectedSticker = placedStickers.find(s => s.id === selectedId)

  return (
    <div className="workspace">
      {/* Nav bar */}
      <nav className="workspace-nav">
        <div className="workspace-nav-left">
          <button className="nav-btn" onClick={onBack} title="Back">
            ←
          </button>
          <span className="nav-pack-preview">
            {activePack.stickers.slice(0, 3).join('')}
          </span>
        </div>
        <div className="workspace-nav-right">
          <button className="nav-btn" onClick={() => setIsMuted(m => !m)} title="Toggle sound">
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button className="nav-btn clear" onClick={() => setShowClearConfirm(true)} title="Clear page">
            🗑️
          </button>
          <button className="nav-btn save" onClick={handleSave} title="Save picture">
            📸
          </button>
        </div>
      </nav>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="canvas-area"
        style={background.style}
        onMouseDown={handleCanvasPointerDown}
        onTouchStart={handleCanvasPointerDown}
      >
        {background.decorations.map((d, i) => (
          <span key={i} className="bg-deco" style={d.style}>{d.emoji}</span>
        ))}

        {placedStickers.map(s => (
          <div
            key={s.id}
            className={`placed-sticker${selectedId === s.id ? ' selected' : ''}`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              fontSize: `${s.size}rem`,
              transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
            }}
            onMouseDown={(e) => startPlacedDrag(s, e)}
            onTouchStart={(e) => startPlacedDrag(s, e)}
          >
            {s.emoji}
          </div>
        ))}

        {sparkles.map(sp => (
          <div
            key={sp.id}
            className="sparkle-burst"
            style={{ position: 'fixed', left: sp.x, top: sp.y, pointerEvents: 'none' }}
          >
            {['✨', '⭐', '✨', '🌟', '✨', '💫'].map((star, i) => (
              <span key={i} className={`sparkle-particle p${i}`}>{star}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Sticker controls — shown when a sticker is selected */}
      {selectedSticker && (
        <div className="sticker-controls">
          <button className="ctrl-btn delete" onClick={deleteSelected} title="Delete">🗑️</button>
          <button className="ctrl-btn bigger" onClick={() => scaleSelected(1.25)} title="Bigger">➕</button>
          <button className="ctrl-btn smaller" onClick={() => scaleSelected(0.8)} title="Smaller">➖</button>
          <button className="ctrl-btn rotate-cw" onClick={() => rotateSelected(45)} title="Rotate">↻</button>
          <button className="ctrl-btn rotate-ccw" onClick={() => rotateSelected(-45)} title="Rotate back">↺</button>
        </div>
      )}

      {/* Sticker tray */}
      <div className="sticker-tray">
        <div className="pack-tabs">
          {STICKER_PACKS.map(pack => (
            <button
              key={pack.id}
              className={`pack-tab${activePack.id === pack.id ? ' active' : ''}`}
              onClick={() => setActivePack(pack)}
              title={pack.name}
              style={activePack.id === pack.id ? { background: pack.color } : {}}
            >
              {pack.icon}
            </button>
          ))}
        </div>
        <div className="tray-stickers">
          {activePack.stickers.map(emoji => (
            <div
              key={emoji}
              className="tray-sticker"
              onMouseDown={(e) => startTrayDrag(emoji, e)}
              onTouchStart={(e) => startTrayDrag(emoji, e)}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Ghost sticker following cursor/touch */}
      {ghostSticker && (
        <div
          className="ghost-sticker"
          style={{ left: ghostSticker.x, top: ghostSticker.y }}
        >
          {ghostSticker.emoji}
        </div>
      )}

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🧹</div>
            <div className="modal-text">Clear all stickers?</div>
            <div className="modal-buttons">
              <button className="modal-btn confirm" onClick={handleClear}>✓</button>
              <button className="modal-btn cancel" onClick={() => setShowClearConfirm(false)}>✗</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
