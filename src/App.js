import React from "react";

import Board from "./Components/Board";
import NavigationBar from "./Components/NavigationBar";
import PhonePad from "./Components/PhonePad";

function App() {
	return (
		<div className="App">
			<NavigationBar />
			<Board />
			<PhonePad />
		</div>
	);
}

export default App;
