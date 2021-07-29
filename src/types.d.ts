/**
 * An employee that belongs to a specific department
 */
export interface Employee {
  id: string;
  info: EmployeeInfo;
  departmentId?: string;
}

/**
 * An employee's personal information
 */
export interface EmployeeInfo {
  firstName: string;
  lastName: string;
  pictureUrl: string;
  title: string;
}

/**
 * A department that consists of 0, 1, or more employees
 */
export interface Department {
  id: string;
  info: DepartmentInfo;
}

/**
 * A department's information
 */
export interface DepartmentInfo {
  name: string;
}

/**
 * Global state for employee data
 */
interface EmployeeState {
  data: Employee[];
  indices: Record<string, number>; // To get an employee's data index from its id
  isLoading: boolean; // Loading data after a fetch
  isUpdating: boolean; // Sending data for an update
}

/**
 * Global state for department data
 */
interface DepartmentState {
  data: Department[];
  indices: Record<string, number>; // To get a department's data index from its id
  isLoading: boolean; // Loading data after a fetch
  isUpdating: boolean; // Sending data for an update
}
