import React from 'react';
import { Stack, Typography } from '@mui/material';
import NavigationButtons from './NavigationButtons';

interface PageWrapperProps {
  title: string;
  nextPath?: string;
  prevPath?: string;
  children: React.ReactNode;
  nextButtonDisabled?: boolean;
  onNextButtonClick?: () => void;
  isSpecialPage?: boolean;
  leftButton?: React.ReactNode;  // Prop for the button
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  title,
  nextPath,
  prevPath,
  children,
  nextButtonDisabled,
  onNextButtonClick,
  isSpecialPage,
  leftButton,  // Destructure the leftButton prop
}) => {
  return (
    <div style={{ position: 'relative' }}>
      <Stack
        spacing={2}
        alignItems="center"
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingBottom: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', position: 'relative' }}>
          <Typography variant="h5" style={{ marginTop: '20px', fontWeight: 'bold'}}>
            {title}
          </Typography>
          {leftButton && (
            <div style={{ marginLeft: '10px', alignSelf: 'flex-end', marginBottom: '-4px' }}>  {/* Adjust the margin as needed */}
              {leftButton}
            </div>
          )}
        </div>
        <div style={{ flexGrow: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {children}
        </div>
      </Stack>

      <NavigationButtons
        nextPath={nextPath}
        prevPath={prevPath}
        nextButtonDisabled={nextButtonDisabled}
        onNextButtonClick={onNextButtonClick}
        isSpecialPage={isSpecialPage}
      />
    </div>
  );
};

export default PageWrapper;






