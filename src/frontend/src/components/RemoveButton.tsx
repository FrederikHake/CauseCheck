import {  IconButton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import React, { MouseEvent } from "react";

interface RemoveButtonProps {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

const RemoveButton: React.FC<RemoveButtonProps> = ({ onClick }) => {
  return (
    <IconButton
      aria-label="add"
      color="primary"
      onClick={onClick}
      sx={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
      }}
    >
      <FontAwesomeIcon icon={faTrash} style={{ marginRight: '5px' }} />
    </IconButton>
  );
};

export default RemoveButton;

