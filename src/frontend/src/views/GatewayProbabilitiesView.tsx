import React, { useState, useEffect } from 'react';
import { Container, Box, Grid, CircularProgress, Divider, Snackbar, Alert } from '@mui/material';
import PNMLVisualization from '../components/PNMLVisualization';
import XORSelection from '../components/XORSelection';
import XORToEnter from '../components/XORToEnter';
import PageWrapper from '../components/PageWrapper';
import { useStore } from '../store/globalStore';
import { useMutation } from 'react-query';
import { axiosInstance } from '../queryClient';

type GatewayData = {
  [key: string]: string[];
};

type Probabilities = {
  [key: string]: string;
};

const GatewayProbabilitiesView: React.FC = () => {
  const [gatewayData, setGatewayData] = useState<GatewayData>({});
  const { savedProbabilities, addGatewayProbability, updateGatewayProbability, cases, completedGateways, setCompletedGateway } = useStore();
  const [isGatewayLoaded, setIsGatewayLoaded] = useState<boolean>(false);
  const { isTimeLoaded, setIsTimeLoaded } = useStore();
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [probabilities, setProbabilities] = useState<Probabilities>({});
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  const { mutate: fetchTransitions, isLoading } = useMutation('fetchTransitions', async () => {
    setIsGatewayLoaded(false);
    const response = await axiosInstance.get('/logic_gate', { withCredentials: true });
    if (response.status !== 200) {
      throw new Error('Error fetching transitions');
    }

    // Sorting the gatewayData keys
    const sortedGatewayData = Object.keys(response.data)
      .sort((a, b) => {
        const numA = parseInt(a.split(' ')[1]);
        const numB = parseInt(b.split(' ')[1]);
        return numA - numB;
      })
      .reduce<GatewayData>((acc, key) => {
        acc[key] = response.data[key];
        return acc;
      }, {});

    setGatewayData(sortedGatewayData);
    setSelectedGateway(Object.keys(sortedGatewayData)[0]);
    setIsGatewayLoaded(true);
  });

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isGatewayLoaded) {
      return;
    }
    if (Object.keys(gatewayData).length === 0) {
      return;
    }
    if (savedProbabilities[selectedGateway]) {
      setProbabilities(savedProbabilities[selectedGateway]);
    } else {
      const values = gatewayData[selectedGateway];
      const numValues = values.length;
      const defaultProbability = (100 / numValues).toFixed(2);
      const totalProbability = (parseFloat(defaultProbability) * (numValues - 1)).toFixed(2);
      const lastProbability = (100 - parseFloat(totalProbability)).toFixed(2);
      const defaultProbabilities = values.reduce<Probabilities>((acc, value, index) => {
        acc[value] = index === numValues - 1 ? lastProbability : defaultProbability;
        return acc;
      }, {});

      setProbabilities(defaultProbabilities);
    }
  }, [selectedGateway, savedProbabilities, gatewayData]);


  const { mutate: handleNextButton } = useMutation('fetchTransitions', async (number: number) => {
    const gatewayDecisions = Object.entries(savedProbabilities).map(([gateway, values]) => {
      const decisions = Object.entries(values).map(([index, value]) => ({
        probability: parseFloat(value) / 100,
        index: parseInt(index),
      }));
  
      return {
        name: gateway,
        decisions: decisions,
      };
    });
  
    const data = Object.keys(gatewayData).length !== 0
      ? { logic_gates: gatewayDecisions }
      : { count: number };

    const response = await axiosInstance.post('/set_logic_gate_decision', data, { withCredentials: true });
    if (response.status !== 200) {
      throw new Error('Error setting logic gate decision');
    }
    console.log("Logic gate decision set successfully");
  });

  useEffect(() => {
    if(isTimeLoaded){
      fetchTransitions();
    }
  }, [isTimeLoaded]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isGatewayLoaded) {
      return;
    }
    if (Object.keys(gatewayData).length === 0) {
      return;
    }
    if (savedProbabilities[selectedGateway]) {
      setProbabilities(savedProbabilities[selectedGateway]);
    } else {
      const values = gatewayData[selectedGateway];
      const numValues = values.length;
      const defaultProbability = (100 / numValues).toFixed(2);
      const totalProbability = (parseFloat(defaultProbability) * (numValues - 1)).toFixed(2);
      const lastProbability = (100 - parseFloat(totalProbability)).toFixed(2);

      if (Object.keys(gatewayData).length !== 0) {
        const defaultProbabilities = values.reduce<Probabilities>((acc, value, index) => {
          acc[value] = index === numValues - 1 ? lastProbability : defaultProbability;
          return acc;
        }, {});
        setProbabilities(defaultProbabilities);
      }
    }
  }, [selectedGateway, savedProbabilities, gatewayData]);

  const handleSave = () => {
    const total = Object.values(probabilities).reduce((acc, prob) => acc + parseFloat(prob || '0'), 0);
    if (total !== 100) {
      setSnackbarMessage('The total percentage must be 100%.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setCompletedGateway(selectedGateway, true);
    if (savedProbabilities[selectedGateway]) {
      updateGatewayProbability(selectedGateway, probabilities);
    } else {
      addGatewayProbability(selectedGateway, probabilities);
    }
    setSnackbarMessage('Probabilities saved successfully.');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleGatewayClick = (gateway: string) => {
    setSelectedGateway(gateway);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    ); // Render loading icon while data is being fetched
  }

  const allGatewaysCompleted = Object.keys(gatewayData).every(key => completedGateways[key]);
  const handleNext = () => {
    handleNextButton(parseInt(cases));
  };

  return (
    <PageWrapper
      title="Please define the XOR-Gateway probabilities"
      prevPath="/"
      nextPath="/activity-attributes"
      nextButtonDisabled={!allGatewaysCompleted}
      onNextButtonClick={handleNext}
    >
      <Container maxWidth="xl" className="container">
        <Box display="flex" justifyContent="center" marginBottom={6}>
          <PNMLVisualization isLoaded={isGatewayLoaded.valueOf()} />
        </Box>
        <Grid container spacing={2} justifyContent="center" alignItems="center" className="main-content">
          <Grid item xs={12} sm={11} md={10} lg={9}>
            <Grid container spacing={2}>
              <Grid item xs={6}> {/* Increased width */}
                <XORSelection
                  gatewayData={gatewayData}
                  selectedGateway={selectedGateway}
                  setSelectedGateway={setSelectedGateway}
                  probabilities={probabilities}
                  setProbabilities={setProbabilities}
                  handleSave={handleSave}
                />
              </Grid>
              <Grid item xs={1}>
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Divider 
                    orientation="vertical" 
                    sx={{
                      height: '100%', 
                      borderWidth: '1.5px', 
                      borderColor: '#ccc' 
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={5}> {/* Increased width */}
                <XORToEnter
                  gatewayData={gatewayData}
                  completedGateways={completedGateways}
                  handleGatewayClick={handleGatewayClick}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default GatewayProbabilitiesView;
