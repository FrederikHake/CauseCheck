import React, { MouseEvent } from 'react';
import { IconButton } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface CircularButtonProps {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const CircularAddButton: React.FC<CircularButtonProps> = ({ onClick, disabled }) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick(event);
  };

  return (
    <IconButton
      aria-label="add"
      color="primary"
      onClick={handleClick}
      sx={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        opacity: disabled ? 0.5 : 1,  // Style to look disabled
        pointerEvents: 'all',  // Always allow clicks
      }}
    >
      <FontAwesomeIcon icon={faPlus} />
    </IconButton>
  );
};

export default CircularAddButton;
