import React, { useEffect } from "react";
import { Button, Stack, Typography, Box } from "@mui/material";
import ResetButton from './ResetButton';
import { axiosInstance } from "../queryClient";
import { useMutation } from "react-query";
import NoisyLogDownloadButton from "./NoisyLogDownloadButton";
import CorrectLogDownloadButton from "./CorrectLogDownloadButton";
import { useStore } from "../store/globalStore";

const LogDownload: React.FC = () => {

	const {isDeviationLogLoaded} = useStore();
	const {deviationsSet} = useStore();
	const {playoutIsDone,setPlayoutIsDone} = useStore();
	const {setIsDeviationLogLoaded} = useStore();
	const {isNoiseLogLoaded,setIsNoiseLogLoaded} = useStore();
	const {noiseIsSet} = useStore();
	const {isTraceVarientLoaded} = useStore();
	const {deviations} = useStore();
	const { mutate: doPlayout, isLoading: isPlayoutLoading } = useMutation('doPlayout', async () => {
		setPlayoutIsDone(false);
		setIsDeviationLogLoaded(false);
		setIsNoiseLogLoaded(false)
		const response = await axiosInstance.post('/do_playout', { withCredentials: true });
		if (response.status !== 201) {
			throw new Error('Error doing playout');
		}else{
			setPlayoutIsDone(true);
				setIsDeviationLogLoaded(false);
				setIsNoiseLogLoaded(false); 
				const convertedDeviations = deviations.map((deviation) => {
					const {
						selectedEvent,
						repeatCount,
						repeatAfter,
						replaceWith,
						valueA,
						valueB,
						activity,
						...rest
					} = deviation;

					return {
						selectedEvent: selectedEvent ? selectedEvent.split(', ') : undefined,
						repeatCount: repeatCount !== undefined ? [repeatCount] : undefined,
						repeatAfter: repeatAfter ? repeatAfter.split(', ') : undefined,
						replaceWith: replaceWith ? replaceWith.split(', ') : undefined,
						valueA: valueA ? valueA.split(', ') : undefined,
						valueB: valueB ? valueB.split(', ') : undefined,
						activity: activity ? activity.split(', ') : undefined,
						...rest,
					};
					});

					const deviationsResponse = await axiosInstance.post('/deviations', convertedDeviations, { withCredentials: true });
						setIsNoiseLogLoaded(false);
					if (deviationsResponse.status !== 200) {
						throw new Error('Error setting deviations level');
					}
					console.log("Deviations set successfully");

				const response = await axiosInstance.post('/add_deviations_to_log', { withCredentials: true });
					if (response.status !== 201) {
						throw new Error('Error setting deviations added to log');
					}else{
						console.log("deviations added to log successfully");
						setIsDeviationLogLoaded(true);
						setIsNoiseLogLoaded(false);

						const response = await axiosInstance.post('/add_noise_to_log', { withCredentials: true });
							if (response.status !== 201) {
								throw new Error('Error setting noise level');
							}else{
								setIsNoiseLogLoaded(true);
								console.log("Added Noise Sucessfully set successfully");
							}
					}
			}
	});
	useEffect(() => {
		console.log(" playout",!isPlayoutLoading,!isNoiseLogLoaded )
		if(!isPlayoutLoading&&!isNoiseLogLoaded && noiseIsSet){
		doPlayout();
		}
	},[noiseIsSet]);



		return (
			<div> 
				<Box display="flex" alignItems="center" justifyContent="center" style={{ textAlign: "center", padding: "20px" }}>
					<Stack spacing={2} width={"350px"} alignItems="center">
						<Typography variant="h6" style={{ fontWeight: 'bold' }}>
							Click the button below to download the log file
						</Typography>
						<NoisyLogDownloadButton></NoisyLogDownloadButton>
						<CorrectLogDownloadButton></CorrectLogDownloadButton>
					</Stack>
					<Box display="flex" flexDirection="column" alignItems="center" ml={4} mr={4} style={{ borderLeft: '3px solid  #ccc', height: '100px' }}></Box> {/* Separator Line */}
					<Box display="flex" flexDirection="column" alignItems="center">
						<Typography variant="h6" style={{ fontWeight: 'bold' }}>
							Restart the log creation
						</Typography>
						<ResetButton />
					</Box>
				</Box>
			</div>
		);
};

export default LogDownload;
