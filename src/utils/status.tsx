import React from "react";
import { OperationStatus } from "../types";
import { Alert, AlertIcon, Box } from "@chakra-ui/react";

/**
 * Get the status message according to the edit & delete status
 * @returns Alert element according to status
 */
export const getStatusMessage = (
  operationStatus: OperationStatus
): JSX.Element | null => {
  if (operationStatus.status === "none") return null;
  let alert = {} as JSX.Element;
  if (operationStatus.status === "in progress") {
    alert = (
      <Alert status="info">
        <AlertIcon />
        Attempting to {operationStatus.action} employee
      </Alert>
    );
  } else if (operationStatus.status === "failure") {
    alert = (
      <Alert status="error">
        <AlertIcon />
        Failed to {operationStatus.action} employee
      </Alert>
    );
  } else if (operationStatus.status === "success") {
    alert = (
      <Alert status="success">
        <AlertIcon />
        Successfully {operationStatus.action}d employee
      </Alert>
    );
  }
  return (
    <Box textAlign="center" paddingTop="20px" borderRadius="15px">
      {alert}
    </Box>
  );
};
