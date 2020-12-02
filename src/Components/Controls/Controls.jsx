import React from "react";
import { Table } from "react-bootstrap";
import Entry from "./Entry";

import {
	FaRegEye,
	FaRegCheckCircle,
	FaRegTimesCircle,
	FaRegEdit,
} from "react-icons/fa";
import styled from "styled-components";
const Styled = styled.div`
	td {
		width: 25%;
	}
`;
const Controls = (props) => {
	const {
		onViz,
		onSolve,
		onClear,
		onMutableClick,
		className,
		isMutable,
	} = props;

	return (
		<Styled>
			<Table borderless className={className}>
				<tbody>
					<tr>
						<Entry
							icon={<FaRegEye size={50} />}
							onClick={onViz}
							label="Visualize"
							variant="light"
						/>
						<Entry
							icon={<FaRegTimesCircle size={50} />}
							onClick={onClear}
							label="Clear"
							variant="light"
						/>

						<Entry
							icon={<FaRegCheckCircle size={50} />}
							onClick={onSolve}
							label="Solve"
							variant="light"
						/>
						<Entry
							icon={<FaRegEdit size={50} />}
							onClick={onMutableClick}
							label="Edit"
							variant={isMutable ? "light" : "dark"}
						/>
					</tr>
				</tbody>
			</Table>
		</Styled>
	);
};

export default Controls;
