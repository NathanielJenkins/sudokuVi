import React from "react";

const Slider = (props) => {
	const { className, label, onSliderClick, min, max, value } = props;
	return (
		<div className={className}>
			<label htmlFor="rangeSlider">{label}</label>
			<input
				onChange={(e) => onSliderClick(max - e.target.value)}
				type="range"
				className="custom-range"
				id="rangeSlider"
				min={min}
				max={max}
				value={value}
			/>
		</div>
	);
};

export default Slider;
