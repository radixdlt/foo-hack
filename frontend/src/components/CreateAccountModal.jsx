import React, { useState } from "react";
import { Box, Typography, TextField, Modal, Stack, Button } from "@mui/material";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function CreateAccountModal({ open, handleClose, handleSubmit }) {

  const [nicknameField, setNicknameField] = useState('');

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style} className="mui-modal">
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Create Profile
        </Typography>
        <Box id="modal-modal-description" sx={{ mt: 2 }}>

          <Box
            component="form"
            noValidate
            autoComplete="off"
          >
            <Stack spacing={2} direction="row">
              <TextField id="outlined-basic" label="Nickname..." variant="outlined" value={nicknameField} onChange={(val) => setNicknameField(val.target.value)} />
              <Button variant="text" onClick={() => handleSubmit(nicknameField)}>Create</Button>
            </Stack>
          </Box>

        </Box>
      </Box>
    </Modal>
  );
}

export default CreateAccountModal;