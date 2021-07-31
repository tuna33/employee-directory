import React from "react";
import {
  DepartmentState,
  Employee,
  EmployeeInfo,
  EmployeeState,
  OperationStatusSetter,
} from "../types";
import { EmployeeCard } from "../components/Card";

/**
 * Deletes an employee
 * @param employees global employee state
 * @param employeeId id of employee to delete
 * @param setOperationStatus operation status setter
 * @param redirect wrapper around an url push
 */
export const deleteEmployee = (
  employees: EmployeeState,
  employeeId: string,
  setOperationStatus: OperationStatusSetter,
  redirect: () => unknown
): void => {
  setOperationStatus({ status: "in progress", action: "delete" });
  fetch(`/api/employees/${employeeId}`, { method: "DELETE" }).then((res) => {
    if (res.status !== 200) {
      setOperationStatus({ status: "failure", action: "delete" });
      setTimeout(
        () => setOperationStatus({ status: "none", action: "delete" }),
        1000
      );
      return;
    }
    setOperationStatus({ status: "success", action: "delete" });
    // Delete the employee from the cache, and redirect to employees page
    employees.data = employees.data.filter((e) => e.id !== employeeId);
    // The new data array needs all indices to be adjusted
    const indices: Record<string, number> = {};
    let beforeId = true;
    for (const [entry, index] of Object.entries(employees.indices)) {
      if (entry === employeeId) {
        beforeId = false;
      } else {
        indices[entry] = beforeId ? index : index - 1;
      }
    }
    employees.indices = indices;
    setTimeout(() => {
      // Caller will configure what endpoint to redirect to
      redirect();
      setOperationStatus({ status: "none", action: "delete" });
    }, 1000);
  });
};

/**
 * Edit (update) an employee
 * Note: this uses the `replacement` variable for the changes
 * It is manipulated by the edit form
 * @param employees global employee state
 * @param employeeId id of employee to update
 * @param departments global department state
 * @param newData new data from the edit form
 * @param setOperationStatus operation status setter
 */
export const editEmployee = (
  employees: EmployeeState,
  employeeId: string,
  departments: DepartmentState,
  newData: { info: EmployeeInfo; departmentId?: string },
  setOperationStatus: OperationStatusSetter
): void => {
  setOperationStatus({ status: "in progress", action: "update" });
  fetch(`/api/employees/${employeeId}`, {
    method: "PUT",
    body: JSON.stringify({
      ...newData.info,
      departmentId: newData.departmentId,
    }),
  }).then((res) => {
    if (res.status !== 200) {
      setOperationStatus({ status: "failure", action: "update" });
      setTimeout(
        () => setOperationStatus({ status: "none", action: "update" }),
        1000
      );
      return;
    }

    // Only valid departments are shown on the edit form
    // However, from the time they're rendered to when this update happens the department may have been invalidated
    // Have department cleanup be responsible for invalidating the cache entry *first*
    // That way, here we only have to check for its existance
    const requestedDepartmentId = newData.departmentId;
    if (requestedDepartmentId) {
      if (!departments.indices[requestedDepartmentId]) {
        // The id doesn't have a corresponding index (and thus no data entry)
        // Operation has failed
        setOperationStatus({ status: "failure", action: "update" });
        setTimeout(() => {
          setOperationStatus({ status: "none", action: "update" });
        }, 1000);
      }
    }

    // Update the employee on the cache **before** updating the status
    // This is so that the new values are used on the render
    // There's also no need to update the indices themselves, or the other employee entries
    const employeeIndex = employees.indices[employeeId];
    employees.data[employeeIndex] = {
      id: employeeId,
      info: newData.info,
      departmentId: newData.departmentId,
    };
    setOperationStatus({ status: "success", action: "update" });

    setTimeout(() => {
      setOperationStatus({ status: "none", action: "update" });
    }, 1000);
  });
};

export const addEmployee = (
  employees: EmployeeState,
  departments: DepartmentState,
  newData: { info: EmployeeInfo; departmentId?: string },
  setOperationStatus: OperationStatusSetter
): void => {
  setOperationStatus({ status: "in progress", action: "add" });
  fetch(`/api/employees/`, {
    method: "POST",
    body: JSON.stringify({
      ...newData.info,
      departmentId: newData.departmentId,
    }),
  }).then((res) => {
    if (res.status !== 201) {
      setOperationStatus({ status: "failure", action: "add" });
      setTimeout(
        () => setOperationStatus({ status: "none", action: "add" }),
        1000
      );
      return;
    }

    // Only valid departments are shown on the edit form
    // However, from the time they're rendered to when this update happens the department may have been invalidated
    // Have department cleanup be responsible for invalidating the cache entry *first*
    // That way, here we only have to check for its existance
    const requestedDepartmentId = newData.departmentId;
    if (requestedDepartmentId) {
      if (!departments.indices[requestedDepartmentId]) {
        // The id doesn't have a corresponding index (and thus no data entry)
        // Operation has failed
        setOperationStatus({ status: "failure", action: "update" });
        setTimeout(() => {
          setOperationStatus({ status: "none", action: "update" });
        }, 1000);
      }
    }

    // Need to get the id assigned to this employee by the server to store it in the cache
    res.json().then((json) => {
      const employee = json.employee as Employee;
      const employeeIndex = employees.data.push(employee) - 1;
      employees.indices[employee.id] = employeeIndex;

      // Update the employee on the cache **before** updating the status
      // This is so that the new values are used on the render
      setOperationStatus({ status: "success", action: "update" });

      setTimeout(() => {
        setOperationStatus({ status: "none", action: "update" });
      }, 1000);
    });
  });
};

/**
 * Gets an employee's card
 * @param employees global employee state
 * @param departments global department state
 * @returns EmployeeCard element for this employee
 */
export const getEmployeeCard = (
  employees: EmployeeState,
  departments: DepartmentState,
  employeeId: string
): JSX.Element => {
  const employeeIndex = employees.indices[employeeId];
  const employee = employees.data[employeeIndex];
  const departmentId = employee.departmentId;
  let departmentName: string;
  if (!departmentId) {
    departmentName = "No Department";
  } else {
    const departmentIndex = departments.indices[departmentId];
    departmentName = departments.data[departmentIndex].info.name;
  }
  const card = (
    <EmployeeCard
      key={employeeId}
      employee={employee}
      departmentName={departmentName}
      url={`/employees/${employee.id}`}
      learnMore={false}
    />
  );
  return card;
};
