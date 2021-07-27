import { Department, DepartmentInfo, Employee, EmployeeInfo } from "../types";
import { Response } from "miragejs";
import { AppSchema, DepartmentResult, EmployeeResult } from "../server";
import _ from "lodash";

/**
 * Used for validating employee info input
 */
export const employeeInfoInstance: EmployeeInfo = {
  firstName: "Example",
  lastName: "Employee",
  pictureUrl: "",
  title: ""
};

/**
 * Used for validating department info input
 */
export const departmentInfoInstance: DepartmentInfo = {
  name: "Example Department",
};

/**
 * The result of a request body validation
 */
type RequestBodyValidationResult = {
  errorResponse: Response | null
}

/**
 * The result of a request id validation
 */
type RequestIdValidationResult = {
  errorResponse: Response | null,
  data: DepartmentResult | EmployeeResult | null,
}

/**
 * Validates a request's body
 * Meant to be used in the server to validate incoming HTTP requests
 * @model the DB model to validate against
 * @param body content to validate
 * @param requiredFields each of the fields that must be present
 * @returns an error HTTP response or null on success
 */
export const validateRequestBody = (model: "department" | "employee", body: Record<string, unknown> | null, optionalFields: string[] = []) : RequestBodyValidationResult => {
  const requiredFields = Object.keys((model === "employee" ? employeeInfoInstance : departmentInfoInstance));
  if(body === null)
    return {errorResponse: new Response(400, {ErrorType: "Exclusion"}, {errors: requiredFields})};
  
  const keys = Object.keys(body);
  let validRequiredFieldCount = 0;
  const processedFields: string[] = [];
  for(let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if(requiredFields.indexOf(key) === -1) {
      if(optionalFields.indexOf(key) === -1)
        return {errorResponse: new Response(400, {ErrorType: "Invalid"}, {errors: [key]})};
      continue;
    }
    validRequiredFieldCount++;
    processedFields.push(key);
  }

  if(validRequiredFieldCount !== requiredFields.length){
    const missingFields = requiredFields.filter(f => processedFields.indexOf(f) === -1);
    return {errorResponse: new Response(400, {ErrorType: "Exclusion"}, {errors: missingFields})};
  }
  return {errorResponse: null};
}

/**
 * Validates a request's id
 * @param model the DB model to validate against
 * @param schema the server's schema to use
 * @param id the id to search for
 * @returns an error HTTP response or the resulting model instance
 */
export const validateRequestId = (model: "department" | "employee", schema: AppSchema, id: string) : RequestIdValidationResult => {
  const entry = schema.find(model, id);
  if(!entry) {
    return {
      errorResponse: new Response(400, {ErrorType: "Invalid"}, {errors: ["id"]}),
      data: null,
    };
  }
  return {
    errorResponse: null,
    data: entry,
  };
}

// Validate whether an employee is in a department or not

export const validateEmployeeNotInDepartment = (departmentEmployees: Employee[], employee: Employee): void => {
  validateEmployeePresenceInDepartment(departmentEmployees, employee, false);
};

export const validateEmployeeInDepartment = (departmentEmployees: Employee[], employee: Employee): void => {
  validateEmployeePresenceInDepartment(departmentEmployees, employee, true);
};

export const validateEmployeePresenceInDepartment = (departmentEmployees: Employee[], employee: Employee, isPresent: boolean): void => {
  // Need to use lodash for deep equality, else it would wrongfully report objects don't match due to irrelevant details
  const matchingEntries = departmentEmployees.filter(e => 
    e.id === employee.id &&
    e.departmentId === employee.departmentId &&
    _.isEqual(e.info, employee.info)
  );
  expect(matchingEntries.length).toEqual((isPresent ? 1 : 0));
}

// Validate whether an employee matches an expected value

export const validateUnassignedEmployee = (actual: Employee, expected: Employee): void => {
  validateEmployee(actual, expected, true);
};

export const validateAssignedEmployee = (actual: Employee, expected: Employee): void => {
  validateEmployee(actual, expected, false);
};

export const validateEmployee = (actual: Employee, expected: Employee, isUnassigned: boolean): void => {
  expect(expected.info).toEqual(actual.info);
  expect(expected.id).toEqual(actual.id);
  expect(expected.departmentId).toEqual(isUnassigned ? undefined : actual.departmentId);
};

// Validate whether a department matches an expected value

export const validateDepartment = (actual: Department, expected: Department): void => {
  expect(expected.info).toEqual(actual.info);
  expect(expected.id).toEqual(actual.id);
};