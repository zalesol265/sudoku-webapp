import React, { useState, useEffect } from 'react';
import './Hints.css';

const Hints = ({ candidates }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    if (candidates.length > 0) {
      setActiveIndex(0); // Automatically open "Naked Singles" when candidates are updated
    }
  }, [candidates]);

  return (
    <div className="hints">
      <div className="accordion-item">
        <button onClick={() => toggleAccordion(0)} className="accordion-title">
          Naked Singles
        </button>
        {activeIndex === 0 && (
          <div className="accordion-content">
            {candidates.map((box, index) => (
              <div key={index} className="box-candidates">
                <h4>Box {(box.box_row * 3) + (box.box_col + 1)}</h4>
                {Object.entries(box.candidates).map(([cellKey, cell], cellIndex) => (
                  <p key={cellIndex}>
                    Cell {(((cell.row) % 3) * 3) + ((cell.col % 3) + 1)}: [{Array.isArray(cell.candidates) ? cell.candidates.join(', ') : ''}]
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="accordion-item">
        <button onClick={() => toggleAccordion(1)} className="accordion-title">
          Snyder Notation
        </button>
        {activeIndex === 1 && (
          <div className="accordion-content">
            <p>Snyder Notation content goes here...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hints;
