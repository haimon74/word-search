import React, { useState } from 'react';
import WordSearch from './components/WordSearch';
import './App.css';

type GridSize = 10 | 15 | 20;

function App() {
  const [selectedSize, setSelectedSize] = useState<GridSize>(10);

  return (
    <div className="app">
      <WordSearch 
        gridSize={selectedSize} 
        onChangeSize={setSelectedSize} 
      />
    </div>
  );
}

export default App;
