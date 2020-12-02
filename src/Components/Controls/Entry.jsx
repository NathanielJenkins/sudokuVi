import React from "react";

const Entry = (props) => {
	const { label, onClick, icon, variant } = props;
	return (
		<td
			className={`btn btn-${variant}`}
			onClick={onClick}
			style={{ textAlign: "center" }}
		>
			{icon}
			<div className="my-2" />
			{label}
		</td>
	);
};

export default Entry;
