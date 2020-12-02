import React from "react";
import styled from "styled-components";

import Entry from "./Entry";

const Styled = styled.div`
	.sized {
		width: 500px;
		height: 500px;
	}

	@media (max-width: 576px) {
		.sized {
			width: 250px;
			height: 250px;
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
const Board = (props) => {
	const buildBoard = () => {
		const { sudokuBoard, styleBoard, immutableNumbers, onEntryClick } = props;
		// build the sudoku board from above
		const rows = [];
		for (const [indexRow, row] of sudokuBoard.entries()) {
			let ent = [];
			for (const [indexCol, value] of row.entries()) {
				let classNames = styleBoard[indexRow][indexCol];

				if (immutableNumbers[indexRow][indexCol])
					classNames += " font-weight-bold";

				ent.push(
					<Entry
						onEntryClick={onEntryClick}
						value={value}
						className={classNames}
						key={indexCol + "-" + indexRow}
						indexCol={indexCol}
						indexRow={indexRow}
						color={styleBoard[indexRow][indexCol]}
					/>
				);
			}
			rows.push(
				<tr key={indexRow} className="game-row">
					{ent}
				</tr>
			);
		}
		return rows;
	};

	const { className: tableClassName } = props;
	return (
		<Styled>
			<table className={`${tableClassName} sized text-center`}>
				<tbody>{buildBoard()}</tbody>
			</table>
		</Styled>
	);
};

export default Board;
