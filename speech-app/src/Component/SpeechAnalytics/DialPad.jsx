import React, { useState } from 'react';
import './DialPad.css';
import '../../phone/KeypadButton.css'
import { Backspace, PhoneOutlined } from '@material-ui/icons';

const DialPad = ({ onDial, onClose }) => {
  const [inputNumber, setInputNumber] = useState('');

  const handleKeyPress = (key) => {
    setInputNumber((prevNumber) => prevNumber + key);
  };

  const handleDelete = () => {
    setInputNumber((prevNumber) => prevNumber.slice(0, -1));
  };

  const handleCall = () => {
    onDial(inputNumber);
    setInputNumber('');
  };

  return (
    <div className="dial-pad">
      <div className="dial-display">
        <input type="text" value={inputNumber} readOnly />
      </div>
      <div className="dial-buttons">
        <div className="dial-row">
          <button className={`keypad-button`} onClick={() => handleKeyPress('1')}>1</button>
          <button className={`keypad-button`} onClick={() => handleKeyPress('4')}>4</button>
          <button className={`keypad-button`} onClick={() => handleKeyPress('7')}>7 </button>
        </div>
        <div className="dial-row">
          <button className={`keypad-button`} onClick={() => handleKeyPress('2')}>2 </button>
          <button className={`keypad-button`} onClick={() => handleKeyPress('5')}>5 </button>
          <button className={`keypad-button`} onClick={() => handleKeyPress('8')}>8 </button>
        </div>
        <div className="dial-row">
          <button className={`keypad-button`} onClick={() => handleKeyPress('3')}>3 </button>
          <button className={`keypad-button`} onClick={() => handleKeyPress('6')}>6</button>
          <button className={`keypad-button`} onClick={() => handleKeyPress('9')}>9 </button>
        </div>
        <div className="dial-row">
          <button className={`keypad-button`} onClick={() => handleKeyPress('*')}>*</button>
        </div>
        <div className="dial-row">
          <button className={`keypad-button`} onClick={() => handleKeyPress('0')}>0</button>
        </div>
        <div className="dial-row">
        <button className={`keypad-button`} onClick={() => handleKeyPress('#')}>#</button>
        </div>
        <div className="dial-row">
        <button className={`keypad-button`} onClick={handleDelete}>
         <Backspace />
        </button>
        </div>
        <div className="dial-row">
        <button className="call-button" onClick={handleCall}>
          <PhoneOutlined />
        </button>
        </div>

      </div>
      <button className="close-button" onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default DialPad;
