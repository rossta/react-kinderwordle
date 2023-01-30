import { useState } from 'react';

import { words } from '../../words';

function Modal({ show, onClose, children }) {
  return (
    <div className={`modal ${show ? 'show' : 'hide'}`} onClick={onClose}>
      <div className='modal-content' onClick={(e) => e.stopPropagation()}>
        {children}
        <div className='actions'>
          <a className='cta-button secondary' href='#' onClick={onClose}>
            Close
          </a>
        </div>
      </div>
    </div>
  );
}
function Help(props) {
  const [showWords, setShowWords] = useState(false);

  const toggleWords = (e) => {
    e.preventDefault();
    setShowWords(!showWords);
  };

  return (
    <Modal {...props}>
      <>
        <h2>How to Play</h2>
        <p>
          Kinderwordle is Wordle for kids! To help make guessing easier, you can
          choose to see the available words below.
        </p>
        <p>
          <a href='#' onClick={toggleWords}>
            {showWords ? 'Hide' : 'Show'} the word list
          </a>
          {showWords && (
            <div className='words'>
              {words.map((word, i) => (
                <div key={i}>{word}</div>
              ))}
            </div>
          )}
        </p>
        <p>Here are some example results:</p>
        <div className='row help'>
          <div className='tile small' data-state='correct'>
            H
          </div>
          <div className='tile small' data-state='tbd'>
            E
          </div>
          <div className='tile small' data-state='tbd'>
            L
          </div>
          <div className='tile small' data-state='tbd'>
            P
          </div>
        </div>
        <p>
          <b>H</b> is in the word in the correct spot.
        </p>
        <div className='row help'>
          <div className='tile small' data-state='tbd'>
            M
          </div>
          <div className='tile small' data-state='present'>
            A
          </div>
          <div className='tile small' data-state='tbd'>
            K
          </div>
          <div className='tile small' data-state='tbd'>
            E
          </div>
        </div>
        <p>
          <b>A</b> is in the word but not in the correct spot.
        </p>
        <div className='row help'>
          <div className='tile small' data-state='tbd'>
            B
          </div>
          <div className='tile small' data-state='tbd'>
            L
          </div>
          <div className='tile small' data-state='absent'>
            U
          </div>
          <div className='tile small' data-state='tbd'>
            E
          </div>
        </div>
        <p>
          <b>U</b> is not in the word.
        </p>
      </>
    </Modal>
  );
}

export default Help;
