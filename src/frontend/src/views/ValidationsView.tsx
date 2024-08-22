import React from 'react';
import PageWrapper from '../components/PageWrapper';
import ActivitySummary from '../components/ActivitySummary';

import { useStore, Event as GlobalEvent } from '../store/globalStore';

import { useMutation } from 'react-query';
import { axiosInstance } from '../queryClient';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';

const ValidationsView: React.FC = () => {
  const events = useStore(state => state.events) as GlobalEvent[];
  const navigate = useNavigate();

  const formatAttributes = (events: GlobalEvent[]) => {
    const transitions: Record<string, any> = {};

    events.forEach(event => {
      const { activity, type,name, probability, value, days, hours, minutes, seconds } = event;

      if (!transitions[activity]) {
        transitions[activity] = {
          transition_name: activity,
          attributes: [] as [string, string, unknown[]][]
        };
      }

      let valuesArray =  {
        type: 'string',
        name: 'string',
        values: [] as unknown[]
      };
      const existingAttribute = transitions[activity]?.attributes.find((attr: { name: string; }) => attr.name === name);
      if (existingAttribute) {
        valuesArray = existingAttribute;

      } else {
        valuesArray['values'] = [];
        if (type === 'Resource') {
          valuesArray['type'] = 'string';
  
        }
        if (type === 'Categorical') {
          valuesArray['type'] = 'string';
        }
        if (type === 'Numerical') {
          valuesArray['type'] = 'numerical';
        }
        if(type === 'Time') {
          valuesArray['type'] = 'temporal';
        }
        if(type === 'Duration') { 
          valuesArray['type'] = 'temporal';
        }
        valuesArray['name'] = name;

      }
      if (type === 'Resource' || type === 'Categorical' || type === 'Numerical') {
        console.log(valuesArray);
        valuesArray['values'].push([(value ?? '<null>').toString(), parseFloat(probability) / 100]);
      } else if (type === 'Time' || type === 'Duration') {
        const duration = (parseInt(days || '0') * 24 * 60 * 60) + (parseInt(hours || '0') * 60 * 60) + (parseInt(minutes || '0') * 60) + parseInt(seconds || '0');
        valuesArray['values'].push([new Date(duration * 1000).toISOString(), parseFloat(probability) / 100]);
      }
      
      if (existingAttribute) {

        existingAttribute['values'] = valuesArray['values'];
      } else {

        transitions[activity].attributes.push({name: name,type: valuesArray['type'],values: valuesArray['values']});
      }
    });

    return { transitions: Object.values(transitions) };
  };

  const { mutate: setTraceAttributes, isLoading, error } = useMutation(async () => {
    const formattedAttributes = formatAttributes(events);
    const response = await axiosInstance.post('/set_transition_attributes', formattedAttributes, { withCredentials: true });

    if (response.status !== 201) {
      throw new Error('Error setting transition attributes');
    }
    return response.data;
  }, {
    onSuccess: () => {
      navigate('/trace-attributes');
    }
  });

  const handleNextButtonClick = () => {
    setTraceAttributes();
  };

  return (
    <PageWrapper
      title="Please check your entered values"
      prevPath="/activity-attributes"
      nextPath="/trace-attributes"
      nextButtonDisabled={isLoading}
      onNextButtonClick={handleNextButtonClick}
    >
      <ActivitySummary events={events} />
      {isLoading && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      )}
      {error instanceof Error && (
        <Box mt={2}>
          <Alert severity="error">
            {error.message || 'An unknown error occurred'}
          </Alert>
        </Box>
      )}
    </PageWrapper>
  );
};

export default ValidationsView;













