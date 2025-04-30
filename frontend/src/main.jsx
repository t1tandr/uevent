import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import store from './store/store.js';
import { Provider } from 'react-redux'
import { ThemeProvider as NextThemesProvider } from "next-themes";

import App from "./App.jsx";
import { ProviderHero } from "./provider.tsx";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProviderHero>
        <NextThemesProvider defaultTheme="system" attribute="class">
          <Provider store={store}>
            <App />
          </Provider>
        </NextThemesProvider>
      </ProviderHero>
    </BrowserRouter>
  </React.StrictMode>,
);