import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Interview from './pages/Interview';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview/:sessionId" element={<Interview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
