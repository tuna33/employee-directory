/**
 * @jest-environment jsdom
 */

import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import makeServer, { AppRegistry } from "../server";
import { visit } from "../utils/testing";
import "@testing-library/jest-dom";
import { Server } from "miragejs";

// The exact registry has to be shared from server to allow for Intellisense here
let server: Server<AppRegistry>;

// Typescript will prevent compilation of any attributes to server.create()/etc as long as the correct AppRegistry is applied
// Those calls are performed only on the (mock) server itself and (potentially) on this test suite
// They are type checked with the exception of an empty object ({}) which would create the respective object through its factory default values
// For that reason, it only really makes sense to check the HTTP requests themselves (either through the testbench or `fetch` directly)
// The mock (and real) server should validate the input they receive first before calling server.create()/etc

// For every invalid (fetch) test possibility, there are two reasons why that operation can fail
// 1. It missed one or more required fields
// 2. It included one or more invalid fields
// 3. It included one or more unnecessary fields

beforeEach(async () => server = await makeServer("test"));
afterEach(async () => server.shutdown());

describe("Misc", () => {
  it("should display nothing with empty data", async () => {
    visit("/", true);
    await waitForElementToBeRemoved(screen.queryByText("Loading..."), {timeout: 1500});
    expect(screen.queryByText("There are no employees matching your selected filters.")).toBeInTheDocument();
    expect(screen.queryByText("There are no departments matching your selected filters.")).toBeInTheDocument();
  });
});

describe("Department", () => {
  
  /// GET => fetching data

  it("should display existing departments", async () => {
    const departments = [
      server.create("department", {info: {name: "Example Department 1"}}),
      server.create("department", {info: {name: "Example Department 2"}}),
      server.create("department", {info: {name: "Example Department 3"}}),
    ];
    visit("/", true);
    await waitForElementToBeRemoved(screen.queryByText("Loading..."), {timeout: 1500});
    for(let i = 0; i < departments.length; i++) {
      const department = departments[i];
      expect(department.id).toEqual((i+1).toString());
      expect(department.info).toEqual(departments[i].info);
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
        expect(res.headers.get("ErrorType")).toEqual("Inclusion");
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