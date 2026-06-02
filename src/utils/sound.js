let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

export function playPop() {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.12)
    gain.gain.setValueAtTime(0.35, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.2)
  } catch {}
}

export function playDelete() {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(350, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.2)
    gain.gain.setValueAtTime(0.18, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.28)
  } catch {}
}

export function playSelect() {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, c.currentTime)
    osc.frequency.setValueAtTime(900, c.currentTime + 0.08)
    gain.gain.setValueAtTime(0.2, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.22)
  } catch {}
}
