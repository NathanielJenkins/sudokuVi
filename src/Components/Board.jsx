import React, { Component } from "react";
import { ButtonGroup, Button, Container, Row, Col } from "react-bootstrap";
import styled from "styled-components";

const Styled = styled.div`
	.game-board {
		border: 1px solid black;
		width: 500px;
		height: 500px;
	}
	.controls {
		width: 500px;
	}

	@media (max-width: 768px) {
		.game-board {
			width: 350px;
			height: 350px;
		}
		.controls {
			width: 350px;
		}
	}

	@media (max-width: 576px) {
		.game-board {
			width: 250px;
			height: 250px;
		}
		.controls {
			width: 250px;
			width: 100%;
		}
	}

	td:first-child {
		border-left: solid;
	}
	td:nth-child(3n) {
		border-right: solid;
	}
	tr:first-child {
		border-top: solid;
	}
	tr:nth-child(3n) td {
		border-bottom: solid;
	}
	td {
		height: 30px;
		width: 30px;
		border: 1px lightgrey solid;
		text-align: center;
	}
	td.bold {
		font-weight: bold;
	}
	.w {
		background-color: white;
	}
	.r {
		background-color: #ffe6e6;
	}
	.g {
		background-color: #deffe6;
	}
	.gr {
		background-color: #fffcde;
	}
`;

class Board extends Component {
	state = {
		currentlyRunning: false,
		steps: [],
		sudokuBoard: [],
		styleBoard: [],
		immutableNumbers: [],
		immutableType: true,
	};

	componentDidMount() {
		this.generate();
	}

	generate() {
		const { sudokuBoard, immutableNumbers, styleBoard } = this.initDataBoards();
		this.setState({ styleBoard });

		//set immutableNumbers before the solve since it requires it
		this.setState({ immutableNumbers }, () => {
			this.backtrack(0, 0, sudokuBoard, true);

			//now that we solved the board, lets delete part of it. Hold 12 numbers
			for (let i = 0; i < 30; i++) {
				const row = Math.floor(Math.random() * 9);
				const col = Math.floor(Math.random() * 9);
				immutableNumbers[row][col] = true;
			}

			this.clear(sudokuBoard, immutableNumbers);
			this.setState({ steps: [] });
		});
	}

	solveSudoku = () => {
		//solves the sudokuBoard
		let sudokuBoard = this.returnCopyOf2DArray(this.state.sudokuBoard);
		this.backtrack(0, 0, sudokuBoard, false);
		this.setState({
			styleBoard: this.clearStyleBoard(),
			sudokuBoard,
		});
	};

	delay = (ms) => new Promise((res) => setTimeout(res, ms));

	viz = () => {
		if (this.state.currentlyRunning) return;

		this.setState({ currentlyRunning: true }, async () => {
			let sudokuBoard = this.returnCopyOf2DArray(this.state.sudokuBoard);
			let styleBoard = this.returnCopyOf2DArray(this.state.styleBoard);
			const { immutableNumbers, steps } = this.state;
			//the board has not already been solved by the user
			if (steps.length === 0) {
				//create a copy of the board, not a reference
				const sudokuBoardCopy = [];

				for (var i = 0; i < sudokuBoard.length; i++)
					sudokuBoardCopy[i] = sudokuBoard[i].slice();

				//generate the steps with the sudokuBoardCopy so we don't alter the board
				this.backtrack(0, 0, this.returnCopyOf2DArray(sudokuBoard), false);
			}
			// the board has already been solved by the user so we need to clear it
			else this.clear(sudokuBoard, immutableNumbers);

			for (let i = 0; i < steps.length; i++) {
				if (!this.state.currentlyRunning) return;

				const step = this.state.steps[i];

				sudokuBoard[step.row][step.col] = step.value;

				this.colourBoard(step, styleBoard);
				this.setState({ sudokuBoard, styleBoard });
				await this.delay(100);
				this.clearBoard(step, styleBoard);
			}
		});
	};

	initDataBoards = () => {
		let sudokuBoard = [];
		let immutableNumbers = [];
		let styleBoard = [];

		//init the sudokuBoard, immutableNumbers and the styleBoar
		for (let i = 0; i < 9; i++) {
			sudokuBoard.push(new Array(9).fill(""));
			immutableNumbers.push(new Array(9).fill(false));
			styleBoard.push(new Array(9).fill("w"));
		}
		return { sudokuBoard, immutableNumbers, styleBoard };
	};

	//keeps the immutable numbers clears the rest
	clear = (sudokuBoard, immutableNumbers) => {
		//loop through all the squares and clear others
		for (let row = 0; row < 9; row++) {
			for (let col = 0; col < 9; col++) {
				if (!immutableNumbers[row][col]) sudokuBoard[row][col] = "";
			}
		}
		this.setState({ styleBoard: this.clearStyleBoard(), sudokuBoard });
	};

	//clears all numbers
	allClear = () => {
		this.setState(this.initDataBoards());
		this.setState({ steps: [] });
	};

	//sets all the squares in the styleboard to white and returns the cleared board
	clearStyleBoard = () => {
		//clear the styleboard
		const styleBoard = this.state.styleBoard;
		for (let row = 0; row < 9; row++) {
			for (let col = 0; col < 9; col++) {
				styleBoard[row][col] = "w";
			}
		}
		return styleBoard;
	};

	//takes an array an returns a shuffled version of that array
	shuffleArray = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	};

	//function that solves the board using a recursive backtracking strategy
	backtrack = (row, col, board, random) => {
		const { immutableNumbers, steps } = this.state;
		let end = false;

		if (row === 9) return true;

		// if the current column and row are immutable
		if (immutableNumbers[row][col]) {
			const rowCol = this.incrementRowCol(row, col);
			end = this.backtrack(rowCol[0], rowCol[1], board, random);

			// if the current column and row are changeable
		} else {
			let choiceArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			if (random) choiceArray = this.shuffleArray(choiceArray);

			for (let choice = 1; choice <= 9; choice++) {
				// if the current column and row can be changed
				const value = choiceArray.shift().toString();
				board[row][col] = value;

				const validBoard = this.isValidSudoku(board, row, col, value);

				steps.push({
					col: col,
					row: row,
					value: value,
					...validBoard,
				});

				if (validBoard.outcome) {
					const rowCol = this.incrementRowCol(row, col);
					end = this.backtrack(rowCol[0], rowCol[1], board, random);
					if (end) return true;
				}
			}
			board[row][col] = "";
			steps.push({
				col: col,
				row: row,
				value: "",
				outcome: null,
				reason: null,
				cells: [],
			});
		}
		return end;
	};

	//increments the row and column
	incrementRowCol = (row, col) => {
		col++;

		if (col === 9) {
			col = 0;
			row++;
		}

		return [row, col];
	};

	//checks if the current board is valid
	isValidSudoku = (board, row, col, value) => {
		let cells;
		let outcome;
		//row check
		cells = [];
		outcome = true;
		for (let i = 0; i < 9; i++) {
			cells.push([row, i]);
			if (board[row][i] === value && i !== col) {
				outcome = false;
			}
		}
		if (!outcome) return { outcome, reason: 0, cells };

		//col check
		cells = [];
		outcome = true;
		for (let i = 0; i < 9; i++) {
			cells.push([i, col]);
			if (board[i][col] === value && i !== row) {
				outcome = false;
			}
		}
		if (!outcome) return { outcome, reason: 1, cells };

		//square check
		const square = Math.floor(row / 3) + Math.floor(col / 3) * 3;
		const colStart = Math.floor(square / 3) * 3;
		const rowStart = (square % 3) * 3;

		cells = [];
		outcome = true;
		for (let r = rowStart; r < rowStart + 3; r++) {
			for (let c = colStart; c < colStart + 3; c++) {
				cells.push([r, c]);
				if (board[r][c] === value && row !== r && col !== c) {
					outcome = false;
				}
			}
		}
		if (!outcome) return { outcome: false, reason: 2, cells };

		return { outcome: true, reason: null, cells: [] };
	};

	buildBoard() {
		const { sudokuBoard, styleBoard, immutableNumbers } = this.state;
		// build the sudoku board from above
		const rows = [];
		for (const [indexRow, row] of sudokuBoard.entries()) {
			let ent = [];
			for (const [indexCol, value] of row.entries()) {
				let classNames = styleBoard[indexRow][indexCol];

				if (immutableNumbers[indexRow][indexCol])
					classNames += " font-weight-bold";

				ent.push(
					<td className={classNames} key={indexCol + "-" + indexRow}>
						<input
							className={classNames}
							size={1}
							style={{ border: "none" }}
							type="text"
							value={value}
							onChange={this.handleOnInput}
							name={`${indexRow} ${indexCol}`}
						/>
					</td>
				);
			}
			rows.push(
				<tr key={indexRow} className="game-row">
					{ent}
				</tr>
			);
		}
		return rows;
	}

	returnCopyOf2DArray = (array) => {
		const arrayCopy = [];
		for (var i = 0; i < array.length; i++) arrayCopy[i] = array[i].slice();
		return arrayCopy;
	};

	handleOnInput = ({ target }) => {
		const { value } = target;
		const [row, col] = target.name
			.split(" ")
			.map((stringIndex) => parseInt(stringIndex));
		let sudokuBoard = this.returnCopyOf2DArray(this.state.sudokuBoard);
		sudokuBoard[row][col] = value;
		this.setState({ sudokuBoard });
	};

	colourBoard = (step, styleBoard) => {
		if (step.outcome) styleBoard[step.row][step.col] = "g";
		//determine the cells to set red
		else {
			for (let i = 0; i < step.cells.length; i++) {
				const [row, col] = step.cells[i];

				styleBoard[row][col] = "r";
				styleBoard[step.row][step.col] = "gr";
			}
		}
	};
	clearBoard = (step, styleBoard) => {
		styleBoard[step.row][step.col] = "w";
		for (let i = 0; i < step.cells.length; i++) {
			const [row, col] = step.cells[i];
			styleBoard[row][col] = "w";
		}
	};
	render() {
		return (
			<Styled>
				<Container>
					<Row>
						<Col>
							<div className="text-center table-container">
								<table className="mx-auto mt-4 game-board">
									<tbody>{this.buildBoard()}</tbody>
								</table>
								<ButtonGroup className="controls mt-2">
									<Button
										onClick={() => {
											this.viz();
										}}
										variant="outline-dark"
									>
										Visualize
									</Button>
									<Button
										onClick={() => {
											this.setState({ currentlyRunning: false });

											this.solveSudoku();
										}}
										variant="outline-dark"
									>
										Solve
									</Button>
								</ButtonGroup>
							</div>
						</Col>
					</Row>
				</Container>
			</Styled>
		);
	}
}

export default Board;
