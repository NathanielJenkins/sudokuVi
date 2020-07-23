import React, { Component } from "react";
import { ButtonGroup, Button, Container, Row, Col } from "react-bootstrap";
import styled from "styled-components";

const Styled = styled.div`
	.game-board {
		border: 1px solid black;
		width: 500px;
		height: 500px;
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
	.controls {
		width: 500px;
	}
`;

class Board extends Component {
	state = {
		currentlyRunning: false,
		steps: [],
		sudokuBoard: [],
		immutableNumbers: [],
	};

	componentDidMount() {
		//generate the board
		this.generate();
	}

	generate() {
		const sudokuBoard = [];
		const immutableNumbers = [];

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
		}

		this.setState({ immutableNumbers }, () => {
			this.backtrack(0, 0, sudokuBoard, true);

			//now that we solved the board, lets delete part of it. Hold 12 numbers
			for (let i = 0; i < 12; i++) {
				const row = Math.floor(Math.random() * 9);
				const col = Math.floor(Math.random() * 9);
				immutableNumbers[row][col] = true;
			}

			this.clear(sudokuBoard, immutableNumbers);

			this.setState({ steps: [] });
		});
	}

	solveSudoku = (sudokuBoard) => {
		//end the viz if it is going
		this.backtrack(0, 0, sudokuBoard, false);
		this.setState({ sudokuBoard });
	};

	delay = (ms) => new Promise((res) => setTimeout(res, ms));

	viz = () => {
		if (this.state.currentlyRunning) return;

		this.setState({ currentlyRunning: true }, async () => {
			const sudokuBoard = this.state.sudokuBoard;

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
				this.setState({ sudokuBoard });
				await this.delay(100);
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
		this.setState({ sudokuBoard });
	};

	shuffleArray = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	};

	//returns false if not done, returns true if done
	backtrack = (row, col, board, random) => {
		let end = false;

		if (row === 9) {
			return true;
		}

		// if the current column and row are immutable
		if (this.state.immutableNumbers[row][col]) {
			const colRow = this.incrementColRow(row, col);
			end = this.backtrack(colRow[0], colRow[1], board, random);

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
				});

				if (validBoard.outcome) {
					const colRow = this.incrementColRow(row, col);
					end = this.backtrack(colRow[0], colRow[1], board, random);
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
			});
		}
		return end;
	};

	incrementColRow = (row, col) => {
		col++;

		if (col === 9) {
			col = 0;
			row++;
		}

		return [row, col];
	};

	isValidSudoku = (board, row, col, value) => {
		for (let i = 0; i < 9; i++) {
			if (board[row][i] === value && i !== col) {
				return { outcome: false, reason: 0 };
			}
		}

		for (let i = 0; i < 9; i++) {
			if (board[i][col] === value && i !== row) {
				return { outcome: false, reason: 1 };
			}
		}

		const square = Math.floor(row / 3) + Math.floor(col / 3) * 3;
		const colStart = Math.floor(square / 3) * 3;
		const rowStart = (square % 3) * 3;

		for (let r = rowStart; r < rowStart + 3; r++) {
			for (let c = colStart; c < colStart + 3; c++) {
				if (board[r][c] === value && row !== r && col !== c) {
					return { outcome: false, reason: 2 };
				}
			}
		}
		return { outcome: true, reason: null };
	};

	changeBoard = async (row, col, value) => {
		let sudokuBoard = [...this.state.sudokuBoard];
		sudokuBoard[row][col] = value;
		this.setState({ sudokuBoard });
	};

	render() {
		// build the sudoku board from above
		const rows = [];
		for (const [indexRow, row] of this.state.sudokuBoard.entries()) {
			let ent = [];
			for (const [indexCol, value] of row.entries()) {
				if (this.state.immutableNumbers[indexRow][indexCol]) {
					ent.push(
						<td className="font-weight-bold" key={indexCol + "-" + indexRow}>
							{value}
						</td>
					);
				} else {
					ent.push(<td key={indexCol + "-" + indexRow}>{value}</td>);
				}
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
								<ButtonGroup size="md" className="controls mt-1">
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
