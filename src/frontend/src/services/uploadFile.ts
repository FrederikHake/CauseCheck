import { axiosInstance } from '../queryClient';

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("petrinet", file);

  try {
    let response: any;
    if (file.name.endsWith(".bpmn")) {
      response = await axiosInstance.post("/bpmn", formData);
    } else if (file.name.endsWith(".pnml")) {
      response = await axiosInstance.post("/pnml", formData);
    }
    return response;
  } catch (error) {
    console.error("Error uploading file", error);
    throw error;
  }
};
