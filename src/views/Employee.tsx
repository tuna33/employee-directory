import { Grid, Heading, HStack, Text, VStack, Wrap } from "@chakra-ui/react";
import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { DepartmentContext, EmployeeContext } from "../components/App";
import { DeleteButtonDialog, FormDialogButton } from "../components/Dialog";
import {
  DepartmentState,
  EmployeeInfo,
  EmployeeState,
  OperationStatus,
} from "../types";
import {
  deleteEmployee,
  editEmployee,
  getEmployeeCard,
} from "../utils/actions";
import { getStatusMessage } from "../utils/status";
import { employeeBioPlaceholder } from "../utils/text";

const Error: React.FC<{ id: string }> = ({ id }) => {
  const history = useHistory();
  return (
    <VStack>
      <Heading>Invalid employee id</Heading>
      <Text>
        There is no employee with id of &quot;{id}&quot; in our records.
        You&apos;ll be redirected shortly.
      </Text>
      {setTimeout(() => {
        history.push("/employees");
      }, 1500)}
    </VStack>
  );
};

export const EmployeeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  // An operation can be either a deletion or an edit
  // Since they're mutually exclusive (can't happen at the same time) they can share state
  const [operationStatus, setOperationStatus] = useState({
    status: "none",
    action: "update",
  } as OperationStatus);

  const getMainContent = (
    employeeData: EmployeeState,
    departmentData: DepartmentState
  ): JSX.Element => {
    if (Object.keys(employeeData.indices).indexOf(id) === -1)
      return <Error id={id} />;
    return (
      <VStack>
        <HStack spacing="20">
          <VStack>
            {getEmployeeCard(employeeData, departmentData, id)}
            <HStack paddingTop="20px" spacing="5">
              <FormDialogButton
                employee={employeeData.data[employeeData.indices[id]]}
                departments={departmentData.data}
                onSubmit={(newData: {
                  info: EmployeeInfo;
                  departmentId?: string;
                }) =>
                  editEmployee(
                    employeeData,
                    id,
                    departmentData,
                    newData,
                    setOperationStatus
                  )
                }
                formType="Edit"
                disabled={operationStatus.status !== "none"}
              />
              <DeleteButtonDialog
                onDelete={() =>
                  deleteEmployee(employeeData, id, setOperationStatus, () =>
                    history.push("/employees")
                  )
                }
                disabled={operationStatus.status !== "none"}
              />
            </HStack>
          </VStack>
          <Wrap
            borderRadius="10px"
            h="70vh"
            w="40vw"
            overflowY="scroll"
            padding="10px"
          >
            <Heading size="lg" textAlign="left">
              About Me
            </Heading>
            {employeeBioPlaceholder.map((p) => (
              <Text key={p.section} textAlign="justify">
                {p.text}
              </Text>
            ))}
          </Wrap>
        </HStack>
        {getStatusMessage(operationStatus)}
      </VStack>
    );
  };

  return (
    <Grid marginTop="50px">
      <EmployeeContext.Consumer>
        {(employeeData) => (
          <DepartmentContext.Consumer>
            {(departmentData) => getMainContent(employeeData, departmentData)}
          </DepartmentContext.Consumer>
        )}
      </EmployeeContext.Consumer>
    </Grid>
  );
};
