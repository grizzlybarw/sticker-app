import { STICKER_PACKS } from '../data/stickers.js'

export default function StickerSelectScreen({ onSelect, onBack }) {
  return (
    <div className="screen select-screen">
      <div className="select-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="select-title">Pick Stickers! ⭐</div>
      </div>

      <div className="select-grid">
        {STICKER_PACKS.map(pack => (
          <div
            key={pack.id}
            className="pack-card"
            style={{ background: pack.color }}
            onClick={() => onSelect(pack)}
          >
            <div className="pack-preview">
              {pack.stickers.slice(0, 4).map(s => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <div className="pack-card-name">{pack.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
