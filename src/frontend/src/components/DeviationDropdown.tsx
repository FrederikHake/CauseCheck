import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem, SelectChangeEvent, Tooltip, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface DeviationDropdownProps {
  deviationType: string;
  handleDeviationChange: (event: SelectChangeEvent<string>) => void;
}

const getTooltipTitle = (deviationType: string) => {
  switch (deviationType) {
    case 'skip':
      return 'Skip: An activity will be skipped in the traces, meaning an in the process modell defined event will not occur.';
    case 'insert':
      return 'Insert: An additional activity will be inserted to the traces which was not defined in the BPMN/PetriNet.';
    case 'repetition':
      return 'Repetition: An activity will be repeated frequently in the traces.';
    case 'replacement':
      return 'Replacement: An activity will be substituted with a different one, in the traces, changing the process flow.';
    case 'swap':
      return 'Swap: The order of two activities will be reversed, leading to a different sequence of steps in the process.';
    default:
      return 'Please select a deviation type to see its description.';
  }
};


const DeviationDropdown: React.FC<DeviationDropdownProps> = ({ deviationType, handleDeviationChange }) => {
  return (
    <Box display="flex" alignItems="center" className="deviation-dropdown-container">
      <Tooltip title={getTooltipTitle(deviationType)} placement="right" arrow>
        <IconButton>
          <HelpOutlineIcon />
        </IconButton>
      </Tooltip>
      <Typography variant="h6" fontWeight="bold" style={{ marginRight: '16px' }}>Deviations Type</Typography>
      <FormControl variant="outlined">
        <Select
          value={deviationType || 'intro'}
          onChange={handleDeviationChange}
        >
          <MenuItem value="intro">Please select</MenuItem>
          <MenuItem value="skip">Skip</MenuItem>
          <MenuItem value="insert">Insert</MenuItem>
          <MenuItem value="repetition">Repetition</MenuItem>
          <MenuItem value="replacement">Replacement</MenuItem>
          <MenuItem value="swap">Swap</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default DeviationDropdown;
