import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Stack, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import useUploadFile from "../queries/useUploadFile";
import { useStore } from "../store/globalStore";

library.add(fas);

const fileTypes = [".bpmn", ".pnml"];

const DragDrop: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const uploadFile = useUploadFile();
  const isFileUploaded = useStore(state => state.isFileUploaded);
  const resetStore = useStore((state) => state.resetStore);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
     resetStore();
    uploadFile.mutate(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/octet-stream": fileTypes,
    },
  });

  return (
    <Stack
      spacing={2}
      width={"350px"}
      alignItems="center"
      style={{ textAlign: "center" }}
    >
      <Stack
        {...getRootProps()}
        direction={"row"}
        className="file-uploader-container"
        style={{
          border: "3px dashed #cccccc",
          padding: "20px",
          cursor: "pointer",
          textAlign: "center",
        }}
        alignItems={"center"}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography variant="body1">Drop the files here ...</Typography>
        ) : (
          <Typography variant="h6">
            Please upload your BPMN or PetriNet file
          </Typography>
        )}
        <div className="custom-icon" style={{ marginTop: "10px" }}>
          <FontAwesomeIcon icon={faUpload} size="3x" />
        </div>
      </Stack>
      {file && (
        <div
          className="file-preview"
          style={{
            marginTop: "20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            width: "300px",
            wordWrap: "break-word",
            color: "#333",
          }}
        >
          <Typography variant="h6" gutterBottom>
            File Preview:
          </Typography>
          <Typography variant="body1" gutterBottom style={{ maxWidth: "100%" }}>
            File Name: {file.name}
          </Typography>
          <Typography variant="body1">File Size: {file.size} bytes</Typography>
        </div>
      )}
      {isFileUploaded && (
        <Typography variant="body1" color="success">
          File uploaded successfully!
        </Typography>
      )}
    </Stack>
  );
};

export default DragDrop;
