import React from 'react';
import logo from "../../resources/img/logo.svg";
import './preloader.css'

const Preloader = () => {
    return (
        <div id="preloader" className="view hide">
            <div className="preloader-content">
                <img src={logo} alt="logo" />
                <div className="preloader-circle" />
            </div>
        </div>
    );
};

export default Preloader;