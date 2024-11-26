import React, {useEffect, useState} from 'react';
import backImage from '../../resources/img/map.jpg'
import './mapComponent.css'
import buildings from '../../resources/data/info.json'
import Building from "../Building/Building";
import {$host} from "../../http";
import MultiRangeSlider from "../MultiRangeSlider/MultiRangeSlider";
import Preloader from "../Preloader/Preloader";
import ListModal from "../ListModal/ListModal";


const MapComponent = () => {

    // https://sbercity.ru/api/v1/api/flats/?complex=2-11&limit=50
    // В20 = 2-3
    // В19 = 2-1
    // В17 = 3-10
    // В14 = 3-9

    // useEffect(() => {
    //     fetch('https://sbercity.ru/api/v1/api/flats/?limit=234&offset=0')
    //         .then(res => res.json())
    //         .then(json => console.log(json))
    // }, [])

    const [selectedBuilding, setSelectedBuilding] = useState(null)
    const [showFilters, setShowFilters] = useState(false)

    const [loading, setLoading] = useState(true)

    const [aparts, setAparts] = useState([])
    const [filtredAparts, setFiltredAparts] = useState([])
    const [modalAparts, setModalAparts] = useState([])

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

    const [canCancel, setCanCancel] = useState(false)

    useEffect(() => {
        fetchData()
        // console.log(aparts)
    }, [])

    useEffect(() => {
        // console.log(selectedBuilding)
        if(selectedBuilding !== null){           
            setFiltredAparts(aparts.filter((apart) => Number(apart.complex_name.slice(1)) === Number(selectedBuilding.name.split('k')[0])))
        }
    }, [selectedBuilding])

    useEffect(() => {
        if(!showModal){
            setupFilters()
        }
    }, [filtredAparts])

    const setupFilters = () => {
        let maxRoom = 0
        let minRoom = 9999
        let maxFlor = 0
        let minFlor = 9999

        // console.log(filtredAparts)
        setResetRooms(true)
        setResetFloor(true)

        filtredAparts.map((apart) => {
            if(apart.rooms !== null && apart.rooms > maxRoom){
                maxRoom = apart.rooms
            }
            if(apart.rooms !== null && apart.rooms < maxRoom){
                minRoom = apart.rooms
            }
            if(apart.floor_number !== null && apart.floor_number > maxRoom){
                maxFlor = apart.floor_number
            }
            if(apart.floor_number !== null && apart.floor_number < maxRoom){
                minFlor = apart.floor_number
            }
        })
        setMaxRooms(maxRoom)
        setMinRooms(minRoom)
        setMaxFloor(maxFlor)
        setMinFloor(minFlor)
    }

    const fetchData = () => {
        console.log("fetchData");
        $host.get('/getAparts').then(result => {
            console.log(result)
            if(!result.data.error){
                // console.log(result)
                let totalCount = result.data.count
                console.log("=================");
                console.log(totalCount)
                if (totalCount > 0) {
                    let iteration = Math.ceil(totalCount / 100);
                    const promiseArr = []
                    for(let i=0; i<iteration; i++){
                        const newPromise = new Promise((resolve) => {
                            setTimeout(() => {
                                $host.get('/getApartsLim/' + i * 100).then(result => resolve(result))
                            }, 1000)
                        })
                        promiseArr.push(newPromise)
                    }

                    Promise.all(promiseArr).then(result => {
                        // console.log(result)
                        const resultArr = []
                        result.map(item => {
                            resultArr.push(...item.data.results)
                        })
                        setAparts(resultArr)
                        console.log(resultArr)
                        setLoading(false)
                    })
                }
            } else {
                // /getLocal
                console.log(result.data.error)
                $host.get('/getLocal').then(result =>{
                    console.log(result)
                    setAparts(result.data)
                    setLoading(false)
                })
                // console.log(result.data.error)
                // setLoading(false)
            }
        })
    }

    const cancelSelection = () => {
        setCanCancel(false)
        const data = "Сбросить выбор"
        console.log("Сбросить выбор")
        $host.post('/', {data})
        setSelectedBuilding(null)
    }

    const handleBuilding = (item) => {
        // if (selectedBuilding === item) {
        //     setSelectedBuilding(null)
        //     const data = item.name
        //     // console.log(data)
        //     $host.post('/building', {data})
        // } else {
        if(selectedBuilding !== item){
            setTimeout(() => {
                setCanCancel(true)
            }, 2000)
            setSelectedBuilding(item)
            const data = item.name
            // console.log(data)
            $host.post('/building', {data})
        }

        // }
    }

    const showModalHandle = () => {
        setShowModal(true)
        setModalAparts(filtredAparts.filter((apart) =>
            apart.rooms <= modalMaxRoom &&
            apart.rooms >= modalMinRoom &&
            apart.floor_number <= modalMaxFloor &&
            apart.floor_number >= modalMinFloor
        ))
    }

    const handleLigher = (lighter) => {
        const data = lighter
        $host.post('/', {data})
    }

    return (
        <div className="map-component">
            {loading && <Preloader/>}
            {showModal && <ListModal setShowModal={setShowModal} aparts={modalAparts}/>}
            {/* {showModal && <ListModal />} */}
            <svg className="map-svg" x={0} y={0} viewBox={`0 0 ${1920} ${1080}`} preserveAspectRatio="none">
                {selectedBuilding && <clipPath id="selectBuildingPath"><path  d={selectedBuilding.path} /></clipPath>}
                <image className="clip-path" xlinkHref={backImage} clipPath={selectedBuilding ? "url(#selectBuildingPath)" : ""}/>
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
            <div className="interactive-controller">
				<button onClick={() => handleLigher("parking")}>
					<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M25.3333 4H6.66667C5.19391 4 4 5.19391 4 6.66667V25.3333C4 26.8061 5.19391 28 6.66667 28H25.3333C26.8061 28 28 26.8061 28 25.3333V6.66667C28 5.19391 26.8061 4 25.3333 4Z" stroke="black" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
						<path d="M12 22.6666V9.33331H17.3333C18.3942 9.33331 19.4116 9.75474 20.1618 10.5049C20.9119 11.255 21.3333 12.2724 21.3333 13.3333C21.3333 14.3942 20.9119 15.4116 20.1618 16.1617C19.4116 16.9119 18.3942 17.3333 17.3333 17.3333H12" stroke="black" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>
				{/* <button onClick={() => handleLigher("logo")}>
					<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6.5 5C6.10218 5 5.72064 5.15804 5.43934 5.43934C5.15804 5.72064 5 6.10218 5 6.5V14.5C5 14.6326 5.05268 14.7598 5.14645 14.8536C5.24021 14.9473 5.36739 15 5.5 15H14.5C14.6326 15 14.7598 14.9473 14.8536 14.8536C14.9473 14.7598 15 14.6326 15 14.5V5.5C15 5.36739 14.9473 5.24021 14.8536 5.14645C14.7598 5.05268 14.6326 5 14.5 5H6.5ZM17.5 5C17.3674 5 17.2402 5.05268 17.1464 5.14645C17.0527 5.24021 17 5.36739 17 5.5V14.5C17 14.6326 17.0527 14.7598 17.1464 14.8536C17.2402 14.9473 17.3674 15 17.5 15H26.5C26.6326 15 26.7598 14.9473 26.8536 14.8536C26.9473 14.7598 27 14.6326 27 14.5V6.5C27 6.10218 26.842 5.72064 26.5607 5.43934C26.2794 5.15804 25.8978 5 25.5 5H17.5ZM25.854 6.146C25.9004 6.19252 25.9372 6.24773 25.9622 6.30847C25.9873 6.36921 26.0001 6.4343 26 6.5V14H18L25.854 6.146ZM17 17.5C17 17.3674 17.0527 17.2402 17.1464 17.1464C17.2402 17.0527 17.3674 17 17.5 17H26.5C26.6326 17 26.7598 17.0527 26.8536 17.1464C26.9473 17.2402 27 17.3674 27 17.5V25.5C27 25.8978 26.842 26.2794 26.5607 26.5607C26.2794 26.842 25.8978 27 25.5 27H17.5C17.3674 27 17.2402 26.9473 17.1464 26.8536C17.0527 26.7598 17 26.6326 17 26.5V17.5ZM18 26H25.5C25.6326 26 25.7598 25.9473 25.8536 25.8536C25.9473 25.7598 26 25.6326 26 25.5V18H18V26ZM5.5 17C5.36739 17 5.24021 17.0527 5.14645 17.1464C5.05268 17.2402 5 17.3674 5 17.5V25.5C5 25.8978 5.15804 26.2794 5.43934 26.5607C5.72064 26.842 6.10218 27 6.5 27H14.5C14.6326 27 14.7598 26.9473 14.8536 26.8536C14.9473 26.7598 15 26.6326 15 26.5V17.5C15 17.3674 14.9473 17.2402 14.8536 17.1464C14.7598 17.0527 14.6326 17 14.5 17H5.5ZM14 18V26H6.5C6.43429 26.0002 6.36919 25.9874 6.30844 25.9623C6.24769 25.9373 6.19249 25.9004 6.146 25.854L14 18Z" fill="black" />
						<path d="M6 1C5.34339 1 4.69321 1.12933 4.08658 1.3806C3.47995 1.63188 2.92876 2.00017 2.46447 2.46447C1.52678 3.40215 1 4.67392 1 6V26C1 27.3261 1.52678 28.5979 2.46447 29.5355C2.92876 29.9998 3.47995 30.3681 4.08658 30.6194C4.69321 30.8707 5.34339 31 6 31H26C27.3261 31 28.5979 30.4732 29.5355 29.5355C30.4732 28.5979 31 27.3261 31 26V6C31 5.34339 30.8707 4.69321 30.6194 4.08658C30.3681 3.47995 29.9998 2.92876 29.5355 2.46447C29.0712 2.00017 28.52 1.63188 27.9134 1.3806C27.3068 1.12933 26.6566 1 26 1H6ZM3 6C3 5.20435 3.31607 4.44129 3.87868 3.87868C4.44129 3.31607 5.20435 3 6 3H26C26.7956 3 27.5587 3.31607 28.1213 3.87868C28.6839 4.44129 29 5.20435 29 6V26C29 26.7956 28.6839 27.5587 28.1213 28.1213C27.5587 28.6839 26.7956 29 26 29H6C5.20435 29 4.44129 28.6839 3.87868 28.1213C3.31607 27.5587 3 26.7956 3 26V6Z" fill="black" />
					</svg>
				</button>
				<button onClick={() => handleLigher("random")}>
					<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g clip-path="url(#clip0_206_8)">
							<path d="M20.2667 26.6667V27.7333C20.5496 27.7333 20.8209 27.621 21.0209 27.4209C21.221 27.2209 21.3333 26.9496 21.3333 26.6667H20.2667ZM11.7333 26.6667H10.6667C10.6667 26.9496 10.779 27.2209 10.9791 27.4209C11.1791 27.621 11.4504 27.7333 11.7333 27.7333V26.6667ZM12.8 32H19.2V29.8667H12.8V32ZM7.63733 13.6533L7.616 13.8027L9.728 14.1013L9.75147 13.952L7.63733 13.6533ZM16 6.4C13.9664 6.39966 12.0009 7.13309 10.4647 8.46557C8.92838 9.79804 7.92448 11.6401 7.63733 13.6533L9.75147 13.952C9.96665 12.4477 10.7151 11.0715 11.8634 10.0761C13.0116 9.08069 14.4804 8.53291 16 8.53333V6.4ZM24.3627 13.6533C24.0755 11.6401 23.0716 9.79804 21.5354 8.46557C19.9991 7.13309 18.0336 6.39966 16 6.4V8.53333C17.5195 8.53336 18.988 9.0813 20.1362 10.0766C21.2843 11.0719 22.0351 12.4479 22.2507 13.952L24.3627 13.6533ZM24.384 13.8027L24.3627 13.6533L22.2507 13.952L22.2699 14.1013L24.384 13.8027ZM22.6987 20.1792C24.0427 18.4427 24.7211 16.1813 24.384 13.8027L22.272 14.1035C22.3942 14.9424 22.3457 15.7973 22.1294 16.617C21.9131 17.4366 21.5335 18.2042 21.0133 18.8736L22.6987 20.1792ZM19.2 23.2533V26.6667H21.3333V23.2555H19.2V23.2533ZM20.2667 25.6H11.7333V27.7333H20.2667V25.6ZM12.8 26.6667V23.2555H10.6667V26.6667H12.8ZM7.616 13.8027C7.45383 14.9242 7.5195 16.067 7.80908 17.1626C8.09865 18.2582 8.60619 19.2842 9.30133 20.1792L10.9888 18.8736C10.4686 18.2042 10.0869 17.4366 9.87062 16.617C9.65433 15.7973 9.60582 14.9402 9.728 14.1013L7.616 13.8027ZM12.8 23.2533C12.8 21.4976 11.8656 20.0043 10.9867 18.8715L9.30133 20.1792C10.1184 21.2352 10.6667 22.2421 10.6667 23.2533H12.8ZM21.0133 18.8715C20.1323 20.0064 19.2 21.4976 19.2 23.2533H21.3333C21.3333 22.2421 21.8816 21.2352 22.6987 20.1792L21.0133 18.8715ZM14.9333 0V4.26667H17.0667V0H14.9333ZM0 17.0667H4.26667V14.9333H0V17.0667ZM27.7333 17.0667H32V14.9333H27.7333V17.0667ZM7.1552 7.77813L3.9552 4.57813L2.4448 6.08853L5.6448 9.28853L7.1552 7.77813ZM26.3552 9.28853L29.5552 6.08853L28.0448 4.57813L24.8448 7.77813L26.3552 9.28853Z" fill="black" />
						</g>
						<defs>
							<clipPath id="clip0_206_8">
								<rect width="32" height="32" fill="white" />
							</clipPath>
						</defs>
					</svg>
				</button> */}
			</div>
            {(selectedBuilding && canCancel) &&
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