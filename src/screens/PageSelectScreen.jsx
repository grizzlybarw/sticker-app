import { BACKGROUNDS } from '../data/backgrounds.js'

export default function PageSelectScreen({ onSelect, onBack }) {
  return (
    <div className="screen select-screen">
      <div className="select-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="select-title">Pick a Page! 🎨</div>
      </div>

      <div className="select-grid">
        {BACKGROUNDS.map(bg => (
          <div
            key={bg.id}
            className="bg-card"
            onClick={() => onSelect(bg)}
          >
            <div
              className="bg-card-preview"
              style={bg.style}
            >
              <span className="bg-card-scene-emoji">{bg.emoji}</span>
            </div>
            <div className="bg-card-label">{bg.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
