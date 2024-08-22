import React from 'react';
import { Select, MenuItem, TextField, Stack, Grid, Typography, Box, Tooltip, IconButton } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CircularAddButton from '../components/CircularAddButton.tsx';

interface XORSelectionProps {
  gatewayData: { [key: string]: string[] };
  selectedGateway: string;
  setSelectedGateway: React.Dispatch<React.SetStateAction<string>>;
  probabilities: { [key: string]: string };
  setProbabilities: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleSave: () => void;
}

const XORSelection: React.FC<XORSelectionProps> = ({
  gatewayData,
  selectedGateway,
  setSelectedGateway,
  probabilities,
  setProbabilities,
  handleSave,
}) => {
  const handleGatewayChange = (e: SelectChangeEvent<string>) => {
    setSelectedGateway(e.target.value);
  };

  const handleProbabilityChange = (value: string, prob: string) => {
    setProbabilities((prevProbs) => ({
      ...prevProbs,
      [value]: prob,
    }));
  };

  const renderTitleWithTooltip = (title: string, tooltipText: string) => (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ marginBottom: 1 }}>
      <Typography variant="h6" fontWeight="bold">{title}</Typography>
      <Tooltip title={tooltipText} arrow>
        <IconButton size="small">
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <Stack spacing={2} className="input-section">
      {renderTitleWithTooltip("Gateway", "All XOR gateways of the BPMN/PetriNet entered on the previous page are shown here. This can be viewed in the image above. The XOR gateways are shown here in red, the AND gateways are shown in green and the various path options in blue. The XOR gateways are always named according to the previous activity occurring before the gateway: If no activity is present, NONE is entered.")}
      <Box sx={{ width: '100%' }}>
        <Select
          value={selectedGateway}
          onChange={handleGatewayChange}
          fullWidth
        >
          {Object.keys(gatewayData).map((gateway) => (
            <MenuItem key={gateway} value={gateway}>
              {gateway}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {renderTitleWithTooltip("Values and Probabilities", "Here you can specify the percentage of a path to be displayed in the event log. In total, a value of 100 percent must always be entered. The program automatically calculates an even distribution based on the number of different paths as a default.")}
      <Grid container spacing={1}> {/* Reduced spacing here */}
        {gatewayData[selectedGateway] && gatewayData[selectedGateway].map((value) => (
          <Grid item xs={12} key={value}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={2}>
                <Typography className="value">
                  {value}
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Box sx={{ width: '80%' }}>
                  <TextField
                    value={probabilities[value] || ''}
                    onChange={(e) => handleProbabilityChange(value, e.target.value)}
                    placeholder="%"
                    fullWidth
                    type="number"
                    InputProps={{ style: { fontSize: '1rem' } }}
                    inputProps={{ style: { padding: '7px' } }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>
      <Box textAlign="center" marginTop={4}>
        <CircularAddButton
          onClick={handleSave}
          disabled={Object.values(probabilities).reduce((acc, prob) => acc + parseFloat(prob || '0'), 0) !== 100}
        />
      </Box>
    </Stack>
  );
};

export default XORSelection;
