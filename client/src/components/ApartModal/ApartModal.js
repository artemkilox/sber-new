import React from 'react';
import './apartModal.css'

const ApartModal = ({apart, setShowApartModal}) => {
    return (
        <div className='apart-modal-wrapper'>
            <div className='apart-modal'>
                <div className='close-container'>
                    <button onClick={() => setShowApartModal(false)} className='close-btn'>X</button>
                </div>
                <div className='apart-content'>
                    <img src={apart.furnished_plan} alt='Проверьте подключение к серверу' />
                    <div className='apart-params'>
                        <div className='apart-param'>Этаж: {apart.floor_number}</div>
                        <div className='apart-param'>Комнат: {apart.rooms}</div>
                        <div className='apart-param'>Площадь: {apart.area}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApartModal;