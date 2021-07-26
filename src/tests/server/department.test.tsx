/**
 * @jest-environment jsdom
 */

import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import makeServer, { AppRegistry } from "../../server";
import { visit } from "../../utils/testing";
import "@testing-library/jest-dom";
import { Server } from "miragejs";
import { Department } from "../../types";

// The exact registry has to be shared from server to allow for Intellisense here
let server: Server<AppRegistry>;

beforeEach(async () => server = await makeServer("test"));
afterEach(async () => server.shutdown());

describe("Department", () => {
  
  /// GET => fetching data

  it("should display existing departments", async () => {
    const departments = [
      // We can take advantage of Mirage's factories here
      server.create("department"),
      server.create("department"),
      server.create("department"),
    ];
    visit("/", true);
    await waitForElementToBeRemoved(screen.queryByText("Loading..."), {timeout: 1500});
    for(let i = 0; i < departments.length; i++) {
      const department = departments[i] as Department;
      expect(department.id).toEqual((i+1).toString());
      expect(department.info).toEqual({name: `Example department ${i.toString()}`});
      expect(screen.queryByText(department.info.name)).toBeInTheDocument();
    }
    expect(screen.queryByText("There are no employees matching your selected filters.")).toBeInTheDocument();
  });

  /// POST => creating data
  
  it("should display the department after creating it", async () => {
    await fetch("/api/departments/", {method: "POST", body: JSON.stringify({name: "Example Department"})})
      .then(res => {
        expect(res.status).toEqual(201);
        res.json()
        .then(json => expect(json.department.info.name).toEqual("Example Department"));
      });
    visit("/", true);
    await waitForElementToBeRemoved(screen.queryByText("Loading..."), {timeout: 1500});
    expect(screen.queryByText("Example Department")).toBeInTheDocument();
    expect(screen.queryByText("There are no employees matching your selected filters.")).toBeInTheDocument();
  });
  
  it("should not create a department without a name", async () => {
    await fetch("/api/departments", {method: "POST", body: JSON.stringify({})})
      .then(res => {
        expect(res.status).toEqual(400);
        expect(res.headers.get("ErrorType")).toEqual("Exclusion");
        res.json()
          .then(json => expect(json.errors).toEqual(["name"]));
      });
  });

  it("should not create a department with a supplied id", async () => {
    await fetch("/api/departments", {method: "POST", body: JSON.stringify({name: "Invalid Department", id: "3"})})
      .then(res => {
        expect(res.status).toEqual(400);
        expect(res.headers.get("ErrorType")).toEqual("Invalid");
        res.json()
          .then(json => expect(json.errors).toEqual(["id"]));
      });
  });

  /// DELETE => deleting data
  
  it("should not display the department after deleting it", async () => {
    const department = server.create("department", {info: {name: "Example Department"}});
    expect(department.id).toEqual("1");
    await fetch("/api/departments/1", {method: "DELETE"})
      .then(res => {
        expect(res.status).toEqual(200);
      });
    visit("/", true);
    await waitForElementToBeRemoved(screen.queryByText("Loading..."), {timeout: 1500});
    expect(screen.queryByText("There are no departments matching your selected filters.")).toBeInTheDocument();
    expect(screen.queryByText("There are no employees matching your selected filters.")).toBeInTheDocument();
  });

  it("should not delete an invalid department", async () => {
    await fetch("/api/departments/1", {method: "DELETE"})
      .then(res => {
        expect(res.status).toEqual(400);
        expect(res.headers.get("ErrorType")).toEqual("Invalid");
        res.json()
          .then(json => expect(json.errors).toEqual(["id"]));
      });
  });

  /// PUT => updating data

  it("should display the new name after updating a department", async () => {
    const department = server.create("department", {info: {name: "Example Department"}});
    expect(department.id).toEqual("1");
    await fetch("/api/departments/1", {method: "PUT", body: JSON.stringify({name: "Updated Department"})})
      .then(res => {
        expect(res.status).toEqual(200);
      });
    visit("/", true);
    await waitForElementToBeRemoved(screen.queryByText("Loading..."), {timeout: 1500});
    expect(screen.queryByText("Updated Department")).toBeInTheDocument();
    expect(screen.queryByText("Example Department")).not.toBeInTheDocument();
    expect(screen.queryByText("There are no employees matching your selected filters.")).toBeInTheDocument();
  });

  it("should not update an invalid department", async () => {
    await fetch("/api/departments/1", {method: "PUT", body: JSON.stringify({name: "Updated Department"})})
      .then(res => {
        expect(res.status).toEqual(400);
        expect(res.headers.get("ErrorType")).toEqual("Invalid");
        res.json()
          .then(json => expect(json.errors).toEqual(["id"]));
      });
    visit("/", true);
  });

  it("should not update an department without a new name", async () => {
    const department = server.create("department", {info: {name: "Example Department"}});
    expect(department.id).toEqual("1");
    await fetch("/api/departments/1", {method: "PUT", body: JSON.stringify({})})
      .then(res => {
        expect(res.status).toEqual(400);
        expect(res.headers.get("ErrorType")).toEqual("Exclusion");
        res.json()
          .then(json => expect(json.errors).toEqual(["name"]));
      });
  });
});