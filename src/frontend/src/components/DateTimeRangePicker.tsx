import React, { useState, useEffect } from 'react';
import { TextField, Box, Grid } from '@mui/material';

interface DateTimeRangePickerProps {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  setStartDate: (date: string) => void;
  setStartTime: (time: string) => void;
  setEndDate: (date: string) => void;
  setEndTime: (time: string) => void;
}

const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  startDate,
  startTime,
  endDate,
  endTime,
  setStartDate,
  setStartTime,
  setEndDate,
  setEndTime,
}) => {
  const [startDateError, setStartDateError] = useState<string>('');
  const [startTimeError, setStartTimeError] = useState<string>('');
  const [endDateError, setEndDateError] = useState<string>('');
  const [endTimeError, setEndTimeError] = useState<string>('');

  useEffect(() => {
    validateAllFields();
  }, [startDate, startTime, endDate, endTime]);

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = event.target.value;
    if (validateTime(newStartTime)) {
      setStartTime(newStartTime);
      setStartTimeError('');
    } else {
      setStartTimeError('Invalid time');
    }
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = event.target.value;
    if (validateTime(newEndTime)) {
      setEndTime(newEndTime);
      setEndTimeError('');
    } else {
      setEndTimeError('Invalid time');
    }
  };

  const validateAllFields = () => {
    validateDateTimeRange();
    validateDateAndTimeConsistency();
  };

  const validateDateTimeRange = () => {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (endDateTime < startDateTime) {
      setEndDateError('End date and time cannot be before start date and time');
      setEndTimeError('End date and time cannot be before start date and time');
    } else {
      setEndDateError('');
      setEndTimeError('');
    }

    if (startDateTime > endDateTime) {
      setStartDateError('Start date and time must be before end date and time');
    } else {
      setStartDateError('');
    }
  };

  const validateDateAndTimeConsistency = () => {
    if (endDate && startDate && endDate < startDate) {
      setEndDateError('End date cannot be before start date');
    } else {
      setEndDateError('');
    }

    if (endTime && startTime && endTime < startTime && endDate === startDate) {
      setEndTimeError('End time cannot be before start time on the same day');
    } else {
      setEndTimeError('');
    }
  };

  const validateTime = (time: string): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    return (
      !isNaN(hours) && hours >= 0 && hours < 24 &&
      !isNaN(minutes) && minutes >= 0 && minutes < 60
    );
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            error={!!startDateError}
            helperText={startDateError}
          />
          <TextField
            label="Start Time"
            type="time"
            value={startTime}
            onChange={handleStartTimeChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ mt: 2 }}
            error={!!startTimeError}
            helperText={startTimeError}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            error={!!endDateError}
            helperText={endDateError}
          />
          <TextField
            label="End Time"
            type="time"
            value={endTime}
            onChange={handleEndTimeChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ mt: 2 }}
            error={!!endTimeError}
            helperText={endTimeError}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DateTimeRangePicker;
