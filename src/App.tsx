import { RouterProvider, createHashRouter } from "react-router-dom";
import HomeScreen from "./HomeScreen";
import FeedScreen from "./FeedScreen";

const hashRouter = createHashRouter([
  {
    path: "/",
    children: [
      {
        index: true,
        Component: HomeScreen,
      },
      {
        path: "feed",
        Component: FeedScreen,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={hashRouter} />;
}

export default App;
