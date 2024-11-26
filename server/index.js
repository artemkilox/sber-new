const express = require('express')
const cors = require('cors')
const PORT = 5000
const https = require('https');
const fs = require('fs');

// let jsonFile = require('./serverLog.json');

const {SerialPort} = require("serialport")
const PORRT_NAME = "COM3"
// const esp = new SerialPort({
//     path: "COM3",
//     baudRate:115200,
// })

const ex = require("xlsx");
// const {json} = require("express");
const workbook = ex.readFile("table.xlsx")
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const jsa = ex.utils.sheet_to_json(sheet); // 629

let logJSON = []

// console.log(jsa)
let selectedBuilding = ''

// const getData = (url) => {
//     return new Promise((resolve) => {
//         fetch(url).then(res => res.json()).then(json => {
//             // console.log(json)
//             console.log("resolve")
//             resolve(json)
//             // return json
//         })
//     })
// }

const writeLogAparts = (aparts) => {
    console.log("writing")
    fs.writeFile("serverLog.json", JSON.stringify(aparts), 'utf8', (err) => {
        if (err) console.log(err);
        else {
            console.log("File written successfully\n");
        }
    });
}

const app = express()
app.use(cors())
app.use(express.json())
app.get('/getAparts', async (req, res) => {

    // const url = 'https://172.20.240.25/api/v1/api/flats/' // Правильная
    const url = 'https://sbercity.ru/api/v1/api/flats/' // Тестовая новая
    // const url = 'https://172.220.240.25/api/v1/api/flats/' // Неправильная

    const data = await new Promise((resolve) => {
        fetch(url).then(res => res.json()).then(json => {
            resolve(json)
            // writeLogAparts("")
        })
    })

    return res.json(data)
})
app.get('/getLocal', (req, res) => {
    fs.readFile('serverLog.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            const json = JSON.parse(data); //now it an object
            console.log(data)
            return res.json(json)
            // obj.table.push({id: 2, square:3}); //add some data
            // json = JSON.stringify(obj); //convert it back to json
            // fs.writeFile('myjsonfile.json', json, 'utf8', callback); // write it back 
    }});
})
app.get('/getApartsLim/:offset', async (req, res) => {
    const {offset} = req.params
    const url = 'https://sbercity.ru/api/v1/api/flats/?limit=100&offset=' + offset

    const data = await new Promise((resolve) => {
        fetch(url).then(res => res.json()).then(json => {
            // console.log(json.results)

            // fs.writeFile("serverLog.json", JSON.stringify(logJSON), 'utf8', (err) => {
            //     if (err) console.log(err);
            //     else {
            //         console.log("File written successfully\n");
            //     }
            // });
            resolve(json)
        })
    })

    logJSON.push(...data.results)
    //
    // console.log(JSON.stringify(logJSON))
    //
    // writeLogAparts("aparts")

    return res.json(data)

})
app.post('/', (req, res) => {
    const {data} = req.body
    console.log(data + " МЫ ТУТ")
    if (data.includes("park"))
        esp.write("P")
    res.sendStatus(200)
})
app.post('/building', (req, res) => {
    const {data} = req.body
    console.log(data + " МЫ ТУТ")
    selectedBuilding = "B" + data.toUpperCase()
    res.sendStatus(200)
})

const findApart = (apartNumber) => {
    return jsa.filter(apart => apart['строение'] === selectedBuilding && apart['квартира'] === Number(apartNumber))[0]
}
const getString = (apartNumber) => {
    const apart = findApart(apartNumber)
    // console.log(apart)
    const str = apart['пин'] + ";" + apart['кол-во штук'] + ";" +
    (apart['штука 1 нач.'] ? apart['штука 1 нач.'] + ";" : "") + (apart['штука 1 кон.'] ? apart['штука 1 кон.'] + ";" : "")  +
    (apart['штука 2 нач.'] ? apart['штука 2 нач.'] + ";" : "") + (apart['штука 2 кон.'] ? apart['штука 2 кон.'] + ";" : "")  +
    (apart['штука 3 нач.'] ? apart['штука 3 нач.'] + ";" : "") + (apart['штука 3 кон.'] ? apart['штука 3 кон.'] : "")
    // console.log(str)
    return str
}
app.post('/oneApart', (req, res) => {
    const {data} = req.body
    // console.log(data)
    try{
        const str = getString(data)
        console.log(str)
    } catch{
        console.log("Этой квартиры нет в файле с подсветкой" + "Квартира - " + data)
    }    
    res.sendStatus(200)
})
app.post('/manyAparts', (req, res) => {
    const {data} = req.body
    // console.log(data)
    try{
        const strArr = data.map(item => 
            getString(item)
        )
        console.log(strArr)
    } catch{
        console.log("Какой-то из квартрир нет в файле с подсветкой" + "Здание - " + selectedBuilding)
    }
    res.sendStatus(200)
})

const start = async () => {
    try{
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e){
        console.log(e)
    }
}
start()