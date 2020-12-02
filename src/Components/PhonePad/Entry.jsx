import React from "react";
const Entry = (props) => {
	const { value, handleOnNumberSelect, variant } = props;

	return (
		<td
			onClick={() => handleOnNumberSelect(value)}
			className={`btn btn-${variant} text-center`}
		>
			{props.render ? props.render : value}
		</td>
	);
};

export default Entry;
