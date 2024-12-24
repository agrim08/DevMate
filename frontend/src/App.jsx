import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { Provider } from "react-redux";
import appStore from "./utils/store";
import Feed from "./components/Feed";
import Body from "./components/Body";
import Connections from "./components/Connections";
import Requests from "./components/Requests";

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Body />}>
            <Route index element={<Feed />} /> {/* Default route */}
            <Route path="login" element={<Login />} />
            <Route path="profile" element={<Profile />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="requests" element={<Requests />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
