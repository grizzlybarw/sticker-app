const FLOATIES = [
  { emoji: '🐶', style: { top: '8%', left: '5%', '--dur': '3.5s', '--delay': '0s' } },
  { emoji: '🚀', style: { top: '5%', right: '8%', '--dur': '4s', '--delay': '0.5s' } },
  { emoji: '🌟', style: { top: '20%', left: '2%', '--dur': '3s', '--delay': '1s', fontSize: '2.5rem' } },
  { emoji: '🍕', style: { bottom: '18%', left: '4%', '--dur': '4.5s', '--delay': '0.3s' } },
  { emoji: '🦄', style: { bottom: '12%', right: '4%', '--dur': '3.8s', '--delay': '0.8s' } },
  { emoji: '⭐', style: { top: '35%', right: '3%', '--dur': '3.2s', '--delay': '1.5s', fontSize: '2.5rem' } },
  { emoji: '🌈', style: { bottom: '30%', left: '3%', '--dur': '5s', '--delay': '0.2s', fontSize: '2.5rem' } },
  { emoji: '🎈', style: { top: '50%', right: '5%', '--dur': '4.2s', '--delay': '0.7s', fontSize: '2.5rem' } },
  { emoji: '🐱', style: { top: '65%', left: '5%', '--dur': '3.6s', '--delay': '1.2s', fontSize: '2.5rem' } },
  { emoji: '✨', style: { top: '15%', left: '45%', '--dur': '2.8s', '--delay': '0.4s', fontSize: '2rem' } },
]

export default function HomeScreen({ onStart }) {
  return (
    <div className="screen home-screen">
      <div className="home-floaties">
        {FLOATIES.map((f, i) => (
          <span
            key={i}
            className="float-emoji"
            style={f.style}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      <div className="home-title">
        <span className="line1">MY</span>
        <span className="line2">STICKER</span>
        <span className="line1">BOOK</span>
      </div>

      <div className="home-book-icon">📖</div>

      <button className="start-btn" onClick={onStart}>
        LET'S GO!
      </button>
    </div>
  )
}
