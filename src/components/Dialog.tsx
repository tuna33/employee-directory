import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  IconButton,
  Text,
} from "@chakra-ui/react";
import React, { RefObject, useState } from "react";
import { Department, Employee, EmployeeInfo } from "../types";
import { EmployeeForm } from "./Form";
import _ from "lodash";
import { generateDepartmentsMap } from "../utils/data";

interface ButtonDialogProps {
  openingButton: {
    colorScheme: string;
    text: string;
    disabled: boolean;
    icon?: JSX.Element;
  };
  dialogHeader: { text: string };
  dialogBody: JSX.Element;
  cancelButton: { text: string; handler: () => unknown };
  confirmButton: {
    colorScheme: string;
    text: string;
    handler: () => unknown;
    disabled: boolean;
  };
}

export const ButtonToDialog: React.FC<ButtonDialogProps> = ({
  openingButton,
  dialogHeader,
  dialogBody,
  cancelButton,
  confirmButton,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = React.useRef() as RefObject<HTMLButtonElement>;

  const button = openingButton.icon ? (
    <IconButton
      aria-label={openingButton.text}
      icon={openingButton.icon}
      colorScheme={openingButton.colorScheme}
      onClick={() => setIsOpen(true)}
      isDisabled={openingButton.disabled}
      size="sm"
    >
      {openingButton.text}
    </IconButton>
  ) : (
    <Button
      colorScheme={openingButton.colorScheme}
      onClick={() => setIsOpen(true)}
      isDisabled={openingButton.disabled}
      size="lg"
    >
      {openingButton.text}
    </Button>
  );

  return (
    <>
      {button}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {dialogHeader.text}
            </AlertDialogHeader>

            <AlertDialogBody>{dialogBody}</AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  onClose();
                  cancelButton.handler();
                }}
              >
                {cancelButton.text}
              </Button>
              <Button
                colorScheme={confirmButton.colorScheme}
                onClick={() => {
                  onClose();
                  confirmButton.handler();
                }}
                disabled={confirmButton.disabled}
                ml={3}
              >
                {confirmButton.text}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export const DeleteButtonDialog: React.FC<{
  onDelete: () => unknown;
  disabled: boolean;
  icon?: JSX.Element;
}> = ({ onDelete, disabled, icon }) => {
  return (
    <ButtonToDialog
      openingButton={{ colorScheme: "red", text: "Delete", disabled, icon }}
      dialogHeader={{ text: "Delete Employee" }}
      dialogBody={<Text>Are you sure? You can&apos;t undo this action.</Text>}
      cancelButton={{
        text: "Cancel",
        handler: () => {
          return;
        },
      }}
      confirmButton={{
        colorScheme: "red",
        text: "Delete",
        handler: onDelete,
        disabled: false,
      }}
    />
  );
};

interface FormDialogButtonProps {
  employee: Employee;
  departments: Department[];
  onSubmit: (newData: { info: EmployeeInfo; departmentId?: string }) => void;
  disabled: boolean;
  formType: "Edit" | "Add";
  icon?: JSX.Element;
}

export const FormDialogButton: React.FC<FormDialogButtonProps> = ({
  employee,
  departments,
  onSubmit,
  disabled,
  formType,
  icon,
}) => {
  const currentEmployeeData = {
    info: employee.info,
    departmentId: employee.departmentId,
  };
  const [resultData, setResultData] = useState(currentEmployeeData);
  const departmentNames = generateDepartmentsMap(departments);
  const form = (
    <EmployeeForm
      placeholderData={currentEmployeeData}
      resultData={resultData}
      setResultData={setResultData}
      departmentNames={departmentNames}
    />
  );
  return (
    <ButtonToDialog
      openingButton={{
        colorScheme: "gray",
        text: formType === "Add" ? "Add Employee" : formType,
        disabled,
        icon,
      }}
      dialogHeader={{ text: `${formType} Employee` }}
      dialogBody={form}
      cancelButton={{
        text: "Cancel",
        handler: () => {
          setResultData(currentEmployeeData);
        },
      }}
      confirmButton={{
        colorScheme: "green",
        text: formType === "Edit" ? "Update" : "Add",
        handler: () => {
          onSubmit(resultData);
        },
        // Do not update if the contents in the form haven't changed (Edit only)
        disabled:
          formType === "Add"
            ? false
            : _.isEqual(currentEmployeeData, resultData),
      }}
    />
  );
};
