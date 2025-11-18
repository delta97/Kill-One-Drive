import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UploadView, SettingsView, GameView } from './views';
import { SoundManager } from './services';

function App() {
  // Initialize sound effects on mount
  useEffect(() => {
    SoundManager.preload();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/game" element={<GameView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
