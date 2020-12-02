import React from "react";
import { Navbar, NavDropdown, Nav } from "react-bootstrap";

const NavigationBar = (props) => {
	const { onAllClear, onHandleGenerate } = props;
	return (
		<Navbar bg="dark" variant="dark">
			<Navbar.Brand href="/">Sudoku Solver</Navbar.Brand>
			<Navbar.Collapse id="basic-navbar-nav">
				<Nav className="">
					<NavDropdown title="New Game" id="basic-nav-dropdown">
						<NavDropdown.Item onClick={onAllClear}>New Blank</NavDropdown.Item>
						<NavDropdown.Item onClick={onHandleGenerate}>
							New Solvable Game
						</NavDropdown.Item>
					</NavDropdown>
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	);
};

export default NavigationBar;
