import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Select,
  Box as MuiBox,
  FormControl,
  InputLabel,
  Typography,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RemoveButton from "./RemoveButton";
import CircularAddButton from "./CircularAddButton"; // Import the custom add button
import { useStore, Event } from "../store/globalStore";
import FormContainer from "./FormContainer";
import ValidatorContainer from "./ValidatorContainer";

const types = ["Duration", "Resource", "Categorical", "Time", "Numerical"];

interface ActivityAttributesProps {
  setCanProceed: (canProceed: boolean, validationMessage: string) => void;
  activities: string[];
}

const explanations: Record<string, string> = {
  "Duration": "Duration refers to the time, which is needed till the next activity ends. Therefore the first acitvity has a Duration of 0. For example, the time between order received and order processed is the duration of order processed. With Duration you define the activity timestamps for the event log. Therefore time:timestamp is mandatory and entered automatically as name. Also the timestamp set has a standard distribution, to ensure a realistic set-up.",  
  "Resource": "Resource refers to the entity that performs the activity. For example, a specific employee or machine. Therefore automatically org:ressource is entered",
  "Categorical": "With categorical data you can define additional categorical information. For example, the status of an order such as 'in quality controll' or 'delivered'.",
  "Time": "With time you can add additional time-wise information to an activity, such as an expected delivery date.",
  "Numerical": "With numerical data you can represent quantities. For example, the number of items in an order."
};

const ActivityAttributes: React.FC<ActivityAttributesProps> = ({
  setCanProceed,
  activities,
}) => {
  const events = useStore((state) => state.events);
  const addEvent = useStore((state) => state.addEvent);
  const updateEvent = useStore((state) => state.updateEvent);
  const deleteEvent = useStore((state) => state.deleteEvent);

  // Determine the initial selected type based on existing events
  const initialSelectedType = events.some(event => event.type === "Duration")
    ? "Categorical"
    : "Duration";

  const [selectedType, setSelectedType] = useState<string>(initialSelectedType);
  const [nameValue, setNameValue] = useState<string>(
    initialSelectedType === "Duration" ? "time:timestamp" : ""
  );
  const [nameError, setNameError] = useState<boolean>(false);

  useEffect(() => {
    if (selectedType === "Duration" || selectedType === "Resource") {
      setNameValue(
        selectedType === "Duration" ? "time:timestamp" : "org:resource"
      );
    } else {
      setNameValue("");
    }
  }, [selectedType]);

  useEffect(() => {
    validateCanProceed();
  }, [events]);

  const handleAddInput = () => {
    if (!selectedType || !nameValue) return;
    if (events.some((event) => event.name === nameValue)) {
      setNameError(true);
      return;
    }

    activities.forEach((activity) => {
      const newEvent: Partial<Event> = {
        type: selectedType,
        activity,
        name: nameValue,
        probability: "",
      };
      if (selectedType !== "Duration" && selectedType !== "Time") {
        newEvent.value = ""; // Add value only for types other than Duration and Time
      } else {
        newEvent.days = "";
        newEvent.hours = "";
        newEvent.minutes = "";
        newEvent.seconds = "";
      }
      addEvent(newEvent as Event);
    });

    // Automatically set the type to "Categorical" after adding an entry
    setSelectedType("Categorical");
    setNameValue(""); // Clear the name value for new input
    setNameError(false);
  };

  const handleAddActivityDetail = (
    name: string,
    type: string,
    activity: string,
    index: number
  ) => {
    const newEvent: Partial<Event> = {
      type,
      activity,
      name,
      probability: "",
    };
    if (type !== "Duration" && type !== "Time") {
      newEvent.value = ""; // Add value only for types other than Duration and Time
    } else {
      newEvent.days = "";
      newEvent.hours = "";
      newEvent.minutes = "";
      newEvent.seconds = "";
    }

    // Calculate the correct insertion index
    const sameTypeAndNameEvents = events.filter(
      (event) => event.type === type && event.name === name
    );
    const sameTypeAndNameIndex = sameTypeAndNameEvents.findIndex(
      (event) => event.activity === activity
    );
    const insertionIndex =
      sameTypeAndNameIndex !== -1
        ? events.indexOf(sameTypeAndNameEvents[sameTypeAndNameIndex]) + 1
        : events.length;

    // Create a copy of the events array and insert the new event at the correct index
    const eventsCopy = [...events];
    eventsCopy.splice(insertionIndex, 0, newEvent as Event);

    // Update the state with the new events order
    eventsCopy.forEach((event, idx) => updateEvent(idx, event));
  };

  const handleDeleteEvent = (index: number) => {
    deleteEvent(index);
  };

  const handleDeleteBox = (name: string) => {
    const indexesToDelete = events
      .map((event, index) => (event.name === name ? index : -1))
      .filter((index) => index !== -1);

    indexesToDelete.reverse().forEach((index) => deleteEvent(index));
  };

  const handleDetailChange = (
    event: Event,
    value: string,
    field: keyof Event
  ) => {
    const index = events.findIndex((e) => e === event);
    if (index !== -1) {
      // Update only if the field is relevant to the event type
      if (
        (field === "value" && event.type !== "Duration" && event.type !== "Time") ||
        (["days", "hours", "minutes", "seconds"].includes(field) &&
          (event.type === "Duration" || event.type === "Time")) ||
        field === "probability"
      ) {
        updateEvent(index, { [field]: value } as Partial<Event>);
      }
    }
  };

  const validateProbabilities = (name: string) => {
    const groupedByActivity = activities.map((activity) =>
      events.filter((event) => event.activity === activity && event.name === name)
    );
    return groupedByActivity.every(
      (activityEvents) =>
        activityEvents.reduce(
          (total, event) => total + parseFloat(event.probability || "0"),
          0
        ) === 100
    );
  };

  const validateDurationFieldsFilled = () => {
    return events
      .filter((event) => event.type === "Duration")
      .every((event) =>
        ["probability", "days", "hours", "minutes", "seconds"].every(
          (field) => event[field as keyof Event] !== ""
        )
      );
  };

  const validateCanProceed = () => {
    if (events.length === 0) {
      setCanProceed(false, "Please add at least one event.");
      return;
    }
    if (!events.some((event) => event.type === "Duration")) {
      setCanProceed(false, "Please add a duration container.");
      return;
    }
    const allGroupsValid = Object.keys(groupedEvents).every((name) =>
      validateProbabilities(name)
    );
    if (!allGroupsValid) {
      setCanProceed(false, "Please ensure probabilities add up to 100.");
      return;
    }
    const allDurationsValid = validateDurationFieldsFilled();
    if (!allDurationsValid) {
      setCanProceed(
        false,
        "Please fill all fields in the duration container."
      );
      return;
    }
    setCanProceed(true, "");
  };

  const getAvailableTypes = () => {
    const usedTypes = events.map((event) => event.type);
    return types.filter((type) => {
      if (type === "Duration" || type === "Resource") {
        return !usedTypes.includes(type);
      }
      return true;
    });
  };

  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.name]) {
      acc[event.name] = [];
    }
    acc[event.name].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const handleNumberInput = (value: string, max?: number) => {
    // Ensure the input consists of only digits, optionally a decimal point, and optionally a max value
    const regex = /^\d*\.?\d*$/;
    if (!regex.test(value)) return value.slice(0, -1);
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return value.slice(0, -1);
    if (max !== undefined && num > max) return value.slice(0, -1);
    return value;
  };

  const preventNonNumericInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9.]|\./.test(event.key) || (event.key === "." && event.currentTarget.value.includes("."))) {
      event.preventDefault();
    }
  };

  return (
    <MuiBox sx={{ margin: 4, maxWidth: "95%", width: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        justifyContent="center"
        flexWrap="wrap"
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title={selectedType ? explanations[selectedType] : ""} arrow>
            <IconButton size="small">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel shrink>Type</InputLabel>
            <Select
              value={selectedType}
              label="Type"
              onChange={(e) => setSelectedType(e.target.value)}
              displayEmpty
              autoWidth
            >
              {getAvailableTypes().map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <TextField
          label="Name"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          InputProps={{
            readOnly:
              selectedType === "Duration" || selectedType === "Resource",
          }}
          error={nameError}
          helperText={nameError ? "Name must be unique" : ""}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }} // Adjust the width as needed
        />
        <CircularAddButton
          onClick={handleAddInput}
          disabled={!nameValue || !selectedType}
        />
      </Stack>
      {Object.keys(groupedEvents).map((name) => {
        const isProbabilitiesValid = validateProbabilities(name);
        const isDurationFieldsFilled =
          groupedEvents[name][0].type === "Duration" &&
          validateDurationFieldsFilled();
        const containerIsValid =
          isProbabilitiesValid &&
          (groupedEvents[name][0].type !== "Duration" ||
            isDurationFieldsFilled);
        const containerBorderColor = containerIsValid ? "green" : "red";

        return (
          <FormContainer
            key={name}
            containerBorderColor={containerBorderColor}
            onClickRemoveButtonCb={() => handleDeleteBox(name)}
            mainTitle={`${groupedEvents[name][0].type} Configuration (${name})`}
          >
            <Stack spacing={2}>
              {groupedEvents[name].map((event, index) => (
                <MuiBox
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                    width: "100%", // Ensure the box takes full width
                  }}
                >
                  <Typography
                    sx={{
                      whiteSpace: "normal", // Allow the text to break into multiple lines
                      wordWrap: "break-word", // Ensure long words break
                      overflowWrap: "break-word", // Ensure long words break
                      flexGrow: 1,
                      flexShrink: 1,
                      flexBasis: "20%", // Allow the text to take up more space
                      minWidth: 100, // Ensure there's a minimum width
                    }}
                  >
                    {event.activity}
                  </Typography>
                  {["Duration", "Time"].includes(event.type) && (
                    <>
                      <TextField
                        sx={{ flexGrow: 1, flexShrink: 0, flexBasis: "10%" }}
                        label="Days"
                        type="number"
                        value={event.days}
                        onChange={(e) =>
                          handleDetailChange(
                            event,
                            handleNumberInput(e.target.value),
                            "days"
                          )
                        }
                        inputProps={{ min: 0, onKeyPress: preventNonNumericInput }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        sx={{ flexGrow: 1, flexShrink: 0, flexBasis: "10%" }}
                        label="Hours"
                        type="number"
                        value={event.hours}
                        onChange={(e) =>
                          handleDetailChange(
                            event,
                            handleNumberInput(e.target.value, 24),
                            "hours"
                          )
                        }
                        inputProps={{ min: 0, max: 24, onKeyPress: preventNonNumericInput }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        sx={{ flexGrow: 1, flexShrink: 0, flexBasis: "10%" }}
                        label="Minutes"
                        type="number"
                        value={event.minutes}
                        onChange={(e) =>
                          handleDetailChange(
                            event,
                            handleNumberInput(e.target.value, 60),
                            "minutes"
                          )
                        }
                        inputProps={{ min: 0, max: 60, onKeyPress: preventNonNumericInput }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        sx={{ flexGrow: 1, flexShrink: 0, flexBasis: "10%" }}
                        label="Seconds"
                        type="number"
                        value={event.seconds}
                        onChange={(e) =>
                          handleDetailChange(
                            event,
                            handleNumberInput(e.target.value, 60),
                            "seconds"
                          )
                        }
                        inputProps={{ min: 0, max: 60, onKeyPress: preventNonNumericInput }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </>
                  )}
                  {["Resource", "Categorical", "Numerical"].includes(
                    event.type
                  ) && (
                    <TextField
                      sx={{ flexGrow: 1, flexShrink: 0, flexBasis: "10%" }}
                      label="Value"
                      type={event.type === "Numerical" ? "number" : "text"}
                      value={event.value}
                      onChange={(e) =>
                        handleDetailChange(event, e.target.value, "value")
                      }
                      inputProps={{
                        inputMode: "numeric",
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  <TextField
                    sx={{ flexGrow: 1, flexShrink: 0, flexBasis: "10%" }}
                    label="Probability"
                    type="number"
                    value={event.probability}
                    onChange={(e) =>
                      handleDetailChange(
                        event,
                        handleNumberInput(e.target.value, 100),
                        "probability"
                      )
                    }
                    InputLabelProps={{ shrink: true }}
                    placeholder="%"
                  />
                  {groupedEvents[name].filter(
                    (e) => e.activity === event.activity
                  ).length > 1 && (
                    <RemoveButton
                      onClick={() =>
                        handleDeleteEvent(events.findIndex((e) => e === event))
                      }
                    />
                  )}
                  <CircularAddButton
                    onClick={() =>
                      handleAddActivityDetail(
                        name,
                        event.type,
                        event.activity,
                        index
                      )
                    }
                  />
                </MuiBox>
              ))}
            </Stack>
            <MuiBox sx={{ marginTop: 2 }}> {/* Added margin here */}
              <ValidatorContainer
                mainTitle={"Probabilities add up to 100: "}
                isValid={isProbabilitiesValid}
              />
              {groupedEvents[name][0].type === "Duration" && (
                <ValidatorContainer
                  mainTitle={" All input fields are filled:"}
                  isValid={isDurationFieldsFilled}
                />
              )}
            </MuiBox>
          </FormContainer>
        );
      })}
    </MuiBox>
  );
};

export default ActivityAttributes;
