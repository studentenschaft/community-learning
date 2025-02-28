import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ReactRouter5Adapter } from "use-query-params/adapters/react-router-5";
import { QueryParamProvider } from "use-query-params";
import App from "./app";
import { parse, stringify } from "query-string";
import React from "react";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <QueryParamProvider
      adapter={ReactRouter5Adapter}
      options={{ searchStringToObject: parse, objectToSearchString: stringify }}
    >
      
      <App />
      
    </QueryParamProvider>
  </BrowserRouter>,
);
