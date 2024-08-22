import { useMutation } from 'react-query';
import { useStore } from '../store/globalStore';
import { uploadFile } from '../services/uploadFile';
import { useSnackbarContext } from '../contexts/SnackbarContext';

const useUploadFile = () => {
  const { showSnackbar } = useSnackbarContext();
  const setFileUploaded = useStore(state => state.setFileUploaded);

  return useMutation(uploadFile, {
    onSuccess: (data) => {
      setFileUploaded(true);
      showSnackbar(data.message || "File uploaded successfully", 'success');
    },
    onError: (error:any) => {
      const errorMessage = `The following error has occurred: ${error.response.data.error || 'An error occurred'}`;
      console.error("Error uploading file", error);
      setFileUploaded(false);
      showSnackbar(errorMessage, 'error');
    }
  });
};

export default useUploadFile;
