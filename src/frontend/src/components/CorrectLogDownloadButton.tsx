import React, { useEffect } from "react";
import { Button, Stack, Typography, Box, CircularProgress } from "@mui/material";
import ResetButton from './ResetButton';
import { axiosInstance } from "../queryClient";
import { useMutation } from "react-query";
import { useStore } from "../store/globalStore";

const CorrectLogDownloadButton: React.FC = () => {
	const { playoutIsDone,setPlayoutIsDone} = useStore();

	const { mutate: fetchLog, isLoading: isFetchingLog } = useMutation('fetchLog', async () => {
		const response = await axiosInstance.get('/normalLog', { withCredentials: true });
		if (response.status !== 200) {
			throw new Error('Error fetching normal log');
		}
		const blob = new Blob([response.data], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "correct_log.xes";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		});



		const handleDownloadButton = () => {
			fetchLog();
		}
	useEffect(() => {
		console.log("playoutIsDone: ",playoutIsDone);
	} , [playoutIsDone]);

	const { mutate: getPlayoutStatus } = useMutation('getPlayoutStatus', async () => {
		const response = await axiosInstance.get('/get_playback_status', { withCredentials: true });
		if (response.status !== 200) {
			return false;
		}
		setPlayoutIsDone( Boolean(response.data));
	});

	useEffect(() => {
		if (!playoutIsDone){
			getPlayoutStatus();
		}
	}, []);
	if (!playoutIsDone){

		return <CircularProgress />;
	}


	return (

		<Button variant="contained" color="primary" onClick={handleDownloadButton}>
			Download Correct Log
		</Button>
	);
};

export default CorrectLogDownloadButton;
