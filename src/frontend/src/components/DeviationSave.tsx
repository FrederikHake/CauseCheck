import React from 'react';
import { Box, Typography } from '@mui/material';
import RemoveButton from './RemoveButton';
import { Deviation } from '../store/globalStore';

interface DeviationSaveProps {
  savedDeviations: Deviation[];
  handleDelete: (name: string, index: number) => void;
  getIconForDeviation: (type: string) => React.ReactNode;
}

const DeviationSave: React.FC<DeviationSaveProps> = ({ savedDeviations, handleDelete, getIconForDeviation }) => {
  const groupedDeviations = savedDeviations.reduce((acc, deviation) => {
    if (!acc[deviation.name]) {
      acc[deviation.name] = [];
    }
    acc[deviation.name].push(deviation);
    return acc;
  }, {} as { [key: string]: Deviation[] });

  return (
    <Box>
      {Object.keys(groupedDeviations).map((name) => (
        <Box key={name} sx={{ bgcolor: '#d3d3d3', borderRadius: 2, p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center">
            {getIconForDeviation(groupedDeviations[name][0].deviationType)}
            <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>{groupedDeviations[name][0].deviationType}</Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>Name: {name}</Typography>
            {groupedDeviations[name][0].deviationType === 'skip' && (
              <>
              <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>Activity to skip: {groupedDeviations[name][0].activity}</Typography>
              </>
            )}
            {groupedDeviations[name][0].deviationType === 'insert' && (
              <>
              <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>Activity to be inserted: {groupedDeviations[name][0].activity}</Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>Repeat Count: {groupedDeviations[name][0].repeatCount}</Typography>
              </>
            )}
            {groupedDeviations[name][0].deviationType === 'repetition' && (
              <>
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>What should be repeated: {groupedDeviations[name][0].activity}</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>Should be repeated after: {groupedDeviations[name][0].repeatAfter}</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>Repeat Count: {groupedDeviations[name][0].repeatCount}</Typography>
              </>
            )}
            {groupedDeviations[name][0].deviationType === 'replacement' && (
              <>
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>Activity to replace: {groupedDeviations[name][0].activity}</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>Replace with: {groupedDeviations[name][0].replaceWith}</Typography>
                              </>
            )}
            {groupedDeviations[name][0].deviationType === 'swap' && (
              <>
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>Value A: {groupedDeviations[name][0].valueA}</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>Value B: {groupedDeviations[name][0].valueB}</Typography>
                    </>
            )}
          </Box>
          {groupedDeviations[name].map((deviation, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                bgcolor: '#e0e0e0', 
                borderRadius: 2, 
                p: 2, 
                mb: 1, 
              }}
            >
              {deviation.targetAttribute === 'Previous events' ? (
                <>
                  <Typography sx={{ mr: 2 }}>Attribute: {deviation.targetAttribute}</Typography>
                  {deviation.selectedEvent && (
                    <Typography sx={{ mr: 2 }}>Activity selection: {deviation.selectedEvent}</Typography>
                  )}
                  <Typography sx={{ mr: 2 }}>Probability: {deviation.targetProbability}%</Typography>
                </>
              ) : (
                <>
                  <Typography sx={{ mr: 2 }}>Attribute: {deviation.targetAttribute}</Typography>
                  {deviation.selectedEvent && (
                    <Typography sx={{ mr: 2 }}>Activity selection: {deviation.selectedEvent}</Typography>
                  )}
                  <Typography sx={{ mr: 2 }}>Type: {deviation.targetType}</Typography>
                  <Typography sx={{ mr: 2 }}>Name: {deviation.targetName}</Typography>
                  <Typography sx={{ mr: 2 }}>Relation: {deviation.targetRelation || '='}</Typography>
                  {deviation.targetType === 'Duration' || deviation.targetType === 'Time' ? (
                    <>
                      <Typography sx={{ mr: 2 }}>Years: {deviation.targetYears}</Typography>
                      <Typography sx={{ mr: 2 }}>Months: {deviation.targetMonths}</Typography>
                      <Typography sx={{ mr: 2 }}>Days: {deviation.targetDays}</Typography>
                      <Typography sx={{ mr: 2 }}>Hours: {deviation.targetHours}</Typography>
                      <Typography sx={{ mr: 2 }}>Minutes: {deviation.targetMinutes}</Typography>
                      <Typography sx={{ mr: 2 }}>Seconds: {deviation.targetSeconds}</Typography>
                    </>
                  ) : (
                    <Typography sx={{ mr: 2 }}>Value: {deviation.targetValue}</Typography>
                  )}
                  <Typography sx={{ mr: 2 }}>Probability: {deviation.targetProbability}%</Typography>
                </>
              )}
              <RemoveButton onClick={() => handleDelete(name, index)} />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default DeviationSave;
