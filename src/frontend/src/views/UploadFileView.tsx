import React from "react";
import PageWrapper from "../components/PageWrapper";
import UploadFileViewForm from "../components/UploadFileViewForm";
import { useStore } from "../store/globalStore";
import { useMutation } from "react-query";
import { axiosInstance } from "../queryClient";
import { Tooltip, IconButton } from "@mui/material";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const UploadFileView: React.FC = () => {
  const {
    cases,
    startDate,
    startTime,
    endDate,
    endTime,
  } = useStore();
  const areDatesAndTimesSet = startDate && startTime && endDate && endTime;
  const { isTimeLoaded, setIsTimeLoaded } = useStore();
  const { isFileUploaded, setFileUploaded } = useStore();
  
  const nextButtonDisabled = Number(cases) <= 0 || !areDatesAndTimesSet || !isFileUploaded;

  const { mutate: handleNextButton } = useMutation('fetchTransitions', async () => {
    const startTimestamp = new Date(`${startDate} ${startTime}`)
    const endTimestamp = new Date(`${endDate} ${endTime}`);
    let dateData = {
      count: Number(cases),
      start_time: startTimestamp,
      end_time: endTimestamp,
    }
    const DateResponse = await axiosInstance.post('/set_start_end_time', dateData, { withCredentials: true });
      if (DateResponse.status !== 200) {
        throw new Error('Failed to set Dates');
      }
      console.log("Dates set successfully");
      setIsTimeLoaded(true);
    }
  );
  
  const handleNext = () => {
    setIsTimeLoaded(false);
    handleNextButton();
  };

  // Function to handle PDF download
  const handlePdfDownload = () => {
    const link = document.createElement('a');
    link.href = '/Manual.pdf';  // References the Manual.pdf in the public folder
    link.download = 'Manual.pdf';
    link.click();
  };

  return (
    <PageWrapper
      title="Welcome"
      nextPath="/gateways"
      nextButtonDisabled={nextButtonDisabled}
      onNextButtonClick={handleNext}
      leftButton={(
        <Tooltip title="Open Manual">
          <IconButton onClick={handlePdfDownload}>
            <PictureAsPdfIcon />
          </IconButton>
        </Tooltip>
      )}
    >
      <UploadFileViewForm />
    </PageWrapper>
  );
};

export default UploadFileView;





