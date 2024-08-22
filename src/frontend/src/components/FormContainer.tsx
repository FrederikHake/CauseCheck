import { Typography, Box, Stack } from "@mui/material";
import RemoveButton from "./RemoveButton";
import { PropsWithChildren } from "react";

export type ReactFCWithChildren = React.FC<PropsWithChildren>;

export type FormContainerProps = {
  key: string;
  mainTitle: string;
  containerBorderColor: string;
  onClickRemoveButtonCb: (e: any) => void;
};

const FormContainer: React.FC<React.PropsWithChildren<FormContainerProps>> = (
  props
) => {
  return (
    <Box
      key={props.key}
      sx={{
        marginTop: 2,
        border: `2px solid ${props.containerBorderColor}`,
        borderRadius:2,
        padding: 2,
        position: "relative",
        paddingBottom: "20px",
      }}
    >
      <Stack direction={"row"} spacing={1} justifyContent={'center'} alignItems={'center'} pb={4}>
        <RemoveButton onClick={props.onClickRemoveButtonCb} />
        <Typography variant="h6" sx={{ marginBottom: 2, fontStyle: "bold", fontWeight: '600'}}>
          {props.mainTitle}
        </Typography>
      </Stack>

      {props.children}
    </Box>
  );
};

export default FormContainer;
