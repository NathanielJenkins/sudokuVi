import React, { Component } from "react";
import { Navbar, NavDropdown, Nav } from "react-bootstrap";

import styled from "styled-components";

const Styled = styled.div``;

class NavigationBar extends Component {
	state = {};
	render() {
		return (
			<Styled>
				<Navbar bg="dark" variant="dark">
					<Navbar.Brand href="/">Sudoku Solver</Navbar.Brand>
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="ml-auto">
							<NavDropdown
								title="New Game"
								className="ml-auto"
								id="basic-nav-dropdown"
							>
								<NavDropdown.Item>New Blank</NavDropdown.Item>
								<NavDropdown.Item>New Solvable Game</NavDropdown.Item>
							</NavDropdown>
						</Nav>
					</Navbar.Collapse>
				</Navbar>
			</Styled>
		);
	}
}

export default NavigationBar;
