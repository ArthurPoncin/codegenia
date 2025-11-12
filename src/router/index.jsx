import { createBrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import Home from "@/pages/Home.jsx";
import Collection from "@/pages/Collection.jsx";
import Settings from "@/pages/Settings.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "collection", element: <Collection /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);

export default router;
