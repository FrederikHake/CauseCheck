import React, { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { NoiseType, useStore } from "../store/globalStore";
import NoiseForm from "../components/NoiseForm";
import { useMutation } from "react-query";
import { axiosInstance } from "../queryClient";

const NoiseLevelView: React.FC = () => {
	const { noise } = useStore();

		const [percentageGeneralNoise, setPercentageGeneralNoise] = useState("");
		const [percentageDeviation, setPercentageDeviation] = useState("");
		const [percentageNoise, setPercentageNoise] = useState("");
		const {isDeviationLogLoaded} = useStore();
		const {deviationsSet} = useStore();
		const {playoutIsDone} = useStore();
		const {setIsDeviationLogLoaded} = useStore();
		const {noiseIsSet,setNoiseIsSet} = useStore();
		const {setIsNoiseLogLoaded} = useStore();
	const [enabled, setEnabled] = useState(() => Boolean(noise.length));

		const noiseTypes: NoiseType[] = [
			"Skip",
			"Insert",
			"Swap",
			"Rework",
			"Early",
			"Late",
		];

		const handleNext = () => {
			setNoiseIsSet(false);
			handleNextButton();
		};
	const {mutate: handleNextButton} = useMutation('fetchTransitions', async () => {
		setIsNoiseLogLoaded(false);
		const data = {
		noise: noise.find((n) => n.type === "General Noise") || "",
		skipNoise: noise.find((n) => n.type === "Skip") || "",
		insertNoise: noise.find((n) => n.type === "Insert") || percentageNoise,
		swapNoise: noise.find((n) => n.type === "Switch") || percentageNoise,
		reworkNoise: noise.find((n) => n.type === "Rework") || percentageNoise,
		earlyNoise: noise.find((n) => n.type === "Early") || percentageNoise,
		lateNoise: noise.find((n) => n.type === "Late") || percentageNoise,
		deviationNoise: noise.filter((n) => n.type !== "General Noise" && n.type !== "Skip" && n.type !== "Insert" && n.type !== "Switch" && n.type !== "Rework" && n.type !== "Early"&&n.type !== "Late").map((n) => [n.type, n.percentage]),
			};
			const response = await axiosInstance.post('/noise', data, { withCredentials: true });
			if (response.status !== 200) {
		throw new Error('Error setting noise level');
			}
		console.log("Noise level set successfully");
		setNoiseIsSet(true);
	});
		useEffect(() => {
			setNoiseIsSet(false)
		}, []);

	return (
		<PageWrapper
			title="Please add the noise level"
			nextPath="/download"
			prevPath="/deviations"
			nextButtonDisabled={(enabled && noise.length == 0)}
			onNextButtonClick={handleNext} // Add the onNext prop and pass the handleNext method
		>
			<NoiseForm enabled={enabled} setEnabled={setEnabled}/>
		</PageWrapper>
	);
};

export default NoiseLevelView;
