import React, {useEffect, useState} from 'react';
import backImage from '../../resources/img/map.jpg'
import './mapComponent.css'
import buildings from '../../resources/data/info.json'
import Building from "../Building/Building";
import {$host} from "../../http";
import MultiRangeSlider from "../MultiRangeSlider/MultiRangeSlider";
import Preloader from "../Preloader/Preloader";
import listModal from "../ListModal/ListModal";
import ListModal from "../ListModal/ListModal";

const MapComponent = () => {
    const [selectedBuilding, setSelectedBuilding] = useState(null)
    const [showFilters, setShowFilters] = useState(false)

    const [loading, setLoading] = useState(false)

    const [aparts, setAparts] = useState(null)
    const [filtredAparts, setFiltredAparts] = useState(null)

    const [maxRooms, setMaxRooms] = useState(0)
    const [minRooms, setMinRooms] = useState(0)
    const [maxFloor, setMaxFloor] = useState(0)
    const [minFloor, setMinFloor] = useState(0)
    const [resetRooms, setResetRooms] = useState(false)
    const [resetFloor, setResetFloor] = useState(false)

    const [showModal, setShowModal] = useState(false)
    const [modalMaxRoom, setModalMaxRoom] = useState(0)
    const [modalMinRoom, setModalMinRoom] = useState(0)
    const [modalMaxFloor, setModalMaxFloor] = useState(0)
    const [modalMinFloor, setModalMinFloor] = useState(0)

    useEffect(() => {
        fetchData()
        console.log(aparts)
    }, [])

    useEffect(() => {
        // setFiltredAparts(aparts.filter((apart) => apart.build === selectedBuilding.build))
        // setupFilters()
    }, [selectedBuilding])

    const setupFilters = () => {
        let maxRoom = 0
        let minRoom = 9999
        let maxFlor = 0
        let minFlor = 9999
        filtredAparts.map((apart) => {
            if(apart.rooms !== null && apart.rooms > maxRoom){
                maxRoom = apart.rooms
            }
            if(apart.rooms !== null && apart.rooms < maxRoom){
                minRoom = apart.rooms
            }
            if(apart.floor !== null && apart.floor > maxRoom){
                maxFlor = apart.floor
            }
            if(apart.floor !== null && apart.floor < maxRoom){
                minFlor = apart.floor
            }
        })
        setMaxRooms(maxRoom)
        setMinRooms(minRoom)
        setMaxFloor(maxFlor)
        setMinFloor(minFlor)
    }

    const fetchData = () => {
        console.log("--------------------------");
        $host.get('/getAparts').then(result => {
            let totalCount = result.data.count
            console.log("=================");
            console.log(totalCount)
            if (totalCount > 0) {
                let iteration = Math.ceil(totalCount / 100);
                for (let i = 0; i < iteration; i++) {
                    $host.get('/getApartsLim', {data: "limit: 100, offset: i * 100"}).then(result => {
                        console.log("++++++++++++++++++++++");
                        setAparts([...aparts, result.data.results])
                    })
                    // let response = await axios({
                    //     url: "http://127.0.0.1:8000/getApartsLim",
                    //     method: "GET",
                    //     data: "limit: 100, offset: i * 100",
                    // })
                    // _temp = [..._temp, ...response.data.results];
                    // console.log("++++++++++++++++++++++");
                    // console.log(_temp)
                    // if (totalCount === _temp.length) {
                    //     loadHandler(_temp);
                    // }
                }
            }
        })
        // let totalResponse = await axios({
        //     url: "http://127.0.0.1:8000/getAparts",
        //     method: "GET"
        // })
        // console.log("=================");
        // let totalCount = totalResponse.data.count;
        // console.log(totalCount)
    }

    const cancelSelection = () => {
        setSelectedBuilding(null)
    }

    const handleBuilding = (item) => {
        if (selectedBuilding === item) {
            setSelectedBuilding(null)
            const data = item.name
            $host.post('/', {data})
        } else {
            setSelectedBuilding(item)
            const data = item.name
            $host.post('/', {data})
        }
    }

    const showModalHandle = () => {
        // setFiltredAparts(aparts.filter((apart) =>
        //     apart.rooms < modalMaxRoom &&
        //     apart.rooms > modalMaxRoom &&
        //     apart.floor < modalMaxFloor &&
        //     apart.floor > modalMinFloor
        // ))
        setShowModal(true)
    }

    return (
        <div className="map-component">
            {loading && <Preloader/>}
            {/*{showModal && <ListModal aparts={filtredAparts}/>}*/}
            {showModal && <ListModal />}
            <svg className="map-svg" x={0} y={0} viewBox={`0 0 ${1920} ${1080}`} preserveAspectRatio="none">
                {selectedBuilding && <clipPath id="selectBuildingPath"><path d={selectedBuilding.path} /></clipPath>}
                <image xlinkHref={backImage} clipPath={selectedBuilding ? "url(#selectBuildingPath)" : ""}/>
                {
                    buildings.map((building) =>
                        <Building
                            key={building.name}
                            building={building}
                            selectedBuilding={selectedBuilding}
                            handleBuilding={handleBuilding}
                        />
                    )
                }
                {selectedBuilding && <image xlinkHref={backImage} opacity={0.3} x={0} y={0} width={"100%"} height={"100%"} style={{ pointerEvents: "none" }} />}
            </svg>
            {selectedBuilding &&
                <div className="top-btn-container">
                    <button
                        className="cancel-select"
                        onClick={cancelSelection}
                    >
                        Сбросить выбор
                    </button>
                </div>
            }
            {selectedBuilding &&
                <div className="filter-panel-container">
                    <div className={showFilters ? "filter-panel" : "hidden-panel"}>
                        <h2 className="struction-name">
                            Строение {selectedBuilding.name.split('k')[0]} Корпус {selectedBuilding.name.split('k')[1]}
                        </h2>
                        <div className="form-filter">
                            <h3>Кол-во комнат</h3>
                            <MultiRangeSlider
                                min={minRooms}
                                max={maxRooms}
                                reset={resetRooms}
                                setReset={setResetRooms}
                                onChange={({ min, max }) => {
                                    setModalMaxRoom(max)
                                    setModalMinRoom(min)
                                    // console.log(`min = ${min}, max = ${max}`)
                                }}
                            />
                        </div>
                        <div className="form-filter">
                            <h3>Этаж</h3>
                            <MultiRangeSlider
                                min={minFloor}
                                max={maxFloor}
                                reset={resetFloor}
                                setReset={setResetFloor}
                                onChange={({ min, max }) => {
                                    setModalMaxFloor(max)
                                    setModalMinFloor(min)
                                    // console.log(`min = ${min}, max = ${max}`)
                                }}
                            />
                        </div>
                    </div>
                    {showFilters ?
                        <button
                            className={"filter-open"}
                            onClick={showModalHandle}
                        >
                            Подобрать
                        </button> :
                        <button
                            className="filter-button"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            Подбор по параметрам
                        </button>
                    }
                </div>
            }
        </div>
    );
};

export default MapComponent;