import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UploadFileView from "./views/UploadFileView";
import GatewayProbabilitiesView from "./views/GatewayProbabilitiesView";
import ActivityAttributesView from "./views/ActivityAttributesView";
import ValidationsView from "./views/ValidationsView";
import TraceAttributesView from "./views/TraceAttributesView";
import EnterDeviationsView from "./views/EnterDeviationsView";
import NoiseLevelView from "./views/NoiseLevelView";
import DownloadView from "./views/DownloadView";
import LogDownload from "./components/DownloadLog"; // Import the LogDownload component
function App() {
		return (
			<Router>
				<Routes>
					<Route path="/" element={<UploadFileView />} />
					<Route path="/gateways" element={<GatewayProbabilitiesView />} />
					<Route path="/activity-attributes" element={<ActivityAttributesView />} />
					<Route path="/validations" element={<ValidationsView />} />
					<Route path="/trace-attributes" element={<TraceAttributesView />} />
					<Route path="/deviations" element={<EnterDeviationsView />} />
					<Route path="/noise" element={<NoiseLevelView />} />
					<Route path="/download" element={<DownloadView />} />
					<Route path="/log-download" element={<LogDownload />} /> {/* Add this route */}
				</Routes>
			</Router>
		);
}

export default App;

