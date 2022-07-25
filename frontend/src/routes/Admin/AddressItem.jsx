import React from "react";
import { Button } from "@mui/material";

import "./Admin.styles.scss";

function AddressItem({ disabled = false, children = null, addresses = null, text = null, generationAction = null }) {

  if (generationAction && !addresses) {

    return <Button disabled={disabled} className="address-button" variant="contained" color="inherit" onClick={() => generationAction({ addresses })}>{text}</Button>;

  }

  if (!addresses) {
    return null;
  }

  return children;

}

export default AddressItem;
