import React from 'react';
import Landing from './routes/Landing';
import Admin from './routes/Admin';
import Game from './routes/Game';

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
      </Routes>
    </BrowserRouter>

  );

}

export default App;
