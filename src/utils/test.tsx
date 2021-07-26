import React from "react";
import { render, RenderResult } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import App from "../components/App";
import TestPage from "../components/TestPage";

// Thanks to https://github.com/miragejs/tutorial/blob/master/src/lib/test-helpers.js
export function visit(url: string, toTestPage: boolean): RenderResult {
  return render(  
    <MemoryRouter initialEntries={[url]}>
      <QueryParamProvider ReactRouterRoute={Route}>
        {!toTestPage && <App />}
        {toTestPage && <TestPage />}
      </QueryParamProvider>
    </MemoryRouter>
  );
}
