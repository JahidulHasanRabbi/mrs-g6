"use client";

import SpinButton from "./SpinButton";

const SpinButtonsContainer = ({ buttons, onButtonClick }) => {
  return (
    <div className="flex justify-center items-center gap-4">
      {buttons.map((button, index) => (
        <SpinButton 
          key={index}
          spins={button.spins}
          tokens={button.tokens}
          image={button.image}
          className={button.className}
          onClick={() => onButtonClick(button)}
        />
      ))}
    </div>
  );
};

export default SpinButtonsContainer;
