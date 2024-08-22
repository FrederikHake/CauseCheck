import React, { useState, useEffect } from "react";
import { Stack } from "@mui/material";
import PageWrapper from "../components/PageWrapper";
import { CategoricalConfig, NumericalConfig, TimeConfig, useStore } from "../store/globalStore";
import TraceAttributes from "../components/TraceAttributes";
import { axiosInstance } from "../queryClient";
 
const TraceAttributesView: React.FC = () => {
  const { traceAttributes } = useStore();
  const { setIsTraceVarientLoaded, setPlayoutIsDone } = useStore();
  const [canProceed, setCanProceed] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
 
  useEffect(() => {
    const groupedAttributes = traceAttributes.reduce((acc, attr) => {
      const totalPercentage = attr.configurations.reduce((sum, config) => sum + Number(config.percentage), 0);
      acc[attr.name] = totalPercentage;
      return acc;
    }, {} as Record<string, number>);
 
    const canProceed = Object.values(groupedAttributes).every(total => total === 100);
    setCanProceed(canProceed);
  }, [traceAttributes]);
 
  const onNextButtonClick = async () => {
    try {
      // Create an object to hold the formatted attributes
      const formattedAttributes = traceAttributes.reduce((acc, attr) => {
        // Check if the attribute already exists in the accumulator
        if (!acc[attr.name]) {
          acc[attr.name] = [];
        }
 
        // Format the configurations based on their type
        const formattedConfigurations = attr.configurations.map((config) => {
          console.log(config)
          if ("kind" in config && config.kind === "Time") {
             const { days, hours, minutes, seconds } = config as TimeConfig;
            const value = new Date(days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000).toISOString();
            return { value, percentage: Number(config.percentage) / 100 };
          } else if ("value" in config) {
            return { value: config.value, percentage: Number(config.percentage) / 100 };
          }
        });
 
        // Add the formatted configurations to the corresponding attribute in the accumulator
        acc[attr.name].push(...formattedConfigurations);
 
        return acc;
      }, {} as Record<string, any[]>);
 
      const response = await axiosInstance.post("/set_trace_attributes", {
        attributes: formattedAttributes,
      });
      console.log(response.data); // Assuming you want to log the response
      setIsTraceVarientLoaded(false);
	  setPlayoutIsDone (false); 
    } catch (error) {
      setError("Error setting trace attributes");
      console.error(error);
    }
  };
 
  return (
    <PageWrapper
      title="Please enter your trace attributes"
      prevPath="/validations"
      nextPath="/deviations"
      nextButtonDisabled={!canProceed} // Pass the prop here
      onNextButtonClick={onNextButtonClick}
    >
      <Stack spacing={2} alignItems="center" style={{ width: "80%" }}>
        <TraceAttributes setCanProceed={setCanProceed} />
      </Stack>
    </PageWrapper>
  );
};
 
export default TraceAttributesView;