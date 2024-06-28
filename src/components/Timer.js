import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassStart, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import './Timer.css';

const Timer = () => {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerCommenced, setTimerCommenced] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null); // State to hold the interval ID

  const startTimer = () => {
    if (!timerRunning) {
      setTimerCommenced(true); // Mark the timer as commenced
      setTimerRunning(true);
      const intervalId = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
      setTimerInterval(intervalId); // Save the interval ID to state
    } else {
      clearInterval(timerInterval); // Clear interval if timer is already running
      setTimerInterval(null); // Clear the saved interval ID from state
      setTimeElapsed(0);
      setTimerRunning(false);
      setTimerCommenced(false);
    }
  };

  const pauseTimer = () => {
    if (timerRunning) {
      clearInterval(timerInterval); // Clear interval when pausing
      setTimerRunning(false);
    }
  };

  const unpauseTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      const intervalId = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
      setTimerInterval(intervalId);
    }
  };

  return (
    <div className="timer-and-buttons">
      <div className="left-controls">
        <button className="timer" onClick={startTimer}>
          <FontAwesomeIcon icon={faHourglassStart} />
        </button>
        {timerCommenced && (
          <div className="timer">Time Elapsed: {timeElapsed} seconds</div>
        )}
      </div>
      <div className="right-controls">
        {timerCommenced && timerRunning && (
          <button onClick={pauseTimer}>
            <FontAwesomeIcon icon={faPause} />
          </button>
        )}
                {timerCommenced && !timerRunning && (
          <button onClick={unpauseTimer}>
            <FontAwesomeIcon icon={faPlay} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Timer;
