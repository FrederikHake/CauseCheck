import React, { useEffect } from "react";
import { Button, Stack, Typography, Box, CircularProgress } from "@mui/material";
import ResetButton from './ResetButton';
import { axiosInstance } from "../queryClient";
import { useMutation } from "react-query";
import { useStore } from "../store/globalStore";

const NoisyLogDownloadButton: React.FC = () => {
    const { isNoiseLogLoaded,setIsNoiseLogLoaded} = useStore();

	const { mutate: fetchNoisyLog, isLoading: isFetchingNoisyLog } = useMutation('fetchNoisyLog', async () => {
		const response = await axiosInstance.get('/noisyLog', { withCredentials: true });
		if (response.status !== 200) {
			throw new Error('Error fetching noisy log');
		}
		const blob = new Blob([response.data], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "noisy_log.xes";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		});

	const handleNoisyDownloadButton = () => {
		fetchNoisyLog();
		}
	
    if (!isNoiseLogLoaded){
    
        return <CircularProgress />;
    }
	return (

        <Button variant="contained" color="primary" onClick={handleNoisyDownloadButton}>
            Download Log with Errors
        </Button>
	);
};

export default NoisyLogDownloadButton;
