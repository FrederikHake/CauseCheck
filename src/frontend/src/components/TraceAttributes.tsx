import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Select,
  Box as MuiBox,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CircularAddButton from "./CircularAddButton";
import RemoveButton from "./RemoveButton";
import { useStore, TraceAttribute, CategoryType } from "../store/globalStore";
import FormContainer from "./FormContainer";
import ValidatorContainer from "./ValidatorContainer";

const types: CategoryType[] = ["Categorical", "Time", "Numerical"];

const explanations: Record<CategoryType, string> = {
  "Categorical": "With categorical data you can define additional categorical information for a whole trace. An example would be Bank1, which could show that certain traces are handled by Bank1.",
  "Time": "With time you can add additional time-wise information to an activity for a whole trace, such as additional SLAs.",
  "Numerical": "With numerical data you can represent quantities for a whole trace. An example would be a process id."
};

interface TraceAttributesProps {
  setCanProceed: (canProceed: boolean) => void;
}

const TraceAttributes: React.FC<TraceAttributesProps> = ({ setCanProceed }) => {
  const [selectedType, setSelectedType] = useState<CategoryType>(types[0]);
  const [attributeName, setAttributeName] = useState("");
  const [nameError, setNameError] = useState("");
  const {
    traceAttributes,
    addTraceAttribute,
    removeTraceAttribute,
    addTraceAttributeConfiguration,
    updateTraceAttributeConfiguration,
    removeTraceAttributeConfiguration,
  } = useStore();

  useEffect(() => {
    setAttributeName("");
    setNameError(""); // Clear name error when type changes
  }, [selectedType]);

  const isNameUnique = (name: string) => {
    return !traceAttributes.some((attr) => attr.name === name);
  };

  const handleAddInput = () => {
    if (!attributeName) return;

    if (!isNameUnique(attributeName)) {
      setNameError("Name must be unique");
      return;
    }

    const newTraceAttribute: TraceAttribute = {
      kind: selectedType,
      id: `${selectedType}-${attributeName}`,
      category: selectedType,
      name: attributeName,
      configurations: [],
    };

    addTraceAttribute(newTraceAttribute);
    setAttributeName("");
    setNameError(""); // Clear name error
  };

  const handleDeleteContainer = (traceAttributeId: string) => {
    removeTraceAttribute(traceAttributeId);
  };

  const handleDeleteDetail = (
    attributeId: string,
    traceAttributeConfigId: string
  ) => {
    removeTraceAttributeConfiguration(attributeId, traceAttributeConfigId);
  };

  const handleAddDetail = (
    traceAttributeId: string,
    traceAttributeKind: CategoryType
  ) => {
    const newConfig: any = {
      id: `${traceAttributeId}-${Date.now()}`, // Unique ID
      kind: traceAttributeKind,
      percentage: "",
      ...(traceAttributeKind === "Time"
        ? { days: "", hours: "", minutes: "", seconds: "" }
        : { value: "" }),
    };

    addTraceAttributeConfiguration(traceAttributeId, newConfig);
  };

  const enforceMaxValue = (value: string, max: number) => {
    if (value === '') return '';
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue > max) {
      return value.slice(0, -1); // Remove the last character
    }
    return value;
  };

  const preventNonNumericInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9.]|\./.test(event.key) || (event.key === "." && event.currentTarget.value.includes("."))) {
      event.preventDefault();
    }
  };

  const handleDetailChange = (
    attributeId: string,
    traceAttributeKind: CategoryType,
    configId: string,
    field: string,
    value: string | number
  ) => {
    const foundTraceAttribute = traceAttributes.find(
      (attr) => attr.id === attributeId
    );
    const foundConfig = foundTraceAttribute?.configurations.find(
      (config) => config.id === configId
    );
    if (!foundTraceAttribute || !foundConfig) return;

    let updatedConfig: any = {
      ...foundConfig,
      [field]: value,
    };

    // Percentage validation
    if (field === "percentage") {
      const percentageValue = parseFloat(value as string);

      if (value === "") {
        updatedConfig.percentage = "";
      } else if (isNaN(percentageValue)) {
        return;
      } else if (percentageValue > 100) {
        return;
      } else {
        updatedConfig.percentage = percentageValue;
      }
    }

    // Time validation
    if (traceAttributeKind === "Time") {
      if (field === "hours") {
        updatedConfig.hours = enforceMaxValue(value as string, 60);
      } else if (field === "minutes") {
        updatedConfig.minutes = enforceMaxValue(value as string, 60);
      } else if (field === "seconds") {
        updatedConfig.seconds = enforceMaxValue(value as string, 60);
      }
    }

    // Numerical validation
    if (
      traceAttributeKind === "Numerical" &&
      field === "value" &&
      updatedConfig.kind === "Numerical"
    ) {
      const numericalValue = parseFloat(value as string);
      if (value === "") {
        updatedConfig.value = "";
      } else if (isNaN(numericalValue)) {
        return;
      }
    }

    updateTraceAttributeConfiguration(attributeId, updatedConfig);
  };

  useEffect(() => {
    traceAttributes.forEach((traceAttribute) => {
      if (traceAttribute.configurations.length === 0) {
        handleAddDetail(traceAttribute.id, traceAttribute.kind);
      }
    });
  }, [traceAttributes]);

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
              onChange={(e) => setSelectedType(e.target.value as CategoryType)}
              displayEmpty
              autoWidth
            >
              {types.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <TextField
          label="Name"
          value={attributeName}
          onChange={(e) => setAttributeName(e.target.value)}
          error={!!nameError}
          helperText={nameError}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }}
        />
        <CircularAddButton
          onClick={handleAddInput}
          disabled={!attributeName || !selectedType}
        />
      </Stack>
      {traceAttributes.map((traceAttribute) => {
        const containerValid =
          traceAttribute.configurations.reduce(
            (sum, config) => sum + Number(config.percentage),
            0
          ) === 100;

        return (
          <FormContainer
            key={traceAttribute.id}
            containerBorderColor={containerValid ? "green" : "red"}
            onClickRemoveButtonCb={() =>
              handleDeleteContainer(traceAttribute.id)
            }
            mainTitle={`${traceAttribute.category} Configuration (${traceAttribute.name})`}
          >
            <Stack>
              {traceAttribute.configurations.map((configuration, configIndex) => {
                const isLastConfiguration = configIndex === traceAttribute.configurations.length - 1;
                return (
                  <Stack
                    key={configuration.id}
                    direction={"row"}
                    mb={2}
                    alignItems={"center"}
                    spacing={2}
                  >
                    {configuration.kind === "Time" && (
                      <>
                        <TextField
                          label="Days"
                          type="number"
                          value={configuration.days}
                          onChange={(e) =>
                            handleDetailChange(
                              traceAttribute.id,
                              traceAttribute.kind,
                              configuration.id,
                              "days",
                              e.target.value
                            )
                          }
                          onKeyPress={preventNonNumericInput}
                          sx={{ width: 200 }}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Hours"
                          type="number"
                          value={configuration.hours}
                          onChange={(e) =>
                            handleDetailChange(
                              traceAttribute.id,
                              traceAttribute.kind,
                              configuration.id,
                              "hours",
                              e.target.value
                            )
                          }
                          onKeyPress={preventNonNumericInput}
                          inputProps={{ min: 0, max: 60 }}
                          sx={{ width: 200 }}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Minutes"
                          type="number"
                          value={configuration.minutes}
                          onChange={(e) =>
                            handleDetailChange(
                              traceAttribute.id,
                              traceAttribute.kind,
                              configuration.id,
                              "minutes",
                              e.target.value
                            )
                          }
                          onKeyPress={preventNonNumericInput}
                          inputProps={{ min: 0, max: 60 }}
                          sx={{ width: 200 }}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Seconds"
                          type="number"
                          value={configuration.seconds}
                          onChange={(e) =>
                            handleDetailChange(
                              traceAttribute.id,
                              traceAttribute.kind,
                              configuration.id,
                              "seconds",
                              e.target.value
                            )
                          }
                          onKeyPress={preventNonNumericInput}
                          inputProps={{ min: 0, max: 60 }}
                          sx={{ width: 200 }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </>
                    )}
                    {configuration.kind === "Numerical" && (
                      <>
                        <TextField
                          label="Value"
                          value={configuration.value}
                          onChange={(e) =>
                            handleDetailChange(
                              traceAttribute.id,
                              traceAttribute.kind,
                              configuration.id,
                              "value",
                              e.target.value
                            )
                          }
                          sx={{ width: 200 }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </>
                    )}
                    {configuration.kind === "Categorical" && (
                      <>
                        <TextField
                          label="Value"
                          type={"text"}
                          value={configuration.value}
                          onChange={(e) =>
                            handleDetailChange(
                              traceAttribute.id,
                              traceAttribute.kind,
                              configuration.id,
                              "value",
                              e.target.value
                            )
                          }
                          sx={{ width: 200 }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </>
                    )}
                    <TextField
                      label="Probability"
                      type="number"
                      value={configuration.percentage}
                      onChange={(e) => {
                        handleDetailChange(
                          traceAttribute.id,
                          traceAttribute.kind,
                          configuration.id,
                          "percentage",
                          e.target.value
                        );
                      }}
                      sx={{ width: "15rem" }}
                      inputProps={{ min: 0, max: 100 }}
                      onKeyPress={preventNonNumericInput}
                      InputLabelProps={{ shrink: true }}
                      placeholder="%"
                    />
                    {traceAttribute.configurations.length > 1 && (
                      <IconButton
                        onClick={() =>
                          handleDeleteDetail(traceAttribute.id, configuration.id)
                        }
                      >
                        <RemoveButton
                          onClick={() =>
                            handleDeleteDetail(
                              traceAttribute.id,
                              configuration.id
                            )
                          }
                        />
                      </IconButton>
                    )}
                    {isLastConfiguration && (
                      <CircularAddButton
                        onClick={() =>
                          handleAddDetail(traceAttribute.id, traceAttribute.kind)
                        }
                      />
                    )}
                  </Stack>
                );
              })}
            </Stack>
            <ValidatorContainer
              mainTitle={"Probabilities add up to 100: "}
              isValid={containerValid}
            />
          </FormContainer>
        );
      })}
    </MuiBox>
  );
};

export default TraceAttributes;
