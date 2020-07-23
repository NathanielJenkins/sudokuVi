import React, { Component } from "react";

import Board from "./Components/Board";
import NavigationBar from "./Components/NavigationBar";

function App() {
	return (
		<div className="App">
			<NavigationBar />
			<Board />
		</div>
	);
}

export default App;
