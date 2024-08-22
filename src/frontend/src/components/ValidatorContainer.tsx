import { Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

export type ValidatorContainerProps = {
  mainTitle: string;
  isValid: boolean;
};

const ValidatorContainer: React.FC<ValidatorContainerProps> = (props) => {
  return (
    <Stack direction={"row"} spacing={1} justifyContent={'center'}>
      <Typography >{props.mainTitle}</Typography>
      {props.isValid ? (
        <CheckIcon style={{ color: "green", fontSize: 20 }} />
      ) : (
        <CloseIcon style={{ color: "red", fontSize: 20 }} />
      )}
    </Stack>
  );
};

export default ValidatorContainer;
