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
import React, { RefObject } from "react";

interface ButtonDialogProps {
  openingButton: { colorScheme: string; text: string; disabled: boolean };
  dialogHeader: { text: string };
  dialogBody: JSX.Element;
  cancelButton: { text: string };
  confirmButton: { colorScheme: string; text: string; handler: () => unknown };
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
              <Button ref={cancelRef} onClick={onClose}>
                {cancelButton.text}
              </Button>
              <Button
                colorScheme={confirmButton.colorScheme}
                onClick={() => {
                  onClose();
                  confirmButton.handler();
                }}
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
      cancelButton={{ text: "Cancel" }}
      confirmButton={{
        colorScheme: "red",
        text: "Delete",
        handler: onDelete,
      }}
    />
  );
};
