import React from "react";
import { render, RenderResult } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import App from "../components/App";

// Thanks to https://github.com/miragejs/tutorial/blob/master/src/lib/test-helpers.js
export function visit(url: string): RenderResult {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <QueryParamProvider ReactRouterRoute={Route}>
        <App />
      </QueryParamProvider>
    </MemoryRouter>
  );
}
