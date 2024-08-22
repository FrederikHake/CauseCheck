import React, { useState, useEffect, useMemo } from 'react';
import {
  Stack,
  SelectChangeEvent,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faFileImport,
  faBolt,
  faLocationDot,
  faExchangeAlt,
} from '@fortawesome/free-solid-svg-icons';
import PageWrapper from '../components/PageWrapper';
import DeviationDropdown from '../components/DeviationDropdown';
import DeviationDetails from '../components/DeviationDetails';
import TargetDetails from '../components/TargetDetails';
import DeviationSave from '../components/DeviationSave';
import CircularAddButton from '../components/CircularAddButton';
import { useStore, Deviation } from '../store/globalStore';
import { useMutation } from 'react-query';
import { axiosInstance } from '../queryClient';

const EnterDeviationsView: React.FC = () => {
  const [deviationType, setDeviationType] = useState<string>('skip');
  const [sequenceNames, setSequenceNames] = useState<string[][]>([]);
  const [targetAttribute, setTargetAttribute] = useState<string>('Trace');
  const [name, setName] = useState<string>('');
  const [isNameSaved, setIsNameSaved] = useState<boolean>(false);
  const [targetName, setTargetName] = useState<string>('');
  const [activity, setActivity] = useState<string>('');
  const [activitySequence, setActivitySequence] = useState<string[]>([]);
  const selectedEvent = useStore((state) => state.selectedEvent);
  const setSelectedEvent = useStore((state) => state.setSelectedEvent);
  const [repeatCount, setRepeatCount] = useState<number>(0);
  const [repeatAfter, setRepeatAfter] = useState<string>('');
  const [repeatAfterSequence, setRepeatAfterSequence] = useState<string[]>([]);
  const [replaceWith, setReplaceWith] = useState<string>('');
  const [replaceWithSequence, setReplaceWithSequence] = useState<string[]>([]);
  const [valueA, setValueA] = useState<string>('');
  const [valueASequence, setValueASequence] = useState<string[]>([]);
  const [valueB, setValueB] = useState<string>('');
  const [valueBSequence, setValueBSequence] = useState<string[]>([]);
  const [targetRelation, setTargetRelation] = useState<string>('=');
  const [targetType, setTargetType] = useState<string>('');
  const [targetValue, setTargetValue] = useState<string>('');
  const [targetYears, setTargetYears] = useState<number>(0);
  const [targetMonths, setTargetMonths] = useState<number>(0);
  const [targetDays, setTargetDays] = useState<number>(0);
  const [targetHours, setTargetHours] = useState<number>(0);
  const [targetMinutes, setTargetMinutes] = useState<number>(0);
  const [targetSeconds, setTargetSeconds] = useState<number>(0);
  const [targetProbability, setTargetProbability] = useState<string>('');
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isSequenceActivity, setIsSequenceActivity] = useState<boolean>(false);
  const [isSequenceRepeatAfter, setIsSequenceRepeatAfter] = useState<boolean>(false);
  const [isSequenceReplaceWith, setIsSequenceReplaceWith] = useState<boolean>(false);
  const [isSequenceValueA, setIsSequenceValueA] = useState<boolean>(false);
  const [isSequenceValueB, setIsSequenceValueB] = useState<boolean>(false);
  const { deviations, addDeviation, removeDeviation } = useStore();
  const events = useStore((state) => state.events);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(false);
  const [duplicateSnackbarOpen, setDuplicateSnackbarOpen] = useState(false);
  const { isTraceVarientLoaded, setIsTraceVarientLoaded } = useStore();
  const { isLogLoaded } = useStore();
  const { setIsNoiseLogLoaded } = useStore();
  const { setDeviationsSet } = useStore();
  const { setIsDeviationLogLoaded } = useStore();

  const { mutate: fetchTraceVariants,isLoading } = useMutation('fetchTraceVariants', async () => {
    const response = await axiosInstance.get('/get_trace_varient', { withCredentials: true });
    setIsTraceVarientLoaded(false);
		setIsDeviationLogLoaded(false);
    setIsNoiseLogLoaded(false)
    if (response.status !== 200) {
      throw new Error('Error fetching trace variants');
    }
    const activities = response.data;
    setSequenceNames(activities); // Set the nested structure to sequenceNames
    setActivity(activities[0][0] || ''); // Set initial value to the first activity
    setRepeatAfter(activities[0][0] || ''); // Set initial value to the first activity
    setReplaceWith(activities[0][0] || ''); // Set initial value to the first activity
    setValueA(activities[0][0] || ''); // Set initial value to the first activity
    setValueB(activities[0][0] || ''); // Set initial value to the first activity
    setIsTraceVarientLoaded(true);
  });

  
  useEffect(() => {
    if (!isLoading) {
      fetchTraceVariants();
    }
  }, []);

  const nonSequenceActivities = useMemo(() => {
    const eventActivities = events.map((event) => event.activity);
    return Array.from(new Set(eventActivities));
  }, [events]);

  useEffect(() => {
    validateForm();
  }, [
    deviationType,
    name,
    targetName,
    activity,
    selectedEvent,
    repeatCount,
    repeatAfter,
    replaceWith,
    valueA,
    valueB,
    targetRelation,
    targetType,
    targetValue,
    targetYears,
    targetMonths,
    targetDays,
    targetHours,
    targetMinutes,
    targetSeconds,
    targetProbability,
    activitySequence,
    repeatAfterSequence,
    replaceWithSequence,
    valueASequence,
    valueBSequence,
  ]);

  useEffect(() => {
    const newDeviation: Deviation = {
      deviationType,
      targetAttribute,
      name,
      targetName,
      targetRelation,
      targetType,
      targetValue,
      targetProbability,
      activity: isSequenceActivity ? activitySequence.join(', ') : activity,
      repeatCount: (deviationType === 'insert' || deviationType === 'repetition') ? repeatCount : undefined,
      repeatAfter: isSequenceRepeatAfter ? repeatAfterSequence.join(', ') : repeatAfter,
      replaceWith: isSequenceReplaceWith ? replaceWithSequence.join(', ') : replaceWith,
      valueA: isSequenceValueA ? valueASequence.join(', ') : valueA,
      valueB: isSequenceValueB ? valueBSequence.join(', ') : valueB,
      targetYears,
      targetMonths,
      targetDays,
      targetHours,
      targetMinutes,
      targetSeconds,
      selectedEvent: (targetAttribute === 'Event' || targetAttribute === 'Previous events') ? selectedEvent : undefined, // Include selectedEvent conditionally
    };

    const isDuplicate = isDuplicateDeviation(newDeviation);
    setIsAddButtonDisabled(!isFormValid || isDuplicate);
  }, [
    deviationType,
    targetAttribute,
    name,
    targetName,
    targetRelation,
    targetType,
    targetValue,
    targetProbability,
    activity,
    activitySequence,
    isSequenceActivity,
    repeatCount,
    repeatAfter,
    repeatAfterSequence,
    isSequenceRepeatAfter,
    replaceWith,
    replaceWithSequence,
    isSequenceReplaceWith,
    valueA,
    valueASequence,
    isSequenceValueA,
    valueB,
    valueBSequence,
    isSequenceValueB,
    targetYears,
    targetMonths,
    targetDays,
    targetHours,
    targetMinutes,
    targetSeconds,
    isFormValid,
    selectedEvent, // Add selectedEvent to the dependency array
    targetAttribute, // Add targetAttribute to the dependency array to check if it is 'Event'
  ]);

  const handleDeviationChange = (event: SelectChangeEvent<string>) => {
    const selectedDeviationType = event.target.value;
    setDeviationType(selectedDeviationType);

    // Reset other states to initial values
    setActivity('');
    setActivitySequence([]);
    setRepeatCount(0);
    setRepeatAfter('');
    setRepeatAfterSequence([]);
    setReplaceWith('');
    setReplaceWithSequence([]);
    setValueA('');
    setValueASequence([]);
    setValueB('');
    setValueBSequence([]);
    setTargetRelation('=');
    setTargetType('');
    setTargetValue('');
    setTargetYears(0);
    setTargetMonths(0);
    setTargetDays(0);
    setTargetHours(0);
    setTargetMinutes(0);
    setTargetSeconds(0);
    setTargetProbability('');
    setSelectedEvent(''); // Reset selectedEvent to the first activity
    // Reset sequence toggles
    setIsSequenceActivity(false);
    setIsSequenceRepeatAfter(false);
    setIsSequenceReplaceWith(false);
    setIsSequenceValueA(false);
    setIsSequenceValueB(false);
  };

  const handleTargetAttributeChange = (event: SelectChangeEvent<string>) => {
    setTargetAttribute(event.target.value);
    if (event.target.value !== 'Event' && event.target.value !== 'Previous events') {
      setSelectedEvent('No event selection'); // Reset selectedEvent when not Event or Previous events
    }
  };

  const handleTargetRelationChange = (event: SelectChangeEvent<string>) => {
    setTargetRelation(event.target.value);
  };

  const handleTargetTypeChange = (event: SelectChangeEvent<string>) => {
    const selectedType = event.target.value;
    setTargetType(selectedType);
    if (selectedType === 'Text' || selectedType === 'Resource') {
      setTargetRelation('=');
    }
  };

  const handleTargetProbabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace('%', '');
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 1 && parseFloat(value) <= 100)) {
      setTargetProbability(value);
    }
  };

  const validateForm = () => {
    let isValid = true;

    // Check for common required fields
    if (!deviationType || !name || (!targetName && targetAttribute !== 'Previous events') || !targetProbability) {
      isValid = false;
    }

    // Check for deviation-specific fields
    if (deviationType === 'skip' && (!activity || (isSequenceActivity && activitySequence.length === 0))) {
      isValid = false;
    }
    if (deviationType === 'repetition' && (
      (!isSequenceRepeatAfter && !repeatAfter) ||
      (isSequenceRepeatAfter && repeatAfterSequence.length === 0)
    )) {
      isValid = false;
    }
    if (deviationType === 'insert' && (
      !activity ||
      (isSequenceActivity && activitySequence.length === 0) 
    )) {
      isValid = false;
    }
    if (deviationType === 'replacement' && (
      !activity ||
      (!isSequenceReplaceWith && !replaceWith) ||
      (isSequenceReplaceWith && replaceWithSequence.length === 0)
    )) {
      isValid = false;
    }
    if (deviationType === 'swap' && (
      !valueA ||
      (!isSequenceValueA && !valueA) ||
      (isSequenceValueA && valueASequence.length === 0) || 
      (isSequenceValueB && valueBSequence.length === 0)
    )) {
      isValid = false;
    }

    setIsFormValid(isValid);
  };

  const isDuplicateDeviation = (newDeviation: Deviation) => {
    return deviations.some(dev => {
      const isDuplicateBase = dev.deviationType === newDeviation.deviationType &&
        dev.targetAttribute === newDeviation.targetAttribute &&
        dev.name === newDeviation.name;

      if (newDeviation.targetAttribute !== 'Previous events') {
        if (dev.targetName !== newDeviation.targetName) return false;
        if (dev.targetRelation !== newDeviation.targetRelation) return false;
        if (dev.targetType !== newDeviation.targetType) return false;
        if (dev.targetValue !== newDeviation.targetValue) return false;
      }

      if (!isDuplicateBase) return false;

      if (newDeviation.targetType === 'Duration' || newDeviation.targetType === 'Time') {
        return isDuplicateBase &&
          dev.targetYears === newDeviation.targetYears &&
          dev.targetMonths === newDeviation.targetMonths &&
          dev.targetDays === newDeviation.targetDays &&
          dev.targetHours === newDeviation.targetHours &&
          dev.targetMinutes === newDeviation.targetMinutes &&
          dev.targetSeconds === newDeviation.targetSeconds;
      }

      if (newDeviation.targetAttribute === 'Event' || newDeviation.targetAttribute === 'Previous events') {
        return isDuplicateBase && dev.selectedEvent === newDeviation.selectedEvent;
      }

      switch (newDeviation.deviationType) {
        case 'skip':
          return dev.activity === newDeviation.activity;
        case 'insert':
          return dev.activity === newDeviation.activity && dev.repeatCount === newDeviation.repeatCount;
        case 'repetition':
          return dev.activity === newDeviation.activity &&
            dev.repeatCount === newDeviation.repeatCount &&
            dev.repeatAfter === newDeviation.repeatAfter;
        case 'replacement':
          return dev.activity === newDeviation.activity &&
            dev.replaceWith === newDeviation.replaceWith;
        case 'swap':
          return dev.valueA === newDeviation.valueA &&
            dev.valueB === newDeviation.valueB;
        default:
          return true; // Default case for other deviation types
      }
    });
  };


  const handleSave = () => {
    let newDeviation: Partial<Deviation> = {
      deviationType,
      targetAttribute,
      name,
      targetProbability, // Renamed from percentage to targetProbability
    };

    // Save targetRelation, targetType, and targetValue if targetAttribute is not 'Previous events'
    if (targetAttribute !== 'Previous events') {
      newDeviation = {
        ...newDeviation,
        targetName,
        targetRelation,
        targetType,
        targetValue,
      };
    }

    // Include the activity and repeatCount for insert deviations
    if (['skip', 'insert', 'repetition', 'replacement'].includes(deviationType)) {
      newDeviation.activity = isSequenceActivity ? activitySequence.join(', ') : activity;
    }

    if (deviationType === 'insert' || deviationType === 'repetition') {
      newDeviation.repeatCount = repeatCount;
    }

    // Include repeatAfter only for repetition deviations
    if (deviationType === 'repetition') {
      newDeviation.repeatAfter = isSequenceRepeatAfter ? repeatAfterSequence.join(', ') : repeatAfter;
    }

    // Include replaceWith only for replacement deviations
    if (deviationType === 'replacement') {
      newDeviation.replaceWith = isSequenceReplaceWith ? replaceWithSequence.join(', ') : replaceWith;
    }

    // Include valueA and valueB only for swap deviations
    if (deviationType === 'swap') {
      newDeviation.valueA = isSequenceValueA ? valueASequence.join(', ') : valueA;
      newDeviation.valueB = isSequenceValueB ? valueBSequence.join(', ') : valueB;
    }

    // Include duration fields only if the type is Duration or time
    if (targetType === 'Duration' || targetType === 'Time') {
      newDeviation = {
        ...newDeviation,
        targetYears,
        targetMonths,
        targetDays,
        targetHours,
        targetMinutes,
        targetSeconds,
      };
    }

    // Include selectedEvent only if targetAttribute is 'Event' or 'Previous events'
    if (targetAttribute === 'Event' || targetAttribute === 'Previous events') {
      newDeviation.selectedEvent = selectedEvent;
    }

    // Cast the object to Deviation type before adding it to the store
    addDeviation(newDeviation as Deviation);
    setIsNameSaved(true);
    showSnackbar('Deviation saved successfully!', 'success');
  };

  const handleDelete = (name: string, index: number) => {
    removeDeviation(name, index);
    setIsNameSaved(false);
    showSnackbar('Deviation deleted successfully!', 'success');
  };

  const getIconForDeviation = (type: string) => {
    switch (type) {
      case 'skip':
        return <FontAwesomeIcon icon={faArrowRight} />;
      case 'insert':
        return <FontAwesomeIcon icon={faFileImport} />;
      case 'repetition':
        return <FontAwesomeIcon icon={faBolt} />;
      case 'replacement':
        return <FontAwesomeIcon icon={faLocationDot} />;
      case 'swap':
        return <FontAwesomeIcon icon={faExchangeAlt} />;
      default:
        return null;
    }
  };

  const handlePlusClick = () => {
    const newDeviation: Partial<Deviation> = {
      deviationType,
      targetAttribute,
      name,
      targetProbability,
    };

    if (targetAttribute !== 'Previous events') {
      newDeviation.targetName = targetName;
      newDeviation.targetRelation = targetRelation;
      newDeviation.targetType = targetType;
      newDeviation.targetValue = targetValue;
    }

    if (['skip', 'insert', 'repetition', 'replacement'].includes(deviationType)) {
      newDeviation.activity = isSequenceActivity ? activitySequence.join(', ') : activity;
      if (deviationType === 'insert' || deviationType === 'repetition') {
        newDeviation.repeatCount = repeatCount;
      }
    }

    if (deviationType === 'repetition') {
      newDeviation.repeatAfter = isSequenceRepeatAfter ? repeatAfterSequence.join(', ') : repeatAfter;
    }

    if (deviationType === 'replacement') {
      newDeviation.replaceWith = isSequenceReplaceWith ? replaceWithSequence.join(', ') : replaceWith;
    }

    if (deviationType === 'swap') {
      newDeviation.valueA = isSequenceValueA ? valueASequence.join(', ') : valueA;
      newDeviation.valueB = isSequenceValueB ? valueBSequence.join(', ') : valueB;
    }

    if (targetType === 'Duration' || targetType === 'Time') {
      newDeviation.targetYears = targetYears;
      newDeviation.targetMonths = targetMonths;
      newDeviation.targetDays = targetDays;
      newDeviation.targetHours = targetHours;
      newDeviation.targetMinutes = targetMinutes;
      newDeviation.targetSeconds = targetSeconds;
    }

    if (targetAttribute === 'Event' || targetAttribute === 'Previous events') {
      newDeviation.selectedEvent = selectedEvent;
    }

    setIsAddButtonDisabled(true);

    const existingDeviationByName: Deviation | undefined = deviations.find(
      (dev) => dev.name === name
    );

    if (existingDeviationByName && existingDeviationByName.deviationType !== deviationType) {
      showSnackbar(
        'A deviation with this name already exists for a different deviation type. Please use a different name.',
        'error'
      );
      setIsAddButtonDisabled(false);
      return;
    }

     // New check for repeatCount mismatch for insert or repetition deviations
  if (['insert', 'repetition'].includes(deviationType) && existingDeviationByName) {
    if (existingDeviationByName.repeatCount !== repeatCount) {
      showSnackbar(
        "Repeat count doesn't match the entered name. Another repeat count was already saved under the name.",
        'error'
      );
      setIsAddButtonDisabled(false);
      return;
    }
  }

    let mismatch = false;
    if (existingDeviationByName) {
      switch (deviationType) {
        case 'skip':
          if (existingDeviationByName.activity !== (isSequenceActivity ? activitySequence.join(', ') : activity)) {
            mismatch = true;
          }
          break;
        case 'insert':
          if (existingDeviationByName.activity !== (isSequenceActivity ? activitySequence.join(', ') : activity) ||
              existingDeviationByName.repeatCount !== repeatCount) {
            mismatch = true;
          }
          break;
        case 'repetition':
          if (
            existingDeviationByName.activity !== (isSequenceActivity ? activitySequence.join(', ') : activity) ||
            existingDeviationByName.repeatAfter !== (isSequenceRepeatAfter ? repeatAfterSequence.join(', ') : repeatAfter) ||
            existingDeviationByName.repeatCount !== repeatCount
          ) {
            mismatch = true;
          }
          break;
        case 'replacement':
          if (
            existingDeviationByName.activity !== (isSequenceActivity ? activitySequence.join(', ') : activity) ||
            existingDeviationByName.replaceWith !== (isSequenceReplaceWith ? replaceWithSequence.join(', ') : replaceWith)
          ) {
            mismatch = true;
          }
          break;
        case 'swap':
          if (
            existingDeviationByName.valueA !== (isSequenceValueA ? valueASequence.join(', ') : valueA) ||
            existingDeviationByName.valueB !== (isSequenceValueB ? valueBSequence.join(', ') : valueB)
          ) {
            mismatch = true;
          }
          break;
        default:
          if (existingDeviationByName.targetType === 'Duration' || existingDeviationByName.targetType === 'Time') {
            if (
              existingDeviationByName.targetYears !== targetYears ||
              existingDeviationByName.targetMonths !== targetMonths ||
              existingDeviationByName.targetDays !== targetDays ||
              existingDeviationByName.targetHours !== targetHours ||
              existingDeviationByName.targetMinutes !== targetMinutes ||
              existingDeviationByName.targetSeconds !== targetSeconds
            ) {
              mismatch = true;
            }
          } else if (existingDeviationByName.targetValue !== targetValue) {
            mismatch = true;
          }
          if ((targetAttribute === 'Event' || targetAttribute === 'Previous events') && existingDeviationByName.selectedEvent !== selectedEvent) {
            mismatch = true;
          }
          break;
      }

      if (mismatch) {
        showSnackbar('The entered values or sequences do not match the existing saved deviation. Please use the same values or sequences.', 'error');
        setIsAddButtonDisabled(false);
        return;
      }
    }

    if (targetType === 'Numerical' && isNaN(Number(targetValue))) {
      showSnackbar('Value must be a number for numerical type.', 'error');
      setIsAddButtonDisabled(false);
      return;
    }

    if (!isFormValid) {
      showSnackbar('Please fill out all required fields and ensure no duplicate selections.', 'error');
      setIsAddButtonDisabled(false);
      return;
    }

    if (isDuplicateDeviation(newDeviation as Deviation)) {
      setDuplicateSnackbarOpen(true);
      setIsAddButtonDisabled(false);
      return;
    }

    // Only save for non-swap deviations
    if (deviationType !== 'swap') {
      handleSave();
    } else {
      addDeviation(newDeviation as Deviation); // Add swap deviation without saving the value
      showSnackbar('Deviation saved successfully!', 'success');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    setIsAddButtonDisabled(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setIsAddButtonDisabled(false);
  };

  const handleDuplicateSnackbarClose = () => {
    setDuplicateSnackbarOpen(false);
  };

  const handleNext = () => {
    handleNextButton();
  };

  const { mutate: handleNextButton } = useMutation('fetchTransitions', async () => {
     setDeviationsSet(true);
  });

  useEffect(() => {
    console.log("isLogLoaded", isLogLoaded);
  }, [isLogLoaded]);

  useEffect(() => {
    setDeviationsSet(false)
    setIsTraceVarientLoaded(false)
  }, []);
  console.log("isTraceVarientLoaded", isTraceVarientLoaded);
  return (
    <PageWrapper 
      title="Please enter the deviations" 
      prevPath="/trace-attributes" 
      nextPath="/noise"
      nextButtonDisabled = {!isTraceVarientLoaded} 
      onNextButtonClick={handleNext} // Add the onNext prop and pass the handleNext method
    >
      <Stack spacing={4} padding={2} className="container">
        <Box margin="0 auto" className="section-container">
          <DeviationDropdown deviationType={deviationType} handleDeviationChange={handleDeviationChange} />
        </Box>
        {deviationType && (
          <>
            <Box margin="0 auto" className="section-container">
              <DeviationDetails
                deviationType={deviationType}
                sequenceNames={sequenceNames}
                nonSequenceActivities={nonSequenceActivities}
                activity={activity}
                setActivity={setActivity}
                isSequenceActivity={isSequenceActivity}
                setIsSequenceActivity={setIsSequenceActivity}
                activitySequence={activitySequence}
                setActivitySequence={setActivitySequence}
                repeatCount={repeatCount}
                setRepeatCount={setRepeatCount}
                repeatAfter={repeatAfter}
                setRepeatAfter={setRepeatAfter}
                isSequenceRepeatAfter={isSequenceRepeatAfter}
                setIsSequenceRepeatAfter={setIsSequenceRepeatAfter}
                repeatAfterSequence={repeatAfterSequence}
                setRepeatAfterSequence={setRepeatAfterSequence}
                replaceWith={replaceWith}
                setReplaceWith={setReplaceWith}
                isSequenceReplaceWith={isSequenceReplaceWith}
                setIsSequenceReplaceWith={setIsSequenceReplaceWith}
                replaceWithSequence={replaceWithSequence}
                setReplaceWithSequence={setReplaceWithSequence}
                valueA={valueA}
                setValueA={setValueA}
                isSequenceValueA={isSequenceValueA}
                setIsSequenceValueA={setIsSequenceValueA}
                valueASequence={valueASequence}
                setValueASequence={setValueASequence}
                valueB={valueB}
                setValueB={setValueB}
                isSequenceValueB={isSequenceValueB}
                setIsSequenceValueB={setIsSequenceValueB}
                valueBSequence={valueBSequence}
                setValueBSequence={setValueBSequence}
                name={name}
                setName={setName}
                loadingSequences={isLoading} // Pass loading state to DeviationDetails
              />
            </Box>
            <Box margin="0 auto" className="section-container">
              <TargetDetails
                targetName={targetName}
                setTargetName={setTargetName}
                targetAttribute={targetAttribute}
                handleTargetAttributeChange={handleTargetAttributeChange}
                targetType={targetType}
                handleTargetTypeChange={handleTargetTypeChange}
                targetRelation={targetRelation}
                handleTargetRelationChange={handleTargetRelationChange}
                targetValue={targetValue}
                setTargetValue={setTargetValue}
                targetYears={targetYears}
                setTargetYears={setTargetYears}
                targetMonths={targetMonths}
                setTargetMonths={setTargetMonths}
                targetDays={targetDays}
                setTargetDays={setTargetDays}
                targetHours={targetHours}
                setTargetHours={setTargetHours}
                targetMinutes={targetMinutes}
                setTargetMinutes={setTargetMinutes}
                targetSeconds={targetSeconds}
                setTargetSeconds={setTargetSeconds}
                targetProbability={targetProbability}
                handleTargetProbabilityChange={handleTargetProbabilityChange}
                targetActivities={events.map(event => event.activity)} // Populate targetActivities from events
                targetSelectedEvent={selectedEvent}
                setTargetSelectedEvent={setSelectedEvent}
              />
            </Box>
            <Box margin="0 auto" className="section-container">
              <Typography>Will be added to: {name}</Typography>
              <CircularAddButton
                onClick={handlePlusClick}
                disabled={
                  !isFormValid ||
                  isAddButtonDisabled ||
                  deviations.some(dev => dev.targetName === targetName && dev.targetType !== targetType) ||
                  (targetType === 'Numerical' && isNaN(Number(targetValue))) ||
                  (targetProbability === '' || parseInt(targetProbability) < 1 || parseInt(targetProbability) > 100) ||
                  deviations.some(dev => {
                    if (dev.name === name) {
                      if (dev.deviationType !== deviationType) {
                        return true; // Disable if a deviation with the same name exists for a different type
                      }
                      switch (deviationType) {
                        case 'skip':
                          return dev.activity !== (isSequenceActivity ? activitySequence.join(', ') : activity);
                        case 'insert':
                          return dev.activity !== (isSequenceActivity ? activitySequence.join(', ') : activity) ||
                            dev.repeatCount !== repeatCount;
                        case 'repetition':
                          return (
                            dev.activity !== (isSequenceActivity ? activitySequence.join(', ') : activity) ||
                            dev.repeatAfter !== (isSequenceRepeatAfter ? repeatAfterSequence.join(', ') : repeatAfter) ||
                            dev.repeatCount !== repeatCount
                          );
                        case 'replacement':
                          return (
                            dev.activity !== (isSequenceActivity ? activitySequence.join(', ') : activity) ||
                            dev.replaceWith !== (isSequenceReplaceWith ? replaceWithSequence.join(', ') : replaceWith)
                          );
                        case 'swap':
                          return (
                            dev.valueA !== (isSequenceValueA ? valueASequence.join(', ') : valueA) ||
                            dev.valueB !== (isSequenceValueB ? valueBSequence.join(', ') : valueB)
                          );
                        default:
                          if (dev.targetType === 'Duration' || dev.targetType === 'Time') {
                            if (
                              dev.targetYears !== targetYears ||
                              dev.targetMonths !== targetMonths ||
                              dev.targetDays !== targetDays ||
                              dev.targetHours !== targetHours ||
                              dev.targetMinutes !== targetMinutes ||
                              dev.targetSeconds !== targetSeconds
                            ) {
                              return true;
                            }
                          } else if (dev.targetValue !== targetValue) {
                            return true;
                          }
                          if ((targetAttribute === 'Event' || targetAttribute === 'Previous events') && dev.selectedEvent !== selectedEvent) {
                            return true;
                          }
                          return false;
                      }
                    }
                    return false;
                  }) ||
                  isDuplicateDeviation({
                    deviationType,
                    targetAttribute,
                    name,
                    targetName,
                    targetRelation,
                    targetType,
                    targetValue,
                    targetProbability,
                    activity: isSequenceActivity ? activitySequence.join(', ') : activity,
                    repeatCount,
                    repeatAfter: isSequenceRepeatAfter ? repeatAfterSequence.join(', ') : repeatAfter,
                    replaceWith: isSequenceReplaceWith ? replaceWithSequence.join(', ') : replaceWith,
                    valueA: isSequenceValueA ? valueASequence.join(', ') : valueA,
                    valueB: isSequenceValueB ? valueBSequence.join(', ') : valueB,
                    targetYears,
                    targetMonths,
                    targetDays,
                    targetHours,
                    targetMinutes,
                    targetSeconds,
                    selectedEvent: (targetAttribute === 'Event' || targetAttribute === 'Previous events') ? selectedEvent : undefined, // Include selectedEvent conditionally
                  } as Deviation)
                }
              />
            </Box>
          </>
        )}
        <Box margin="0 auto" className="section-container">
          <DeviationSave savedDeviations={deviations} handleDelete={handleDelete} getIconForDeviation={getIconForDeviation} />
        </Box>
      </Stack>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={duplicateSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleDuplicateSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleDuplicateSnackbarClose} severity="error" sx={{ width: '100%' }}>
          A deviation with the same values already exists.
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default EnterDeviationsView;
