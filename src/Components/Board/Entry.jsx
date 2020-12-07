import React from "react";
import styled from "styled-components";

const TableEntry = styled.td`
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
const Entry = (props) => {
	const { onEntryClick, className, indexCol, indexRow, value } = props;
	return (
		<TableEntry
			onClick={() => onEntryClick(indexRow, indexCol)}
			className={className}
			key={indexCol + "-" + indexRow}
		>
			{value}
		</TableEntry>
	);
};

export default Entry;
