import { useState } from 'react';
import { Game } from './components/Game';
import { Help } from './components/Help';

function App() {
  const [showHelp, setShowHelp] = useState(false);

  function onClickShowHelp(show) {
    return (e) => {
      e.preventDefault();
      setShowHelp(show);
      console.log('onClickShowHelp', show);
    };
  }

  return (
    <div className='app'>
      <header role='title'>
        <div></div>
        <div className='title'>Kinderwordle</div>
        <div>
          <span>
            <a href='#' onClick={onClickShowHelp(true)}>
              Help
            </a>
          </span>
        </div>
      </header>
      <Game />
      <Help show={showHelp} onClose={onClickShowHelp(false)} />
    </div>
  );
}

export default App;
