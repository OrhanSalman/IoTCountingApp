import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import BaseView from "./views/BaseView";
import BaseDataView from "./views/Data/BaseDataView";
import BaseInferenceView from "./views/Inference/BaseInferenceView";
import BaseNotifcationsView from "./views/Notifications/BaseNotifcationsView";
import BaseSettingsView from "./views/Settings/BaseSettingsView";
import LogsView from "./views/Notifications/pages/LogsView";
import CountsView from "./views/Data/pages/CountsView";
import RoutesView from "./views/Data/pages/RoutesView";
import TimesView from "./views/Data/pages/TimesView";
import { DeviceProvider } from "./api/DeviceContext";

const App = () => {
  return (
    <Router>
      <DeviceProvider>
        <BaseView>
          <Routes>
            <Route path="/data/*" element={<BaseDataView />}>
              {/* TODO: */}
              <Route path="/data/counts" element={<CountsView />} />
              <Route path="/data/tracking" element={<RoutesView />} />
              <Route path="/data/times" element={<TimesView />} />
            </Route>
            <Route path="/inference/*" element={<BaseInferenceView />} />
            <Route path="/logs/*" element={<BaseNotifcationsView />}>
              {/* TODO: */}

              <Route path="errors" element={<LogsView filter="error" />} />
              <Route path="warnings" element={<LogsView filter="warning" />} />
              <Route path="infos" element={<LogsView filter="info" />} />
            </Route>
            <Route path="/settings/*" element={<BaseSettingsView />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BaseView>
      </DeviceProvider>
    </Router>
  );
};

export default App;
