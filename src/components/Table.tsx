import { DeleteIcon, EditIcon, SearchIcon } from "@chakra-ui/icons";
import { HStack, IconButton, Td, Tfoot } from "@chakra-ui/react";
import { Table, Tbody, Th, Thead, Tr } from "@chakra-ui/table";
import React from "react";
import { Link, useHistory } from "react-router-dom";
import {
  DepartmentState,
  EmployeeInfo,
  EmployeeState,
  OperationStatus,
  OperationStatusSetter,
} from "../types";
import { deleteEmployee, editEmployee } from "../utils/actions";
import { generateDepartmentsMap } from "../utils/data";
import { DeleteButtonDialog, FormDialogButton } from "./Dialog";

export const EmployeeTable: React.FC<{
  employees: EmployeeState;
  departments: DepartmentState;
  operationStatus: OperationStatus;
  setOperationStatus: OperationStatusSetter;
}> = ({ employees, departments, operationStatus, setOperationStatus }) => {
  const history = useHistory();
  const departmentNames = generateDepartmentsMap(departments.data);

  const getActionButtons = (
    employeeId: string,
    employees: EmployeeState,
    departments: DepartmentState,
    operationStatus: OperationStatus,
    setOperationStatus: OperationStatusSetter
  ): JSX.Element => {
    const expandButton = (
      <Link to={`/employees/${employeeId}`}>
        <IconButton
          aria-label={`Visit employee ${employeeId}'s profile`}
          icon={<SearchIcon />}
          size="sm"
        ></IconButton>
      </Link>
    );
    const editButton = (
      <FormDialogButton
        employee={employees.data[employees.indices[employeeId]]}
        departments={departments.data}
        onSubmit={(newData: { info: EmployeeInfo; departmentId?: string }) =>
          editEmployee(
            employees,
            employeeId,
            departments,
            newData,
            setOperationStatus
          )
        }
        formType="Edit"
        icon={<EditIcon />}
        disabled={operationStatus.status !== "none"}
      />
    );
    const deleteButton = (
      <DeleteButtonDialog
        onDelete={() =>
          deleteEmployee(employees, employeeId, setOperationStatus, () => {
            history.push("/");
          })
        }
        icon={<DeleteIcon />}
        disabled={operationStatus.status !== "none"}
      />
    );
    return (
      <HStack>
        {expandButton}
        {editButton}
        {deleteButton}
      </HStack>
    );
  };

  const employeeTableRows = employees.data.map((e) => (
    <Tr key={e.id}>
      <Td>{e.info.firstName}</Td>
      <Td>{e.info.lastName}</Td>
      <Td>{e.info.title}</Td>
      <Td>{e.departmentId ? departmentNames[e.departmentId] : "None"}</Td>
      <Td>
        {getActionButtons(
          e.id,
          employees,
          departments,
          operationStatus,
          setOperationStatus
        )}
      </Td>
      <Td></Td>
    </Tr>
  ));
  const tableInfo = (
    <Tr>
      <Th>First Name</Th>
      <Th>Last Name</Th>
      <Th>Title</Th>
      <Th>Department</Th>
      <Th>Actions</Th>
    </Tr>
  );

  return (
    <Table w="60vw">
      <Thead>{tableInfo}</Thead>
      <Tbody>{employeeTableRows}</Tbody>
      <Tfoot>{tableInfo}</Tfoot>
    </Table>
  );
};
