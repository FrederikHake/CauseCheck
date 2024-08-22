import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import ActivityAttributes from '../components/ActivityAttributes'; // Adjust the import path as needed
import { Snackbar, Alert, Box, CircularProgress} from '@mui/material';
import { useMutation } from 'react-query';
import { axiosInstance } from '../queryClient'; // Make sure to have axiosInstance setup in queryClient.js

const ActivityAttributesView: React.FC = () => {
  const [canProceed, setCanProceed] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [activities, setActivities] = useState<string[]>([]);

  const handleCanProceedChange = (canProceed: boolean, validationMessage: string) => {
    setCanProceed(canProceed);
    if (!canProceed) {
      setSnackbarMessage(validationMessage);
    }
  };

  const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const { mutate: fetchActivities, isLoading } = useMutation('fetchActivities', async () => {
    const response = await axiosInstance.get('/get_transitions', { withCredentials: true });
    if (response.status !== 200) {
      throw new Error('Error fetching activities');
    }
    setActivities(response.data); // Assuming response.data is an array of activity names
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleNextButtonClick = () => {
    if (!canProceed) {
      setSnackbarOpen(true);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <PageWrapper
        title="Please define the attributes of the events"
        prevPath="/gateways"
        nextPath="/validations"
        nextButtonDisabled={!canProceed}
        onNextButtonClick={handleNextButtonClick}
        isSpecialPage={true} // Indicate this is the special page
      >
        <ActivityAttributes
          setCanProceed={handleCanProceedChange}
          activities={activities}
        />

      </PageWrapper>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ActivityAttributesView;

