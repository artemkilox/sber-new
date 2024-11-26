import React, { useEffect, useState } from 'react';
import './listModal.css'
import ApartModal from '../ApartModal/ApartModal';
import { $host } from '../../http';

const ListModal = ({setShowModal, aparts}) => {

    const [curApart, setCurApart] = useState(null)
    const [showApartModal, setShowApartModal] = useState(false)

    const clickHandle = (apart) => {
        setCurApart(apart)
        setShowApartModal(true)
        const data = apart.number
        $host.post('/oneApart', {data})
    }

    useEffect(() => {
        const data = aparts.map(apart => {return apart.number})
        console.log(data)
        $host.post('/manyAparts', {data})
    }, [aparts])

    // aparts
    return (
        <div className="list-modal-wrapper">
            {showApartModal && <ApartModal apart={curApart} setShowApartModal={setShowApartModal}/>}
            <div className="list-modal">
                <div className="list-modal-name">
                    Квартиры
                    <button className="close-btn" onClick={() => setShowModal(false)}>X</button>
                </div>
                <div className="aparts-modal-wrapper">
                    {aparts && aparts.map((apart) =>
                        <div 
                            key={apart.id} 
                            className="apart-item"
                            onClick={() => clickHandle(apart)}
                        >
                            <img src={apart.furnished_plan} alt='Проверьте подключение к серверу' />
                            <div className='apart-params'>
                                <div className='apart-param'>Этаж: {apart.floor_number}</div>
                                <div className='apart-param'>Комнат: {apart.rooms}</div>
                                <div className='apart-param'>Площадь: {apart.area}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListModal;