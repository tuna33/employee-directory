import { DepartmentInfo, EmployeeInfo } from "../types";
import { Response } from "miragejs";
import { AppSchema, DepartmentResult, EmployeeResult } from "../server";

/**
 * Used for validating employee info input
 */
export const employeeInfoInstance: EmployeeInfo = {
  firstName: "",
  lastName: "",
  pictureUrl: "",
  title: ""
};

/**
 * Used for validating department info input
 */
export const departmentInfoInstance: DepartmentInfo = {
  name: "",
}

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
export const validateRequestBody = (model: "department" | "employee", body: Record<string, unknown> | null) : RequestBodyValidationResult => {
  const requiredFields = Object.keys((model === "employee" ? employeeInfoInstance : departmentInfoInstance));
  if(body === null)
    return {errorResponse: new Response(400, {ErrorType: "Exclusion"}, {errors: requiredFields})};
  
  const keys = Object.keys(body);
  let validFieldCount = 0;
  const processedFields: string[] = [];
  for(let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if(requiredFields.indexOf(key) === -1)
      return {errorResponse: new Response(400, {ErrorType: "Invalid"}, {errors: [key]})};
    validFieldCount++;
    processedFields.push(key);
  }

  if(validFieldCount !== requiredFields.length) {
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