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
		border: 1px solid;
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
	};

	componentDidMount() {
		//generate the board
		this.generate();
	}

	generate() {
		const sudokuBoard = [];
		const immutableNumbers = [];
		const styleBoard = [];

		//init the sudokuBoard, immutableNumbers and the styleBoar
		for (let i = 0; i < 9; i++) {
			sudokuBoard.push(["", "", "", "", "", "", "", "", ""]);

			immutableNumbers.push([
				false,
				false,
				false,
				false,
				false,
				false,
				false,
				false,
				false,
			]);

			styleBoard.push(["w", "w", "w", "w", "w", "w", "w", "w", "w"]);
		}
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

	solveSudoku = (sudokuBoard) => {
		//solves the sudokuBoard
		this.backtrack(0, 0, sudokuBoard, false);
		this.setState({ styleBoard: this.clearStyleBoard(), sudokuBoard });
	};

	delay = (ms) => new Promise((res) => setTimeout(res, ms));

	viz = () => {
		if (this.state.currentlyRunning) return;

		this.setState({ currentlyRunning: true }, async () => {
			const sudokuBoard = this.state.sudokuBoard;
			const styleBoard = this.state.styleBoard;
			//the board has not already been solved by the user
			if (this.state.steps.length === 0) {
				const sudokuBoardCopy = [];

				for (var i = 0; i < sudokuBoard.length; i++)
					sudokuBoardCopy[i] = sudokuBoard[i].slice();

				//generate the steps with the sudokuBoardCopy so we don't alter the board
				this.backtrack(0, 0, sudokuBoardCopy, false);

				// the board has already been solved by the user so we need to clear it
			} else {
				this.clear(this.state.sudokuBoard, this.state.immutableNumbers);
			}

			for (let i = 0; i < this.state.steps.length; i++) {
				if (!this.state.currentlyRunning) {
					return;
				}

				const step = this.state.steps[i];

				sudokuBoard[step.row][step.col] = step.value;

				if (step.valid) styleBoard[step.row][step.col] = "g";
				//determine the cells to set red
				else {
					for (let i = 0; i < step.cells.length; i++) {
						const rowCol = step.cells[i];

						styleBoard[rowCol[0]][rowCol[1]] = "r";
						styleBoard[step.row][step.col] = "gr";
					}
				}
				this.setState({ sudokuBoard });
				await this.delay(100);
				styleBoard[step.row][step.col] = "w";
				for (let i = 0; i < step.cells.length; i++) {
					const rowCol = step.cells[i];
					styleBoard[rowCol[0]][rowCol[1]] = "w";
				}
			}
		});
	};

	clear = (sudokuBoard, immutableNumbers) => {
		//loop through all the squares and clear others
		for (let row = 0; row < 9; row++) {
			for (let col = 0; col < 9; col++) {
				if (!immutableNumbers[row][col]) sudokuBoard[row][col] = "";
			}
		}
		this.setState({ styleBoard: this.clearStyleBoard(), sudokuBoard });
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
		let end = false;

		if (row === 9) {
			return true;
		}

		// if the current column and row are immutable
		if (this.state.immutableNumbers[row][col]) {
			const rowCol = this.incrementRowCol(row, col);
			end = this.backtrack(rowCol[0], rowCol[1], board, random);

			// if the current column and row are changeable
		} else {
			let choiceArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			if (random) {
				choiceArray = this.shuffleArray(choiceArray);
			}

			for (let choice = 1; choice <= 9; choice++) {
				// if the current column and row can be changed
				const value = choiceArray.shift().toString();
				//const value = choice.toString();
				board[row][col] = value;

				const validBoard = this.isValidSudoku(board, row, col, value);

				this.state.steps.push({
					col: col,
					row: row,
					value: value,
					valid: validBoard.outcome,
					reason: validBoard.reason,
					cells: validBoard.cells,
				});

				if (validBoard.outcome) {
					const rowCol = this.incrementRowCol(row, col);
					end = this.backtrack(rowCol[0], rowCol[1], board, random);
					if (end) return true;
				}
			}
			board[row][col] = "";
			this.state.steps.push({
				col: col,
				row: row,
				value: "",
				valid: null,
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

	render() {
		// build the sudoku board from above
		const rows = [];
		for (const [indexRow, row] of this.state.sudokuBoard.entries()) {
			let ent = [];
			for (const [indexCol, value] of row.entries()) {
				let classNames = this.state.styleBoard[indexRow][indexCol];
				if (this.state.immutableNumbers[indexRow][indexCol])
					classNames += " font-weight-bold";

				ent.push(
					<td className={classNames} key={indexCol + "-" + indexRow}>
						{value}
					</td>
				);
			}
			rows.push(
				<tr key={indexRow} className="game-row">
					{ent}
				</tr>
			);
		}

		return (
			<Styled>
				<Container>
					<Row>
						<Col>
							<div className="text-center table-container">
								<table className="mx-auto mt-4 game-board">
									<tbody>{rows}</tbody>
								</table>
								<ButtonGroup className="controls mt-2">
									<Button
										onClick={() => {
											this.setState({ currentlyRunning: false });
											this.generate();
										}}
										variant="outline-dark"
									>
										Create
									</Button>
									<Button
										onClick={() => {
											this.setState({ currentlyRunning: false });

											//end the viz if it is going
											this.clear(
												this.state.sudokuBoard,
												this.state.immutableNumbers
											);
										}}
										variant="outline-dark"
									>
										Clear
									</Button>
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

											this.solveSudoku(this.state.sudokuBoard);
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
