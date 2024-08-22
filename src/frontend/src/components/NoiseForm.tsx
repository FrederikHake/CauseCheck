import React, { useMemo, useState, useEffect } from "react";
import {
  Stack,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Switch,
  Tooltip,
  IconButton,
} from "@mui/material";
import { NoiseType, useStore } from "../store/globalStore";
import CircularAddButton from "./CircularAddButton";
import RemoveButton from "./RemoveButton";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const noiseTypes: NoiseType[] = [
  "Skip",
  "Insert",
  "Swap",
  "Rework",
  "Early",
  "Late",
];

type NoiseFormProps = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

const NoiseForm: React.FC<NoiseFormProps> = ({ enabled, setEnabled }) => {
  const { noise, deviations, addNoise, removeNoise } = useStore();

  const [type, setType] = useState<NoiseType | string>(noiseTypes[0]);
  const [percentageGeneralNoise, setPercentageGeneralNoise] = useState("");
  const [percentageDeviation, setPercentageDeviation] = useState("");
  const [percentageNoise, setPercentageNoise] = useState("");
  const [selectedDeviation, setSelectedDeviation] = useState<
    string | undefined
  >();

  const uniqueDeviationsNames = useMemo(() => {
    const names = deviations.map((dev) => dev.name);
    return [...new Set(names)];
  }, [deviations]);

  useEffect(() => {
    if (uniqueDeviationsNames.length > 0 && !selectedDeviation) {
      setSelectedDeviation(uniqueDeviationsNames[0]);
    }
  }, [uniqueDeviationsNames]);

  const handleAddNoise = (type: NoiseType | string, percentage: string) => {
    if (type && percentage) {
      const noiseTypeToSave = type === "Swap" ? "Switch" : type;
      addNoise({ type: noiseTypeToSave, percentage: Number(percentage) });
      resetFields();
    }
  };

  const resetFields = () => {
    setPercentageGeneralNoise("");
    setPercentageDeviation("");
    setPercentageNoise("");
  };

  const enforceMaxValue = (value: string, max: number) => {
    if (value === '') return '';
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || numericValue > max) {
      return value.slice(0, -1);
    }
    return value;
  };

  const handlePercentageChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    const sanitizedValue = enforceMaxValue(value.replace("%", ""), 100);
    setter(sanitizedValue);
  };

  const getNoiseTypeDescription = (type: NoiseType) => {
    switch (type) {
      case "Skip":
        return "Skip noise represents an random activity in the process that is omitted or skipped entirely.";
      case "Insert":
        return "Insert noise involves adding an extra, unintended random activity into the process, which wasn't originally part of the process flow.";
      case "Swap":
        return "Swap noise refers to two random activities in the process being executed out of their intended order.";
      case "Rework":
        return "Rework noise happens when an activity is randomly repeated.";
      case "Early":
        return "Early noise indicates that an activity was executed earlier than it was supposed to be in the process sequence.";
      case "Late":
        return "Late noise means an activity was executed later than scheduled, potentially delaying the entire process.";
    }
  };

  return (
    <Stack spacing={2} alignItems="center" style={{ width: "80%" }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography>Enter noise</Typography>
        <Switch checked={enabled} onChange={() => setEnabled(!enabled)} />
      </Stack>
      {enabled && (
        <>
          <Stack direction="column" spacing={2} alignItems="left">
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title="General noise refers to the overall percentage of noise or random variations introduced into the process, irrespective of specific deviations.">
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
              <TextField
                label="General Noise Percentage"
                type="number"
                value={percentageGeneralNoise}
                onChange={(e) =>
                  handlePercentageChange(
                    setPercentageGeneralNoise,
                    e.target.value
                  )
                }
                placeholder="%"
                fullWidth
                multiline
                InputLabelProps={{ shrink: true }}
              />
              <CircularAddButton
                onClick={() =>
                  handleAddNoise("General Noise", percentageGeneralNoise)
                }
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title={getNoiseTypeDescription(type as NoiseType)}>
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
              <FormControl fullWidth>
                <InputLabel shrink>Noise Type</InputLabel>
                <Select
                  value={type}
                  label="Noise Type"
                  onChange={(e) => setType(e.target.value as NoiseType)}
                  autoWidth
                  displayEmpty
                >
                  {noiseTypes.map((noiseType) => (
                    <MenuItem key={noiseType} value={noiseType}>
                      {noiseType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Percentage"
                type="number"
                value={percentageNoise}
                onChange={(e) =>
                  handlePercentageChange(setPercentageNoise, e.target.value)
                }
                placeholder="%"
                fullWidth
                multiline
                InputLabelProps={{ shrink: true }}
              />
              <CircularAddButton
                onClick={() =>
                  handleAddNoise(type as NoiseType, percentageNoise)
                }
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title="Here you can select the in the previous page defined deviations. You can add an extra noise level meaning a randomly adding of the deviations based on the percentage level">
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
              <FormControl fullWidth>
                <InputLabel shrink>Deviation Names</InputLabel>
                <Select
                  label="Deviation Names"
                  value={selectedDeviation || ""}
                  onChange={(e) =>
                    setSelectedDeviation(e.target.value as string)
                  }
                  autoWidth
                  displayEmpty
                >
                  {uniqueDeviationsNames.map((deviation) => (
                    <MenuItem key={deviation} value={deviation}>
                      {deviation}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Percentage"
                type="number"
                value={percentageDeviation}
                onChange={(e) =>
                  handlePercentageChange(setPercentageDeviation, e.target.value)
                }
                placeholder="%"
                fullWidth
                multiline
                InputLabelProps={{ shrink: true }}
              />
              <CircularAddButton
                onClick={() =>
                  handleAddNoise(
                    selectedDeviation as string,
                    percentageDeviation
                  )
                }
              />
            </Stack>
          </Stack>
          <Stack spacing={1} style={{ width: "100%" }}>
            {noise.map((n, index) => (
              <Stack
                key={index}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  border: "1px solid #e0e0e0",
                  padding: "10px",
                  borderRadius: "8px",
                }}
                bgcolor={"#e0e0e0"}
              >
                <Typography>
                  Noise: {n.type === "Switch" ? "Swap" : n.type} - Probability: {n.percentage}%
                </Typography>
                <RemoveButton onClick={() => removeNoise(n.type)} />
              </Stack>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default NoiseForm;
