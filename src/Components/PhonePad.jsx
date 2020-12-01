import React, { Component } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import styled from "styled-components";
const Styled = styled.div`
	td {
		width: 33.33%;
	}
	table {
		width: 500px;
	}
`;
class PhonePad extends Component {
	state = {};
	render() {
		let rows = [];
		for (let i = 0; i < 3; i++) {
			let row = [];
			for (let j = 0; j < 3; j++) {
				row.push(
					<td className="btn btn-light text-center" key={`${j}-entry`}>
						{i * 3 + j + 1}
					</td>
				);
			}
			rows.push(<tr key={`${i}-entry`}>{row}</tr>);
		}

		return (
			<Styled>
				<Container className="mt-4">
					<Row>
						<Col>
							<Table borderless className="mx-auto">
								<tbody>{rows}</tbody>
							</Table>
						</Col>
					</Row>
				</Container>
			</Styled>
		);
	}
}

export default PhonePad;
