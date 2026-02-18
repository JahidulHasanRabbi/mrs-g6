"use client";

import SpinButton from "./SpinButton";

const SpinButtonsContainer = ({ onButtonClick }) => {
  return (
    <div className="flex justify-center items-center gap-4">
      <SpinButton 
        spins="10" 
        tokens="100" 
        onClick={() => onButtonClick({ spins: 10, tokens: 100 })}
      />
      <SpinButton 
        spins="50" 
        tokens="500" 
        onClick={() => onButtonClick({ spins: 50, tokens: 500 })}
      />
    </div>
  );
};

export default SpinButtonsContainer;
