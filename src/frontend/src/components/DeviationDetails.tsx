import React, { useEffect, useMemo, useState } from 'react';
import { Box, FormControl, FormControlLabel, Tooltip, IconButton, InputLabel, Select, MenuItem, Switch, TextField, Typography, SelectChangeEvent, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import RemoveButton from './RemoveButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface DeviationDetailsProps {
  deviationType: string;
  sequenceNames: string[][];
  nonSequenceActivities: string[];
  activity: string;
  setActivity: React.Dispatch<React.SetStateAction<string>>;
  isSequenceActivity: boolean;
  setIsSequenceActivity: React.Dispatch<React.SetStateAction<boolean>>;
  activitySequence: string[];
  setActivitySequence: React.Dispatch<React.SetStateAction<string[]>>;
  repeatCount: number;
  setRepeatCount: React.Dispatch<React.SetStateAction<number>>;
  repeatAfter: string;
  setRepeatAfter: React.Dispatch<React.SetStateAction<string>>;
  isSequenceRepeatAfter: boolean;
  setIsSequenceRepeatAfter: React.Dispatch<React.SetStateAction<boolean>>;
  repeatAfterSequence: string[];
  setRepeatAfterSequence: React.Dispatch<React.SetStateAction<string[]>>;
  replaceWith: string;
  setReplaceWith: React.Dispatch<React.SetStateAction<string>>;
  isSequenceReplaceWith: boolean;
  setIsSequenceReplaceWith: React.Dispatch<React.SetStateAction<boolean>>;
  replaceWithSequence: string[];
  setReplaceWithSequence: React.Dispatch<React.SetStateAction<string[]>>;
  valueA: string;
  setValueA: React.Dispatch<React.SetStateAction<string>>;
  isSequenceValueA: boolean;
  setIsSequenceValueA: React.Dispatch<React.SetStateAction<boolean>>;
  valueASequence: string[];
  setValueASequence: React.Dispatch<React.SetStateAction<string[]>>;
  valueB: string;
  setValueB: React.Dispatch<React.SetStateAction<string>>;
  isSequenceValueB: boolean;
  setIsSequenceValueB: React.Dispatch<React.SetStateAction<boolean>>;
  valueBSequence: string[];
  setValueBSequence: React.Dispatch<React.SetStateAction<string[]>>;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  loadingSequences: boolean;
}

const DeviationDetails: React.FC<DeviationDetailsProps> = ({
  deviationType,
  sequenceNames,
  nonSequenceActivities,
  activity,
  setActivity,
  isSequenceActivity,
  setIsSequenceActivity,
  activitySequence,
  setActivitySequence,
  repeatCount,
  setRepeatCount,
  repeatAfter,
  setRepeatAfter,
  isSequenceRepeatAfter,
  setIsSequenceRepeatAfter,
  repeatAfterSequence,
  setRepeatAfterSequence,
  replaceWith,
  setReplaceWith,
  isSequenceReplaceWith,
  setIsSequenceReplaceWith,
  replaceWithSequence,
  setReplaceWithSequence,
  valueA,
  setValueA,
  isSequenceValueA,
  setIsSequenceValueA,
  valueASequence,
  setValueASequence,
  valueB,
  setValueB,
  isSequenceValueB,
  setIsSequenceValueB,
  valueBSequence,
  setValueBSequence,
  name,
  setName,
  loadingSequences,
}) => {
  const [times, setTimes] = useState<string>(repeatCount.toString());

  const getNextOptions = (sequence: string[], sequences: string[][]) => {
    const nextOptions: string[] = [];

    if (sequence.length === 0) {
      sequences.forEach(seq => {
        nextOptions.push(...seq);
      });
    } else {
      const lastItem = sequence[sequence.length - 1];
      sequences.forEach((seq) => {
        const index = seq.indexOf(lastItem);
        if (index !== -1 && index < seq.length - 1) {
          nextOptions.push(...seq.slice(index + 1));
        }
      });
    }
    return Array.from(new Set(nextOptions));
  };

  const getInitialValue = (options: string[]) => {
    return options.length > 0 ? options[0] : 'No further events available';
  };

  const ensureInitialValue = (value: string, options: string[], setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!value || value === 'No further events available') {
      setter(getInitialValue(options));
    }
  };

  const availableActivityOptions = useMemo(() => {
    const options = isSequenceActivity ? getNextOptions(activitySequence, sequenceNames) : nonSequenceActivities;
    return options.length > 0 ? options : ['No further events available'];
  }, [activitySequence, sequenceNames, isSequenceActivity, nonSequenceActivities]);

  const availableRepeatAfterOptions = useMemo(() => {
    const options = isSequenceRepeatAfter ? getNextOptions(repeatAfterSequence, sequenceNames) : nonSequenceActivities;
    return options.length > 0 ? options : ['No further events available'];
  }, [repeatAfterSequence, sequenceNames, isSequenceRepeatAfter, nonSequenceActivities]);

  const availableReplaceWithOptions = useMemo(() => {
    const options = isSequenceReplaceWith ? getNextOptions(replaceWithSequence, sequenceNames) : nonSequenceActivities;
    return options.length > 0 ? options : ['No further events available'];
  }, [replaceWithSequence, sequenceNames, isSequenceReplaceWith, nonSequenceActivities]);

  const availableValueAOptions = useMemo(() => {
    const options = isSequenceValueA ? getNextOptions(valueASequence, sequenceNames) : nonSequenceActivities;
    return options.length > 0 ? options : ['No further events available'];
  }, [valueASequence, sequenceNames, isSequenceValueA, nonSequenceActivities]);

  const availableValueBOptions = useMemo(() => {
    const options = isSequenceValueB ? getNextOptions(valueBSequence, sequenceNames) : nonSequenceActivities;
    return options.length > 0 ? options : ['No further events available'];
  }, [valueBSequence, sequenceNames, isSequenceValueB, nonSequenceActivities]);

  const handleAddToSequence = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (value && value !== 'No further events available') {
      setter((prev) => [...prev, value]);
      if (setter === setActivitySequence) {
        setActivity(getInitialValue(getNextOptions([...activitySequence, value], sequenceNames)));
      }
      if (setter === setRepeatAfterSequence) {
        setRepeatAfter(getInitialValue(getNextOptions([...repeatAfterSequence, value], sequenceNames)));
      }
      if (setter === setReplaceWithSequence) {
        setReplaceWith(getInitialValue(getNextOptions([...replaceWithSequence, value], sequenceNames)));
      }
      if (setter === setValueASequence) {
        setValueA(getInitialValue(getNextOptions([...valueASequence, value], sequenceNames)));
      }
      if (setter === setValueBSequence) {
        setValueB(getInitialValue(getNextOptions([...valueBSequence, value], sequenceNames)));
      }
    }
  };

  const handleClearSequence = (setter: React.Dispatch<React.SetStateAction<string[]>>, clearValueSetter: React.Dispatch<React.SetStateAction<string>>, availableOptions: string[]) => {
    setter([]);
    clearValueSetter(getInitialValue(availableOptions));
  };

  useEffect(() => {
    ensureInitialValue(activity, availableActivityOptions, setActivity);
    ensureInitialValue(repeatAfter, availableRepeatAfterOptions, setRepeatAfter);
    ensureInitialValue(replaceWith, availableReplaceWithOptions, setReplaceWith);
    ensureInitialValue(valueA, availableValueAOptions, setValueA);
    ensureInitialValue(valueB, availableValueBOptions, setValueB);
  }, [
    availableActivityOptions,
    availableRepeatAfterOptions,
    availableReplaceWithOptions,
    availableValueAOptions,
    availableValueBOptions,
  ]);

  useEffect(() => {
    ensureInitialValue(activity, availableActivityOptions, setActivity);
    ensureInitialValue(repeatAfter, availableRepeatAfterOptions, setRepeatAfter);
    ensureInitialValue(replaceWith, availableReplaceWithOptions, setReplaceWith);
    ensureInitialValue(valueA, availableValueAOptions, setValueA);
    ensureInitialValue(valueB, availableValueBOptions, setValueB);
  }, [deviationType, sequenceNames]);

  const handleTimesFocus = () => {
    if (times === '0') {
      setTimes('');
    }
  };

  const handleTimesBlur = () => {
    if (times === '') {
      setTimes('0');
      setRepeatCount(0);
    } else {
      setRepeatCount(parseInt(times, 10));
    }
  };

  const getTimesLabel = () => {
    switch (deviationType) {
      case 'insert':
        return 'How often should it be inserted?';
      case 'repetition':
        return 'How often should it be repeated?';
      default:
        return '';
    }
  };

  return (
    <Box sx={{
      border: '4px solid #ccc',
      padding: 2,
      width: '100%',
      borderRadius: '8px'
    }} className="deviation-details-container">
      <Box display="flex" justifyContent="center" alignItems="center" marginBottom={2}>
        <Tooltip title={"Within this section you can define the details of the deviation. With the name you define a unique identifier. This unique identifier allows you to save deviations with the same deviation type, activity/sequence and count under one name. You can either add a sequence or single activities to define, when the selected deviation type should be applied. If you select for example activity a and skip, skips will occur for activity a. To add a sequence please switch the toggle button: This allows you to build a sequence. For insert and repetition also an additional number must be added to determine how often the selected activity should be repeated or inserted."}>
          <IconButton>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h6" fontWeight="bold" className="section-subheader" sx={{ marginLeft: 1 }}>
          Please enter the deviation details
        </Typography>
      </Box>

      <TextField
        label="Deviation Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        multiline
        InputLabelProps={{ shrink: true }}
        inputProps={{ style: { fontSize: '1rem' } }}
      />
      {(deviationType === 'skip' || deviationType === 'insert') && (
        <>
          <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
            {loadingSequences ? (
              <CircularProgress size={24} />
            ) : (
              <FormControlLabel
                control={<Switch checked={isSequenceActivity} onChange={() => setIsSequenceActivity(!isSequenceActivity)} />}
                label="Sequence"
              />
            )}
            <FormControl fullWidth variant="outlined" style={{ flexGrow: 1 }}>
              <InputLabel id="activity-label">Activity</InputLabel>
              <Select labelId="activity-label" value={activity} onChange={(e: SelectChangeEvent<string>) => setActivity(e.target.value)} label="Activity">
                {availableActivityOptions.map((name, index) => (
                  <MenuItem key={index} value={name} disabled={name === 'No further events available'}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isSequenceActivity && activity !== 'No further events available' && (
              <IconButton onClick={() => handleAddToSequence(setActivitySequence, activity)} color="primary">
                <FontAwesomeIcon icon={faPlus} />
              </IconButton>
            )}
          </Box>
          {isSequenceActivity && (
            <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
              <Typography>{activitySequence.join(', ')}</Typography>
              {activitySequence.length > 0 && (
                <RemoveButton onClick={() => handleClearSequence(setActivitySequence, setActivity, availableActivityOptions)} />
              )}
            </Box>
          )}
        </>
      )}
      {deviationType === 'repetition' && (
        <>
          <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
            {loadingSequences ? (
              <CircularProgress size={24} />
            ) : (
              <FormControlLabel
                control={<Switch checked={isSequenceActivity} onChange={() => setIsSequenceActivity(!isSequenceActivity)} />}
                label="Sequence"
              />
            )}
            <FormControl fullWidth variant="outlined" style={{ flexGrow: 1 }}>
              <InputLabel id="repeat-activity-label">What should be repeated?</InputLabel>
              <Select labelId="repeat-activity-label" value={activity} onChange={(e: SelectChangeEvent<string>) => setActivity(e.target.value)} label="What should be repeated?">
                {availableActivityOptions.map((name, index) => (
                  <MenuItem key={index} value={name} disabled={name === 'No further events available'}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isSequenceActivity && activity !== 'No further events available' && (
              <IconButton onClick={() => handleAddToSequence(setActivitySequence, activity)} color="primary">
                <FontAwesomeIcon icon={faPlus} />
              </IconButton>
            )}
          </Box>
          {isSequenceActivity && (
            <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
              <Typography>{activitySequence.join(', ')}</Typography>
              {activitySequence.length > 0 && (
                <RemoveButton onClick={() => handleClearSequence(setActivitySequence, setActivity, availableActivityOptions)} />
              )}
            </Box>
          )}
          <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
            {loadingSequences ? (
              <CircularProgress size={24} />
            ) : (
              <FormControlLabel
                control={<Switch checked={isSequenceRepeatAfter} onChange={() => setIsSequenceRepeatAfter(!isSequenceRepeatAfter)} />}
                label="Sequence"
              />
            )}
            <FormControl fullWidth variant="outlined" style={{ flexGrow: 1 }}>
              <InputLabel id="repeat-after-label">Should be repeated after</InputLabel>
              <Select labelId="repeat-after-label" value={repeatAfter} onChange={(e: SelectChangeEvent<string>) => setRepeatAfter(e.target.value)} label="Should be repeated after">
                {availableRepeatAfterOptions.map((name, index) => (
                  <MenuItem key={index} value={name} disabled={name === 'No further events available'}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isSequenceRepeatAfter && repeatAfter !== 'No further events available' && (
              <IconButton onClick={() => handleAddToSequence(setRepeatAfterSequence, repeatAfter)} color="primary">
                <FontAwesomeIcon icon={faPlus} />
              </IconButton>
            )}
          </Box>
          {isSequenceRepeatAfter && (
            <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
              <Typography>{repeatAfterSequence.join(', ')}</Typography>
              {repeatAfterSequence.length > 0 && (
                <RemoveButton onClick={() => handleClearSequence(setRepeatAfterSequence, setRepeatAfter, availableRepeatAfterOptions)} />
              )}
            </Box>
          )}
        </>
      )}
      {deviationType === 'replacement' && (
        <>
          <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
            {loadingSequences ? (
              <CircularProgress size={24} />
            ) : (
              <FormControlLabel
                control={<Switch checked={isSequenceActivity} onChange={() => setIsSequenceActivity(!isSequenceActivity)} />}
                label="Sequence"
              />
            )}
            <FormControl fullWidth variant="outlined" style={{ flexGrow: 1 }}>
              <InputLabel id="replace-activity-label">Activity to replace</InputLabel>
              <Select labelId="replace-activity-label" value={activity} onChange={(e: SelectChangeEvent<string>) => setActivity(e.target.value)} label="Activity to replace">
                {availableActivityOptions.map((name, index) => (
                  <MenuItem key={index} value={name} disabled={name === 'No further events available'}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isSequenceActivity && activity !== 'No further events available' && (
              <IconButton onClick={() => handleAddToSequence(setActivitySequence, activity)} color="primary">
                <FontAwesomeIcon icon={faPlus} />
              </IconButton>
            )}
          </Box>
          {isSequenceActivity && (
            <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
              <Typography>{activitySequence.join(', ')}</Typography>
              {activitySequence.length > 0 && (
                <RemoveButton onClick={() => handleClearSequence(setActivitySequence, setActivity, availableActivityOptions)} />
              )}
            </Box>
          )}
          <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
            {loadingSequences ? (
              <CircularProgress size={24} />
            ) : (
              <FormControlLabel
                control={<Switch checked={isSequenceReplaceWith} onChange={() => setIsSequenceReplaceWith(!isSequenceReplaceWith)} />}
                label="Sequence"
              />
            )}
            <FormControl fullWidth variant="outlined" style={{ flexGrow: 1 }}>
              <InputLabel id="replace-with-label">Replace with</InputLabel>
              <Select labelId="replace-with-label" value={replaceWith} onChange={(e: SelectChangeEvent<string>) => setReplaceWith(e.target.value)} label="Replace with">
                {availableReplaceWithOptions.map((name, index) => (
                  <MenuItem key={index} value={name} disabled={name === 'No further events available'}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isSequenceReplaceWith && replaceWith !== 'No further events available' && (
              <IconButton onClick={() => handleAddToSequence(setReplaceWithSequence, replaceWith)} color="primary">
                <FontAwesomeIcon icon={faPlus} />
              </IconButton>
            )}
          </Box>
          {isSequenceReplaceWith && (
            <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
              <Typography>{replaceWithSequence.join(', ')}</Typography>
              {replaceWithSequence.length > 0 && (
                <RemoveButton onClick={() => handleClearSequence(setReplaceWithSequence, setReplaceWith, availableReplaceWithOptions)} />
              )}
            </Box>
          )}
        </>
      )}
      {deviationType === 'swap' && (
        <>
          <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
            {loadingSequences ? (
              <CircularProgress size={24} />
            ) : (
              <FormControlLabel
                control={<Switch checked={isSequenceValueA} onChange={() => setIsSequenceValueA(!isSequenceValueA)} />}
                label="Sequence"
              />
            )}
            <FormControl fullWidth variant="outlined" style={{ flexGrow: 1 }}>
              <InputLabel id="value-a-label">Value A</InputLabel>
              <Select labelId="value-a-label" value={valueA} onChange={(e: SelectChangeEvent<string>) => setValueA(e.target.value)} label="Value A">
                {availableValueAOptions.map((name, index) => (
                  <MenuItem key={index} value={name} disabled={name === 'No further events available'}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isSequenceValueA && valueA !== 'No further events available' && (
              <IconButton onClick={() => handleAddToSequence(setValueASequence, valueA)} color="primary">
                <FontAwesomeIcon icon={faPlus} />
              </IconButton>
            )}
          </Box>
          {isSequenceValueA && (
            <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
              <Typography>{valueASequence.join(', ')}</Typography>
              {valueASequence.length > 0 && (
                <RemoveButton onClick={() => handleClearSequence(setValueASequence, setValueA, availableValueAOptions)} />
              )}
            </Box>
          )}
          <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
            {loadingSequences ? (
              <CircularProgress size={24} />
            ) : (
              <FormControlLabel
                control={<Switch checked={isSequenceValueB} onChange={() => setIsSequenceValueB(!isSequenceValueB)} />}
                label="Sequence"
              />
            )}
            <FormControl fullWidth variant="outlined" style={{ flexGrow: 1 }}>
              <InputLabel id="value-b-label">Value B</InputLabel>
              <Select labelId="value-b-label" value={valueB} onChange={(e: SelectChangeEvent<string>) => setValueB(e.target.value)} label="Value B">
                {availableValueBOptions.map((name, index) => (
                  <MenuItem key={index} value={name} disabled={name === 'No further events available'}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isSequenceValueB && valueB !== 'No further events available' && (
              <IconButton onClick={() => handleAddToSequence(setValueBSequence, valueB)} color="primary">
                <FontAwesomeIcon icon={faPlus} />
              </IconButton>
            )}
          </Box>
          {isSequenceValueB && (
            <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
              <Typography>{valueBSequence.join(', ')}</Typography>
              {valueBSequence.length > 0 && (
                <RemoveButton onClick={() => handleClearSequence(setValueBSequence, setValueB, availableValueBOptions)} />
              )}
            </Box>
          )}
        </>
      )}
      {(deviationType === 'repetition' || deviationType === 'insert') && (
        <Box display="flex" alignItems="center" marginTop={2} className="element-spacing">
          <TextField
            label={getTimesLabel()}
            type="number"
            value={times}
            onChange={(e) => setTimes(e.target.value)}
            onFocus={handleTimesFocus}
            onBlur={handleTimesBlur}
            fullWidth
            multiline
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { fontSize: '1rem' } }}
            margin="normal"
          />
        </Box>
      )}
    </Box>
  );
};

export default DeviationDetails;
