import "./App.css";
import { Router, Switch, Route, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <div className="App">
      <switch>
        <Route path="/login" render={(props) => <Login {...props} />} />
        <Route path="/signup" render={(props) => <SignUp {...props} />} />
        <Route path="/home" render={(props) => <Home {...props} />} />
        <Redirect exact from="/" to="/login" />
      </switch>
    </div>
  );
}

export default App;
