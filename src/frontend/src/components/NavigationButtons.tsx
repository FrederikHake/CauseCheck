import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { faStepBackward, faStepForward } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface NavigationButtonsProps {
  nextPath?: string;
  prevPath?: string;
  nextButtonDisabled?: boolean;
  onNextButtonClick?: () => void;
  isSpecialPage?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  nextPath,
  prevPath,
  nextButtonDisabled,
  onNextButtonClick,
  isSpecialPage
}) => {
  const navigate = useNavigate();

  const handleNextClick = async (nextPath: string) => {
    if (nextButtonDisabled && onNextButtonClick) {
      onNextButtonClick();
    } else if (onNextButtonClick) {
      onNextButtonClick();
      return navigate(nextPath);
    } else {
      return navigate(nextPath);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '2rem', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      padding: '0 2rem', 
      display: 'flex', 
      alignItems: 'center',
      gap: '16rem' // Adjust the space between buttons
    }}>
      <Button
        variant="contained"
        style={{ visibility: prevPath ? 'visible' : 'hidden', width: '4rem', height: '2rem' }}
        onClick={() => prevPath && navigate(prevPath)}
      >
        <FontAwesomeIcon icon={faStepBackward} />
      </Button>

      <Button
        variant="contained"
        style={{
          visibility: nextPath ? 'visible' : 'hidden',
          backgroundColor: nextButtonDisabled && isSpecialPage ? 'grey' : '',
          width: '4rem', height: '2rem' // Ensure the button occupies space
        }}
        onClick={() => nextPath && handleNextClick(nextPath)}
        disabled={!isSpecialPage && nextButtonDisabled}
      >
        <FontAwesomeIcon icon={faStepForward} />
      </Button>
    </div>
  );
};

export default NavigationButtons;
