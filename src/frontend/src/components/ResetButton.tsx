import { IconButton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from '../store/globalStore'; // Adjust the import path accordingly

const ResetButton: React.FC = () => {
  const resetStore = useStore((state) => state.resetStore);
  const navigate = useNavigate();

  const handleClick = () => {
    resetStore();
    navigate('/');
  };

  return (
    <IconButton
      aria-label="reset"
      color="primary"
      onClick={handleClick}
      sx={{
        width: '100px',  // Adjusted width to double size
        height: '100px', // Adjusted height to double size
        borderRadius: '50%',
      }}
    >
      <FontAwesomeIcon icon={faRotateRight} style={{ fontSize: '32px' }} /> {/* Adjusted icon size */}
    </IconButton>
  );
};

export default ResetButton;
