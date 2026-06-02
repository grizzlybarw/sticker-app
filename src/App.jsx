import { useState } from 'react'
import HomeScreen from './screens/HomeScreen.jsx'
import PageSelectScreen from './screens/PageSelectScreen.jsx'
import StickerSelectScreen from './screens/StickerSelectScreen.jsx'
import WorkspaceScreen from './screens/WorkspaceScreen.jsx'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [selectedBackground, setSelectedBackground] = useState(null)
  const [selectedPack, setSelectedPack] = useState(null)

  return (
    <div className="app">
      {screen === 'home' && (
        <div className="screen-enter">
          <HomeScreen onStart={() => setScreen('pageSelect')} />
        </div>
      )}
      {screen === 'pageSelect' && (
        <div className="screen-enter">
          <PageSelectScreen
            onSelect={(bg) => { setSelectedBackground(bg); setScreen('stickerSelect') }}
            onBack={() => setScreen('home')}
          />
        </div>
      )}
      {screen === 'stickerSelect' && (
        <div className="screen-enter">
          <StickerSelectScreen
            onSelect={(pack) => { setSelectedPack(pack); setScreen('workspace') }}
            onBack={() => setScreen('pageSelect')}
          />
        </div>
      )}
      {screen === 'workspace' && (
        <div className="screen-enter" style={{ height: '100%' }}>
          <WorkspaceScreen
            background={selectedBackground}
            initialPack={selectedPack}
            onBack={() => setScreen('stickerSelect')}
          />
        </div>
      )}
    </div>
  )
}
