import React from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
const DropdownEntry = (props) => {
	const { items, label, variant, icon } = props;
	const title = (
		<>
			{icon}
			<div className="my-2" />
			{label}
		</>
	);
	return (
		<td>
			<DropdownButton variant={variant} title={title}>
				{items.map((value, index) => {
					return (
						<Dropdown.Item key={index} onClick={value.onClick}>
							{value.label}
						</Dropdown.Item>
					);
				})}
			</DropdownButton>
		</td>
	);
};

export default DropdownEntry;
