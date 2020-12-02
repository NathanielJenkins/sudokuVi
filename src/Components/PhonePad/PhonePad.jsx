import React from "react";
import styled from "styled-components";
import { Table } from "react-bootstrap";
import { FaEraser } from "react-icons/fa";
import Entry from "./Entry";

const Styled = styled.div`
	td {
		width: 33.33%;
	}
`;

const PhonePad = (props) => {
	const { handleOnNumberSelect, className } = props;
	let rows = [];
	for (let i = 0; i < 3; i++) {
		let row = [];
		for (let j = 0; j < 3; j++) {
			row.push(
				<Entry
					key={`${j}-entry`}
					handleOnNumberSelect={handleOnNumberSelect}
					value={(i * 3 + j + 1).toString()}
					variant="light"
				/>
			);
		}
		rows.push(<tr key={`${i}-entry`}>{row}</tr>);
	}
	rows.push(
		<tr className="text-center" key={"empty"}>
			<Entry
				handleOnNumberSelect={handleOnNumberSelect}
				value={""}
				render={<FaEraser />}
				variant="light"
			/>
		</tr>
	);
	return (
		<Styled>
			<Table borderless className={className}>
				<tbody>{rows}</tbody>
			</Table>
		</Styled>
	);
};

export default PhonePad;
