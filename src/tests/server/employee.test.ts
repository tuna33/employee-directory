/**
 * @jest-environment jsdom
 */

import makeServer, { AppRegistry } from "../../server";
import "@testing-library/jest-dom";
import { Server } from "miragejs";
import { Department, Employee } from "../../types";
import {
  employeeInfoInstance,
  validateAssignedEmployee,
  validateDepartment,
  validateEmployeeInDepartment,
  validateEmployeeNotInDepartment,
  validateUnassignedEmployee,
} from "../../utils/validation";

// The exact registry has to be shared from server to allow for Intellisense here
let server: Server<AppRegistry>;

beforeEach(async () => (server = await makeServer("test")));
afterEach(async () => server.shutdown());

// For checking all required fields are being enforced
const requiredFields = Object.keys(employeeInfoInstance);
const requiredFieldsString = requiredFields
  .reduce((a, b) => `${a}, ${b}`, "")
  .substring(2);

// Requests that revolve around assigned employees (those with a department) will need extra checks on the department itself
// The first fetch request performs and validates employee actions, the second one validates their department actions if no previous errors

describe("Employee", () => {
  /// GET => fetching data

  it("should get all existing unassigned and assigned employees (with assigned's departments)", async () => {
    // We can use factories here as well (one employee each)
    const employees = [
      server.create("employee"),
      server.create("employee"),
      server.create("employee"),
    ];
    const departments = [
      server.create("department", { employees: [employees[0]] }),
      server.create("department", { employees: [employees[1]] }),
    ];
    await fetch("/api/employees/", { method: "GET" }).then((res) => {
      expect(res.status === 200);
      res.json().then((json) => {
        for (let i = 0; i < departments.length; i++) {
          if (i !== 2) {
            validateDepartment(
              json.departments[i],
              departments[i] as Department
            );
            validateAssignedEmployee(json.employees[i], employees[i]);
          } else {
            validateUnassignedEmployee(json.departments[i], employees[i]);
          }
        }
      });
    });
  });

  it.todo("should get a valid employee");
  it.todo("should not get an invalid employee");

  /// POST => creating data

  it("should create a valid unassigned employee", async () => {
    await fetch("/api/employees/", {
      method: "POST",
      body: JSON.stringify(employeeInfoInstance),
    }).then((res) => {
      expect(res.status).toEqual(201);
      res.json().then((json) =>
        validateUnassignedEmployee(json.employee, {
          info: employeeInfoInstance,
          id: "1",
        })
      );
    });
  });

  it("should create a valid assigned employee", async () => {
    const department = server.create("department");
    expect(department.id).toEqual("1");

    let employee: Employee;
    await fetch("/api/employees/", {
      method: "POST",
      body: JSON.stringify({
        ...employeeInfoInstance,
        departmentId: department.id,
      }),
    }).then((res) => {
      expect(res.status).toEqual(201);
      res.json().then((json) => {
        employee = json.employee as Employee;
        validateAssignedEmployee(employee, {
          info: employeeInfoInstance,
          id: "1",
          departmentId: department.id,
        });
      });
    });
    await fetch(`/api/departments/${department.id}/employees`).then((res) => {
      expect(res.status === 200);
      res
        .json()
        .then((json) => validateEmployeeInDepartment(json.employees, employee));
    });
  });

  it(`should not create an unassigned employee without: ${requiredFieldsString}`, async () => {
    await fetch("/api/employees", {
      method: "POST",
      body: JSON.stringify({}),
    }).then((res) => {
      expect(res.status).toEqual(400);
      expect(res.headers.get("ErrorType")).toEqual("Exclusion");
      res.json().then((json) => expect(json.errors).toEqual(requiredFields));
    });
  });

  it(`should not create an assigned employee without: ${requiredFieldsString}`, async () => {
    const department = server.create("department");
    expect(department.id).toEqual("1");

    await fetch("/api/employees", {
      method: "POST",
      body: JSON.stringify({ departmentId: department.id }),
    }).then((res) => {
      expect(res.status).toEqual(400);
      expect(res.headers.get("ErrorType")).toEqual("Exclusion");
      res.json().then((json) => expect(json.errors).toEqual(requiredFields));
    });
  });

  /// DELETE => deleting data

  it("should delete a valid unassigned employee", async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");

    await fetch(`/api/employees/${employee.id}`, { method: "DELETE" }).then(
      (res) => {
        expect(res.status).toEqual(200);
      }
    );
  });

  it("should delete a valid assigned employee", async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");
    const department = server.create("department", {
      employees: [employee, server.create("employee")],
    });
    expect(department.id).toEqual("1");

    await fetch(`/api/employees/${department.id}`, { method: "DELETE" }).then(
      (res) => {
        expect(res.status).toEqual(200);
      }
    );
    await fetch(`/api/departments/${department.id}/employees`).then((res) => {
      expect(res.status === 200);
      res.json().then((json) =>
        validateEmployeeNotInDepartment(json.employees, {
          id: employee.id,
          info: employee.info,
          departmentId: department.id,
        })
      );
    });
  });

  it("should not delete an invalid (unassigned) employee", async () => {
    await fetch("/api/employees/1", { method: "DELETE" }).then((res) => {
      expect(res.status).toEqual(400);
      expect(res.headers.get("ErrorType")).toEqual("Invalid");
      res.json().then((json) => expect(json.errors).toEqual(["id"]));
    });
  });

  /// PUT => updating data

  it("should update a valid unassigned employee's info to valid info", async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");

    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      body: JSON.stringify(employeeInfoInstance),
    }).then((res) => {
      expect(res.status === 200);
      res.json().then((json) =>
        validateUnassignedEmployee(json.employee, {
          id: employee.id,
          info: employeeInfoInstance,
        })
      );
    });
  });

  it("should update a valid unassigned employee's department to a valid department", async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");
    const department = server.create("department");
    expect(department.id).toEqual("1");

    let employeeReceived: Employee;
    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      body: JSON.stringify({ ...employee.info, departmentId: department.id }),
    }).then((res) => {
      expect(res.status === 200);
      res.json().then((json) => {
        employeeReceived = json.employee;
        validateAssignedEmployee(employeeReceived, {
          id: employee.id,
          info: employee.info,
          departmentId: department.id,
        });
      });
    });
    await fetch(`/api/departments/${department.id}/employees`).then((res) => {
      expect(res.status === 200);
      res
        .json()
        .then((json) =>
          validateEmployeeInDepartment(json.employees, employeeReceived)
        );
    });
  });

  it("should update a valid unassigned employee's department and info to valid department and info", async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");
    const department = server.create("department");
    expect(department.id).toEqual("1");

    let employeeReceived: Employee;
    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...employeeInfoInstance,
        departmentId: department.id,
      }),
    }).then((res) => {
      expect(res.status === 200);
      res.json().then((json) => {
        employeeReceived = json.employee;
        validateAssignedEmployee(employeeReceived, {
          id: employee.id,
          info: employeeInfoInstance,
          departmentId: department.id,
        });
      });
    });
    await fetch(`/api/departments/${department.id}/employees`).then((res) => {
      expect(res.status === 200);
      res
        .json()
        .then((json) =>
          validateEmployeeInDepartment(json.employees, employeeReceived)
        );
    });
  });

  it("should update a valid assigned employee's info to valid info", async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");
    const department = server.create("department", { employees: [employee] });
    expect(department.id).toEqual("1");

    let employeeReceived: Employee;
    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...employeeInfoInstance,
        departmentId: department.id,
      }),
    }).then((res) => {
      expect(res.status === 200);
      res.json().then((json) => {
        employeeReceived = json.employee;
        validateAssignedEmployee(employeeReceived, {
          id: employee.id,
          info: employeeInfoInstance,
          departmentId: department.id,
        });
      });
    });
    await fetch(`/api/departments/${department.id}/employees`).then((res) => {
      expect(res.status === 200);
      res.json().then((json) => {
        validateEmployeeInDepartment(json.employees, employeeReceived);
      });
    });
  });

  it("should update a valid assigned employee's department to a valid department", async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");
    const oldDepartment = server.create("department", {
      employees: [employee],
    });
    expect(oldDepartment.id).toEqual("1");
    const newDepartment = server.create("department");
    expect(newDepartment.id).toEqual("2");

    let employeeReceived: Employee;
    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...employee.info,
        departmentId: newDepartment.id,
      }),
    }).then((res) => {
      expect(res.status === 200);
      res.json().then((json) => {
        employeeReceived = json.employee;
        validateAssignedEmployee(employeeReceived, {
          id: employee.id,
          info: employee.info,
          departmentId: newDepartment.id,
        });
      });
    });
    await fetch(`/api/departments/${newDepartment.id}/employees`).then(
      (res) => {
        expect(res.status === 200);
        res.json().then((json) => {
          validateEmployeeInDepartment(json.employees, employeeReceived);
        });
      }
    );
    await fetch(`/api/departments/${oldDepartment.id}/employees`).then(
      (res) => {
        expect(res.status === 200);
        res.json().then((json) => {
          validateEmployeeNotInDepartment(json.employees, employeeReceived);
        });
      }
    );
  });

  it("should update a valid assigned employee's department to a valid department and info", async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");
    const oldDepartment = server.create("department", {
      employees: [employee],
    });
    expect(oldDepartment.id).toEqual("1");
    const newDepartment = server.create("department");
    expect(newDepartment.id).toEqual("2");

    let employeeReceived: Employee;
    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...employeeInfoInstance,
        departmentId: newDepartment.id,
      }),
    }).then((res) => {
      expect(res.status === 200);
      res.json().then((json) => {
        employeeReceived = json.employee;
        validateAssignedEmployee(employeeReceived, {
          id: employee.id,
          info: employeeInfoInstance,
          departmentId: newDepartment.id,
        });
      });
    });
    await fetch(`/api/departments/${newDepartment.id}/employees`).then(
      (res) => {
        expect(res.status === 200);
        res.json().then((json) => {
          validateEmployeeInDepartment(json.employees, employeeReceived);
        });
      }
    );
    await fetch(`/api/departments/${oldDepartment.id}/employees`).then(
      (res) => {
        expect(res.status === 200);
        res.json().then((json) => {
          validateEmployeeNotInDepartment(json.employees, employeeReceived);
        });
      }
    );
  });

  it(`should not update a valid assigned employee's info without: ${requiredFieldsString}`, async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");
    const department = server.create("department", { employees: [employee] });
    expect(department.id).toEqual("1");

    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      body: JSON.stringify({}),
    }).then((res) => {
      expect(res.status).toEqual(400);
      expect(res.headers.get("ErrorType")).toEqual("Exclusion");
      res.json().then((json) => expect(json.errors).toEqual(requiredFields));
    });
  });

  it(`should not update a valid unassigned employee's info without: ${requiredFieldsString}`, async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");

    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      body: JSON.stringify({}),
    }).then((res) => {
      expect(res.status).toEqual(400);
      expect(res.headers.get("ErrorType")).toEqual("Exclusion");
      res.json().then((json) => expect(json.errors).toEqual(requiredFields));
    });
  });

  it("should not update a valid assigned employee's department to an invalid department", async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");
    const department = server.create("department", { employees: [employee] });
    expect(department.id).toEqual("1");

    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      body: JSON.stringify({ ...employee.info, departmentId: "2" }),
    }).then((res) => {
      expect(res.status).toEqual(400);
      expect(res.headers.get("ErrorType")).toEqual("Invalid");
      res.json().then((json) => expect(json.errors).toEqual(["departmentId"]));
    });
  });

  it("should not update a valid unassigned employee's department to an invalid department", async () => {
    const employee = server.create("employee");
    expect(employee.id).toEqual("1");

    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      body: JSON.stringify({ ...employee.info, departmentId: "1" }),
    }).then((res) => {
      expect(res.status).toEqual(400);
      expect(res.headers.get("ErrorType")).toEqual("Invalid");
      res.json().then((json) => expect(json.errors).toEqual(["departmentId"]));
    });
  });

  it("should not update an invalid employee's info or department", async () => {
    await fetch("/api/employees/1", {
      method: "PUT",
      body: JSON.stringify({ ...employeeInfoInstance, departmentId: "1" }),
    }).then((res) => {
      expect(res.status).toEqual(400);
      expect(res.headers.get("ErrorType")).toEqual("Invalid");
      res.json().then((json) => expect(json.errors).toEqual(["id"]));
    });
  });
});
