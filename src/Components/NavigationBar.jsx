import React, { Component } from "react";
import { Navbar } from "react-bootstrap";

import styled from "styled-components";

const Styled = styled.div``;

class NavigationBar extends Component {
	state = {};
	render() {
		return (
			<Styled>
				<Navbar bg="dark" variant="dark">
					<Navbar.Brand href="/">Sudoku Solver</Navbar.Brand>
				</Navbar>
			</Styled>
		);
	}
}

export default NavigationBar;
