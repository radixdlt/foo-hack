import React from 'react';
import Landing from './routes/Landing/Landing';
import Admin from './routes/Admin';
import Game from './routes/Game';
import Leaderboard from './routes/Leaderboard';

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="game/:gameAddress" element={<Game />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>

  );

}

export default App;
