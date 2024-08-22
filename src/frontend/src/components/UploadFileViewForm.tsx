import React from "react";
import DragDrop from "./DragAndDrop";
import { Stack, TextField, Tooltip, IconButton, Typography } from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useStore } from "../store/globalStore";
import DateTimeRangePicker from "./DateTimeRangePicker";
import GeneralContainer from "./GeneralContainer";

const UploadFileViewForm: React.FC = () => {
  const {
    cases,
    updateNumberOfCases,
    startDate,
    startTime,
    endDate,
    endTime,
    setStartDate,
    setStartTime,
    setEndDate,
    setEndTime,
  } = useStore();

  const handlePercentageChange = (event: any) => {
    const numberValue = Number(event.target.value);

    if (!isNaN(numberValue) && numberValue > 0) {
      updateNumberOfCases(String(numberValue));
    } else {
      updateNumberOfCases("");
    }
  };

  const renderTitleWithTooltip = (title: string, tooltipText: string) => (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="h6" style={{ fontWeight: 'bold' }}>{title}</Typography>
      <Tooltip title={tooltipText} arrow>
        <IconButton size="small">
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <Stack direction={"column"} alignItems={"center"} spacing={2}>
      <GeneralContainer customTitle={renderTitleWithTooltip(
        "Upload the process model", 
        "A BPMN or PetriNet can be uploaded via drag and drop or by clikcing in the frame below. BPMNs are converted into PetriNets. The entered process model is the basis for the simulation of the event log. XOR gateways and activities are determined on the basis of the model entered."
      )}>
        <DragDrop />
      </GeneralContainer>
      <GeneralContainer customTitle={renderTitleWithTooltip("Enter timeframe", "The timeframes for the traces can be entered in this area. All traces start in this timeframe.")}>
        <DateTimeRangePicker
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
          setStartDate={setStartDate}
          setStartTime={setStartTime}
          setEndDate={setEndDate}
          setEndTime={setEndTime}
        />
      </GeneralContainer>
      <GeneralContainer customTitle={renderTitleWithTooltip("Insert number of cases", "The number of traces of the simuated event log are defined in this area.")}>
        <TextField
          label="Number of cases"
          type="number"
          value={cases}
          onChange={handlePercentageChange}
          multiline
          style={{
            width: "10rem",
          }}
          InputLabelProps={{ shrink: true }}
        />
      </GeneralContainer>
    </Stack>
  );
};

export default UploadFileViewForm;
