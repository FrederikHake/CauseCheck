import React from 'react';
import { Stack, Typography, Box, Tooltip, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface XORToEnterProps {
  gatewayData: { [key: string]: string[] };
  completedGateways: { [key: string]: boolean };
  handleGatewayClick: (gateway: string) => void;
}

const XORToEnter: React.FC<XORToEnterProps> = ({ gatewayData, completedGateways, handleGatewayClick }) => {
  const renderTitleWithTooltip = (title: string, tooltipText: string) => (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="h6" fontWeight="bold">{title}</Typography>
      <Tooltip title={tooltipText} arrow>
        <IconButton size="small">
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <Stack spacing={2} className="status-section" sx={{ width: '100%' }}>
      {renderTitleWithTooltip("Gateways to define", "All gateways must be entered to get to the next page. Here you can check which gateways still need to be defined. If a gateway is still outstanding, a red X is displayed. In addition, the probabilities already entered can be called up by clicking on the individual gateways.")}
      {Object.keys(gatewayData).map((gateway, index) => (
        <Box
          key={index}
          onClick={() => handleGatewayClick(gateway)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: completedGateways[gateway] ? 'pointer' : 'default',
          }}
        >
          <Typography sx={{ flex: 1, textAlign: 'left', whiteSpace: 'pre-wrap' }}>{gateway}</Typography>
          {completedGateways[gateway] ? (
            <CheckIcon color="success" />
          ) : (
            <CloseIcon sx={{ color: 'red' }} />
          )}
        </Box>
      ))}
    </Stack>
  );
};

export default XORToEnter;
