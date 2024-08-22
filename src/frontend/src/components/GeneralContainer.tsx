import React, { ReactNode } from 'react';
import { Stack, StackProps, Typography } from '@mui/material';

interface GeneralContainerProps extends StackProps {
  customTitle: ReactNode; // Use customTitle to avoid conflicts
}

const GeneralContainer: React.FC<GeneralContainerProps> = ({ customTitle, children, ...rest }) => {
  return (
    <Stack
      sx={{
        border: '4px solid #ccc',  // Increased border width
        padding: 2,
        width: '100%',
        borderRadius: '8px'
      }}
      spacing={2}
      alignItems={'center'}
      {...rest}
    >
      {typeof customTitle === 'string' ? (
        <Typography variant="h6" style={{ fontWeight: 'bold' }}>
          {customTitle}
        </Typography>
      ) : (
        customTitle
      )}
      {children}
    </Stack>
  );
};

export default GeneralContainer;
