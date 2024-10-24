import React from 'react';
import './listModal.css'

const ListModal = ({}) => {
    // aparts
    return (
        <div className="list-modal-wrapper">
            <div className="list-modal">
                <div className="list-modal-name">
                    Квартиры
                </div>
                <div className="aparts-modal-wrapper">
                    {/*{aparts.map((apart) =>*/}
                    {/*    <div className="apart-item">*/}
                    {/*        /!*{apart.id}*!/*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            </div>
        </div>
    );
};

export default ListModal;