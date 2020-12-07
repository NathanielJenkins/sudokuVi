import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import styled from "styled-components";
import Board from "./Components/Board/Board";
import PhonePad from "./Components/PhonePad/PhonePad";
import Controls from "./Components/Controls/Controls";
import NavigationBar from "./Components/NavigationBar";
import Slider from "./Components/Controls/Slider";

const Styled = styled.div``;
class App extends Component {
	state = {
		currentlyRunning: false,
		steps: [],
		sudokuBoard: [],
		styleBoard: [],
		immutableNumbers: [],
		currentSelectedEntry: null,
		isMutable: true,
		ms: 200,
		isSolvable: true,
	};

	componentDidMount() {
		this.handleGenerate();
	}

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

	handleGenerate = () => {
		this.setState({ currentlyRunning: false });
		const { sudokuBoard, immutableNumbers, styleBoard } = this.initDataBoards();
		this.setState({ styleBoard, sudokuBoard, immutableNumbers });

		//set immutableNumbers before the solve since it requires it
		this.setState({ immutableNumbers }, () => {
			this.backtrack(0, 0, sudokuBoard, true);

			//now that we solved the board, lets delete part of it. Hold 30 at most numbers
			for (let i = 0; i < 30; i++) {
				const row = Math.floor(Math.random() * 9);
				const col = Math.floor(Math.random() * 9);
				immutableNumbers[row][col] = true;
			}

			this.clear(sudokuBoard, immutableNumbers);
			this.setState({ steps: [] });
		});
	};

	delay = (ms) => new Promise((res) => setTimeout(res, ms));

	handleViz = () => {
		if (this.state.currentlyRunning) return;

		//Clear any previous style
		const { styleBoard } = this.initDataBoards();
		this.setState({ styleBoard });

		//handle the viz
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
				await this.delay(this.state.ms);
				this.clearBoard(step, styleBoard);
			}
			this.setState({ currentlyRunning: false });
		});
	};

	handleSolve = () => {
		this.setState({ currentlyRunning: false });
		if (!this.state.isSolvable) return;
		//solve the sudokuBoard
		let sudokuBoard = this.returnCopyOf2DArray(this.state.sudokuBoard);
		this.doClear(sudokuBoard);

		const isSolvable = this.backtrack(0, 0, sudokuBoard, false);

		this.setState({
			isSolvable,
			styleBoard: this.clearStyleBoard(),
			sudokuBoard,
		});
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
	handleAllClear = () => {
		this.setState({ currentlyRunning: false, steps: [] });
		this.setState(this.initDataBoards());
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

	handleOnNumberSelect = (value) => {
		const {
			currentSelectedEntry,
			sudokuBoard: sudokuBoardState,
			immutableNumbers: immutableNumbersState,
			isMutable,
		} = this.state;

		if (!currentSelectedEntry) return;

		const [row, col] = currentSelectedEntry;
		//if they are changing immutable without edit button selected
		if (immutableNumbersState[row][col] && isMutable) return;

		let sudokuBoard = this.returnCopyOf2DArray(sudokuBoardState);
		sudokuBoard[row][col] = value;

		if (!isMutable) {
			let immutableNumbers = this.returnCopyOf2DArray(immutableNumbersState);
			immutableNumbers[row][col] = value !== "" ? true : false;
			this.setState({ immutableNumbers });
		}
		this.setState({ sudokuBoard });

		const { styleBoard } = this.initDataBoards();
		//determine the validity of the board the vis

		//if they are not clearing the value
		if (value !== "") {
			const step = {
				col,
				row,
				value,
				...this.isValidSudoku(sudokuBoard, row, col, value),
			};

			this.colourBoard(step, styleBoard);

			//set whether the board is solvable
			if (!step.outcome && !isMutable) this.setState({ isSolvable: false });
			else this.setState({ isSolvable: true });
		}

		this.setState({ styleBoard });
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

	handleEntryClick = (row, col) => {
		let { styleBoard } = this.initDataBoards();
		styleBoard[row][col] = "gr";
		const currentSelectedEntry = [row, col];
		this.setState({ styleBoard, currentSelectedEntry });
	};

	handleClear = () => {
		const { sudokuBoard: sudokuBoardState } = this.state;
		let sudokuBoard = this.returnCopyOf2DArray(sudokuBoardState);

		this.doClear(sudokuBoard);
		this.setState({
			styleBoard: this.clearStyleBoard(),
			sudokuBoard,
			currentlyRunning: false,
		});
	};

	doClear = (board) => {
		const { immutableNumbers } = this.state;
		for (let row = 0; row < 9; row++) {
			for (let col = 0; col < 9; col++) {
				if (!immutableNumbers[row][col]) board[row][col] = "";
			}
		}
	};

	handleOnMutableClick = () => {
		const isMutable = !this.state.isMutable;
		this.setState({ isMutable });
	};

	handleOnSliderClick = (value) => {
		this.setState({ ms: value });
	};

	render() {
		return (
			<Styled>
				<NavigationBar
					onHandleGenerate={this.handleGenerate}
					onAllClear={this.handleAllClear}
				/>
				<Container>
					<Row className={"mt-4"}>
						<Col xl={6}>
							<Board
								sudokuBoard={this.state.sudokuBoard}
								styleBoard={this.state.styleBoard}
								immutableNumbers={this.state.immutableNumbers}
								onEntryClick={this.handleEntryClick}
								className={"mx-auto"}
							/>
							{!this.state.isSolvable && (
								<p className="text-center text-danger">
									Board is not Solvable!
								</p>
							)}
							{this.state.currentlyRunning && (
								<Slider
									label="Visualization Speed"
									className={"mt-2 mx-auto text-center"}
									onSliderClick={this.handleOnSliderClick}
									min={0}
									max={500}
									value={500 - this.state.ms}
								/>
							)}
						</Col>
						<Col xl={6}>
							<Controls
								onViz={this.handleViz}
								onClear={this.handleClear}
								onSolve={this.handleSolve}
								onMutableClick={this.handleOnMutableClick}
								isMutable={this.state.isMutable}
								className={"mx-auto mt-2 mb-0"}
							/>

							<PhonePad
								className={"mx-auto"}
								handleOnNumberSelect={this.handleOnNumberSelect}
							/>
						</Col>
					</Row>
				</Container>
			</Styled>
		);
	}
}

export default App;
