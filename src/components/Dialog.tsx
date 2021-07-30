import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
} from "@chakra-ui/react";
import React, { RefObject, useState } from "react";
import { DepartmentState, Employee, EmployeeInfo } from "../types";
import { EditEmployeeForm } from "./Form";
import _ from "lodash";

interface ButtonDialogProps {
  openingButton: { colorScheme: string; text: string; disabled: boolean };
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

  return (
    <>
      <Button
        colorScheme={openingButton.colorScheme}
        onClick={() => setIsOpen(true)}
        isDisabled={openingButton.disabled}
        size="lg"
      >
        {openingButton.text}
      </Button>

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
}> = ({ onDelete, disabled }) => {
  return (
    <ButtonToDialog
      openingButton={{ colorScheme: "red", text: "Delete", disabled }}
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

export const EditButtonDialog: React.FC<{
  employee: Employee;
  departments: DepartmentState;
  onEdit: (newData: { info: EmployeeInfo; departmentId?: string }) => void;
  disabled: boolean;
}> = ({ employee, departments, onEdit, disabled }) => {
  const currentEmployeeData = {
    info: employee.info,
    departmentId: employee.departmentId,
  };
  const [newData, setNewData] = useState(currentEmployeeData);
  // Pass the new data for placeholder values, and its setter to update values here
  const departmentNames: Record<string, string> = {};
  for (let i = 0; i < departments.data.length; i++) {
    const department = departments.data[i];
    departmentNames[department.id] = department.info.name;
  }
  const editForm = (
    <EditEmployeeForm
      currentData={currentEmployeeData}
      newData={newData}
      setNewData={setNewData}
      departmentNames={departmentNames}
    />
  );

  return (
    <ButtonToDialog
      openingButton={{ colorScheme: "gray", text: "Edit", disabled }}
      dialogHeader={{ text: "Edit Employee" }}
      dialogBody={editForm}
      cancelButton={{
        text: "Cancel",
        handler: () => {
          setNewData(currentEmployeeData);
        },
      }}
      confirmButton={{
        colorScheme: "green",
        text: "Update",
        handler: () => {
          onEdit(newData);
        },
        disabled: _.isEqual(currentEmployeeData, newData),
      }}
    />
  );
};
