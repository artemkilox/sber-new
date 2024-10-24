import React from 'react';

const Building = ({building, selectedBuilding, handleBuilding}) => {
    return (
        <path
            d={building.path}
            onClick={() => handleBuilding(building)}
            fill={"transparent"}
            stroke={selectedBuilding === building ? "white" : (selectedBuilding ? "rgba(255,255,255,0.5)" : "white")}
            style={{cursor: "pointer"}}
            strokeWidth={selectedBuilding === building ? 4.5 : (selectedBuilding ? 4.5 : 4.5)}
        />
    );
};

export default Building;