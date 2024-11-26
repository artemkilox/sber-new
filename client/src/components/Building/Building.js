import React from 'react';
import './building.css'

const Building = ({building, selectedBuilding, handleBuilding}) => {
    return (
        <path
            className="building"
            d={building.path}
            onClick={() => handleBuilding(building)}
            fill={"transparent"}
            stroke={selectedBuilding === building ? "white" : (selectedBuilding ? "rgba(255,255,255,0)" : "white")}
            style={ selectedBuilding === building ? {cursor: "pointer"} : (selectedBuilding ? { pointerEvents: "none" } : {cursor: "pointer"})}
            strokeWidth={selectedBuilding === building ? 4.5 : (selectedBuilding ? 0 : 4.5)}
        />
    );
};

export default Building;