import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "mobx-react";
import "./styles.css";
import store from "./stores";
import HomePage from "./pages/home.page";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Provider {...store}>
            <HomePage />
        </Provider>
    </React.StrictMode>
);
