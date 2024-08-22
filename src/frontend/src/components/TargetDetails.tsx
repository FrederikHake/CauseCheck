import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tooltip,
  IconButton,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; 
import { useStore } from '../store/globalStore';

export interface Event {
  type: string;
  activity: string;
  name: string;
  value: string;
  probability: string;
  days?: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
}

export interface TargetDetailsProps {
  targetName: string;
  setTargetName: React.Dispatch<React.SetStateAction<string>>;
  targetAttribute: string;
  handleTargetAttributeChange: (event: SelectChangeEvent<string>) => void;
  targetType: string;
  handleTargetTypeChange: (event: SelectChangeEvent<string>) => void;
  targetRelation: string;
  handleTargetRelationChange: (event: SelectChangeEvent<string>) => void;
  targetValue: string;
  setTargetValue: React.Dispatch<React.SetStateAction<string>>;
  targetYears: number;
  setTargetYears: React.Dispatch<React.SetStateAction<number>>;
  targetMonths: number;
  setTargetMonths: React.Dispatch<React.SetStateAction<number>>;
  targetDays: number;
  setTargetDays: React.Dispatch<React.SetStateAction<number>>;
  targetHours: number;
  setTargetHours: React.Dispatch<React.SetStateAction<number>>;
  targetMinutes: number;
  setTargetMinutes: React.Dispatch<React.SetStateAction<number>>;
  targetSeconds: number;
  setTargetSeconds: React.Dispatch<React.SetStateAction<number>>;
  targetProbability: string;
  handleTargetProbabilityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  targetSelectedEvent: string;
  setTargetSelectedEvent: React.Dispatch<React.SetStateAction<string>>;
  targetActivities: string[];
}

const TargetDetails: React.FC<TargetDetailsProps> = ({
  targetName,
  setTargetName,
  targetAttribute,
  handleTargetAttributeChange,
  targetType,
  handleTargetTypeChange,
  targetRelation,
  handleTargetRelationChange,
  targetValue,
  setTargetValue,
  targetYears,
  setTargetYears,
  targetMonths,
  setTargetMonths,
  targetDays,
  setTargetDays,
  targetHours,
  setTargetHours,
  targetMinutes,
  setTargetMinutes,
  targetSeconds,
  setTargetSeconds,
  targetProbability,
  handleTargetProbabilityChange,
  targetSelectedEvent,
  setTargetSelectedEvent,
  targetActivities,
}) => {
  const { traceAttributes, events } = useStore((state) => ({
    traceAttributes: state.traceAttributes,
    events: state.events,
  }));

  const uniqueCategories = Array.from(new Set(traceAttributes.map(attr => attr.category)));
  const noTracesDefined = traceAttributes.length === 0;
  const noEventsDefined = events.length === 0;

  const [internalType, setInternalType] = useState<string>(targetType || '');
  const [internalRelation, setInternalRelation] = useState(targetRelation);
  const prevAttributeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!targetAttribute) {
      handleTargetAttributeChange({ target: { value: 'Trace' } } as SelectChangeEvent<string>);
    }
  }, [targetAttribute, handleTargetAttributeChange]);

  useEffect(() => {
    if ((targetAttribute === 'Event' || targetAttribute === 'Previous events') && targetActivities.length > 0 && !targetSelectedEvent) {
      setTargetSelectedEvent(targetActivities[0]);
    }
  }, [targetActivities, targetSelectedEvent, setTargetSelectedEvent, targetAttribute]);

  useEffect(() => {
    if (prevAttributeRef.current !== targetAttribute || !internalType) {
      if (targetAttribute === 'Trace' && uniqueCategories.length > 0) {
        const initialType = uniqueCategories[0];
        setInternalType(initialType);
        handleTargetTypeChange({ target: { value: initialType } } as SelectChangeEvent<string>);
        const filteredAttributes = traceAttributes.filter(attr => attr.category === initialType);
        if (filteredAttributes.length > 0) {
          const firstName = filteredAttributes[0].name;
          setTargetName(firstName);
        }
      } else if (targetAttribute === 'Event' && events.length > 0) {
        const initialType = events[0].type;
        setInternalType(initialType);
        handleTargetTypeChange({ target: { value: initialType } } as SelectChangeEvent<string>);
        const filteredEvents = events.filter(event => event.type === initialType);
        if (filteredEvents.length > 0) {
          const firstName = filteredEvents[0].name;
          setTargetName(firstName);
        }
      }
      prevAttributeRef.current = targetAttribute;
    }
  }, [targetAttribute, uniqueCategories, events, handleTargetTypeChange, traceAttributes, setTargetName, internalType]);

  useEffect(() => {
    setInternalType(targetType);
  }, [targetType]);

  const onTypeChange = (event: SelectChangeEvent<string>) => {
    const newType = event.target.value;
    setInternalType(newType);
    handleTargetTypeChange(event);

    if (newType === 'Duration' || newType === 'Time') {
      setInternalRelation('=');
      handleTargetRelationChange({ target: { value: '=' } } as SelectChangeEvent<string>);
    }

    if (targetAttribute === 'Trace') {
      const filteredAttributes = traceAttributes.filter(attr => attr.category === newType);
      if (filteredAttributes.length > 0) {
        const firstName = filteredAttributes[0].name;
        setTargetName(firstName);
      }
    } else if (targetAttribute === 'Event') {
      const filteredEvents = events.filter(event => event.type === newType);
      if (filteredEvents.length > 0) {
        const firstName = filteredEvents[0].name;
        setTargetName(firstName);
      }
    }
  };

  const onNameChange = (event: SelectChangeEvent<string>) => {
    const newName = event.target.value;
    setTargetName(newName);
  };

  const onRelationChange = (event: SelectChangeEvent<string>) => {
    const newRelation = event.target.value;
    setInternalRelation(newRelation);
    handleTargetRelationChange(event);
  };

  const handleProbabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleTargetProbabilityChange(e); // No validation, allowing any input
  };

  const enforceMaxValue = (value: string, max: number) => {
    if (value === '' || parseFloat(value) < 0) return '';
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue > max) {
      return value.slice(0, -1);
    }
    return value;
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, setTemporaryValue: React.Dispatch<React.SetStateAction<string>>) => {
    if (e.target.value === '0') {
      setTemporaryValue('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, setValue: React.Dispatch<React.SetStateAction<number>>, setTemporaryValue: React.Dispatch<React.SetStateAction<string>>) => {
    if (e.target.value === '') {
      setValue(0);
      setTemporaryValue('0');
    } else {
      setValue(Number(e.target.value));
    }
  };

  const [temporaryTargetYears, setTemporaryTargetYears] = useState('0');
  const [temporaryTargetMonths, setTemporaryTargetMonths] = useState('0');
  const [temporaryTargetDays, setTemporaryTargetDays] = useState('0');
  const [temporaryTargetHours, setTemporaryTargetHours] = useState('0');
  const [temporaryTargetMinutes, setTemporaryTargetMinutes] = useState('0');
  const [temporaryTargetSeconds, setTemporaryTargetSeconds] = useState('0');

  const disableFields = targetAttribute === 'Trace' ? noTracesDefined : targetAttribute === 'Event' ? noEventsDefined : targetAttribute !== 'Previous events' && noEventsDefined;

  const filteredAttributes = targetAttribute === 'Trace'
    ? traceAttributes.filter(attr => attr.category === internalType)
    : targetAttribute === 'Event'
    ? events.filter(event => event.type === internalType)
    : [];

  const uniqueActivities = [...new Set(events.map(event => event.activity))];
  const uniqueNames = [...new Set(filteredAttributes.map(attr => attr.name))];

  const preventNonNumericInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9.]|\./.test(event.key) || (event.key === "." && event.currentTarget.value.includes("."))) {
      event.preventDefault();
    }
  };

  return (
    <Box sx={{
      border: '4px solid #ccc',  // Increased border width
      padding: 2,
      width: '100%',
      borderRadius: '8px'
    }} className="target-details-container">
      <Box display="flex" alignItems="center" justifyContent="center" marginBottom={2}>
        <Tooltip title="Here you can define the specific criteria when the deviation should occur. You can select either that the deviation should be applied to certain traces, certain events or when a previous event occured. You can further define the target of the deviation based on the already for traces or events defined types Categorical, Numerical, Time, Duration, Ressource. When targeting time-based metrics, you can set durations in years, months, days, hours, minutes, and seconds. Additionally, you can specify targets conditions, such as a value being greater or less than in a trace or event for non-ressource and non categorical types. Also you must set the probability of this condition being met. This defines to which extend the defined deviation details are applied to the defined target.">
          <IconButton>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h6" fontWeight="bold" className="section-subheader" sx={{ marginLeft: 1 }}>
          Define the target of the deviation
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={2} className="element-spacing">
        <FormControl fullWidth variant="outlined">
          <InputLabel id="attribute-type-label">Attribute</InputLabel>
          <Select labelId="attribute-type-label" value={targetAttribute} onChange={(e) => { handleTargetAttributeChange(e); setInternalType(''); setTargetName(''); }} label="Attribute">
            <MenuItem value="Trace">Trace</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
            <MenuItem value="Previous events">Previous events</MenuItem>
          </Select>
        </FormControl>
        {(targetAttribute === 'Event' || targetAttribute === 'Previous events') && (
          <FormControl fullWidth variant="outlined">
            <InputLabel id="event-selection-label" shrink>Activity Selection</InputLabel>
            <Select
              labelId="event-selection-label"
              value={targetSelectedEvent || (uniqueActivities.length > 0 ? uniqueActivities[0] : '')}
              onChange={(e) => setTargetSelectedEvent(e.target.value)}
              label="Event Selection"
            >
              {uniqueActivities.map((activity: string) => (
                <MenuItem key={activity} value={activity}>{activity}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {targetAttribute !== 'Previous events' && (
          <>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="type-label" shrink>Type</InputLabel>
              <Select
                labelId="type-label"
                value={disableFields ? '' : internalType}
                onChange={onTypeChange}
                label="Type"
                disabled={disableFields}
                inputProps={{ 'aria-label': 'Without label' }}
                notched
              >
                {targetAttribute === 'Event' ? (
                  [...new Set(events.map(event => event.type))].map((type: string) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))
                ) : (
                  uniqueCategories.map((option: string) => (
                    <MenuItem key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="name-label" shrink>Name</InputLabel>
              <Select
                labelId="name-label"
                value={disableFields ? '' : targetName}
                onChange={onNameChange}
                label="Name"
                disabled={disableFields}
                inputProps={{ 'aria-label': 'Without label' }}
                notched
              >
                {uniqueNames.map((name: string) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {internalType !== 'Categorical' && internalType !== 'Resource' && (
              <FormControl fullWidth variant="outlined">
                <InputLabel id="relation-label">Relation</InputLabel>
                <Select
                  labelId="relation-label"
                  value={internalRelation}
                  onChange={onRelationChange}
                  label="Relation"
                  disabled={disableFields}
                >
                  <MenuItem value="=">=</MenuItem>
                  <MenuItem value="!=">!=</MenuItem>
                  <MenuItem value=">=">&gt;=</MenuItem>
                  <MenuItem value="<=">&lt;=</MenuItem>
                  <MenuItem value="<">&lt;</MenuItem>
                  <MenuItem value=">">&gt;</MenuItem>
                </Select>
              </FormControl>
            )}
            {internalType !== 'Duration' && internalType !== 'Time' && (
              <TextField
                label="Value"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                fullWidth
                multiline
                InputLabelProps={{ shrink: true }}
                inputProps={{ style: { fontSize: '1rem' }, inputMode: "numeric" }}
                disabled={disableFields}
              />
            )}
          </>
        )}
        {(internalType !== 'Duration' && internalType !== 'Time') && (
             <TextField
             label="Probability"
             value={targetProbability}
             onChange={handleProbabilityChange}
             placeholder="%"
             fullWidth
             multiline
             InputLabelProps={{ shrink: true }}
             disabled={disableFields && targetAttribute !== 'Previous events'}
           />
        )}
      </Box>

      {(internalType === 'Duration' || internalType === 'Time') && (
        <Box display="flex" alignItems="center" gap={2} className="element-spacing" sx={{ marginTop: 2 }}>
          <TextField
            label="Years"
            type="number"
            value={temporaryTargetYears}
            onChange={(e) => {
              const value = enforceMaxValue(e.target.value, Number.MAX_SAFE_INTEGER);
              setTargetYears(Number(value));
              setTemporaryTargetYears(value);
            }}
            onFocus={(e) => handleFocus(e, setTemporaryTargetYears)}
            onBlur={(e) => handleBlur(e, setTargetYears, setTemporaryTargetYears)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { fontSize: '1rem' }, inputMode: "numeric" }}
            sx={{ maxWidth: '100px' }}
            disabled={disableFields}
            onKeyPress={preventNonNumericInput}
          />
          <TextField
            label="Months"
            type="number"
            value={temporaryTargetMonths}
            onChange={(e) => {
              const value = enforceMaxValue(e.target.value, 12);
              setTargetMonths(Number(value));
              setTemporaryTargetMonths(value);
            }}
            onFocus={(e) => handleFocus(e, setTemporaryTargetMonths)}
            onBlur={(e) => handleBlur(e, setTargetMonths, setTemporaryTargetMonths)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { fontSize: '1rem' }, inputMode: "numeric", min: 0, max: 12 }}
            sx={{ maxWidth: '100px' }}
            disabled={disableFields}
            onKeyPress={preventNonNumericInput}
          />
          <TextField
            label="Days"
            type="number"
            value={temporaryTargetDays}
            onChange={(e) => {
              const value = enforceMaxValue(e.target.value, 31);
              setTargetDays(Number(value));
              setTemporaryTargetDays(value);
            }}
            onFocus={(e) => handleFocus(e, setTemporaryTargetDays)}
            onBlur={(e) => handleBlur(e, setTargetDays, setTemporaryTargetDays)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { fontSize: '1rem' }, inputMode: "numeric", min: 0, max: 31 }}
            sx={{ maxWidth: '100px' }}
            disabled={disableFields}
            onKeyPress={preventNonNumericInput}
          />
          <TextField
            label="Hours"
            type="number"
            value={temporaryTargetHours}
            onChange={(e) => {
              const value = enforceMaxValue(e.target.value, 24);
              setTargetHours(Number(value));
              setTemporaryTargetHours(value);
            }}
            onFocus={(e) => handleFocus(e, setTemporaryTargetHours)}
            onBlur={(e) => handleBlur(e, setTargetHours, setTemporaryTargetHours)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { fontSize: '1rem' }, inputMode: "numeric", min: 0, max: 24 }}
            sx={{ maxWidth: '100px' }}
            disabled={disableFields}
            onKeyPress={preventNonNumericInput}
          />
          <TextField
            label="Minutes"
            type="number"
            value={temporaryTargetMinutes}
            onChange={(e) => {
              const value = enforceMaxValue(e.target.value, 60);
              setTargetMinutes(Number(value));
              setTemporaryTargetMinutes(value);
            }}
            onFocus={(e) => handleFocus(e, setTemporaryTargetMinutes)}
            onBlur={(e) => handleBlur(e, setTargetMinutes, setTemporaryTargetMinutes)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { fontSize: '1rem' }, inputMode: "numeric", min: 0, max: 60 }}
            sx={{ maxWidth: '100px' }}
            disabled={disableFields}
            onKeyPress={preventNonNumericInput}
          />
          <TextField
            label="Seconds"
            type="number"
            value={temporaryTargetSeconds}
            onChange={(e) => {
              const value = enforceMaxValue(e.target.value, 60);
              setTargetSeconds(Number(value));
              setTemporaryTargetSeconds(value);
            }}
            onFocus={(e) => handleFocus(e, setTemporaryTargetSeconds)}
            onBlur={(e) => handleBlur(e, setTargetSeconds, setTemporaryTargetSeconds)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { fontSize: '1rem' }, inputMode: "numeric", min: 0, max: 60 }}
            sx={{ maxWidth: '100px' }}
            disabled={disableFields}
            onKeyPress={preventNonNumericInput}
          />
          <TextField
            label="Probability"
            value={targetProbability}
            onChange={handleProbabilityChange}
            placeholder="%"
            fullWidth
            multiline
            InputLabelProps={{ shrink: true }}
            disabled={disableFields && targetAttribute !== 'Previous events'}
          />
        </Box>
      )}

      <Box mt={2}>
        {targetAttribute === 'Trace' && noTracesDefined && (
          <Typography color="error">No trace attributes available</Typography>
        )}
        {targetAttribute === 'Event' && noEventsDefined && (
          <Typography color="error">No events available</Typography>
        )}
      </Box>
    </Box>
  );
};

export default TargetDetails;
