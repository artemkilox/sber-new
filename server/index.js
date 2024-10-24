const express = require('express')
const cors = require('cors')
const PORT = 5000

const app = express()
app.use(cors())
app.use(express.json())
app.get('/getAparts', (req, res) => {
    const request = require("request");
    // const response = request.get('http://172.20.210.10/api/v1/api/flats/', verify=false)
    const url = 'http://172.20.210.10/api/v1/api/flats/'
    const options = {
        url: url,
        // url: 'https://level.ru/api/flat/cropped_list?windows_directions="south"',
        verify: false
    };
    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            const info = JSON.parse(body);
            console.log(info)
            return res.json(info)
        }
    }
    request(options, callback);
})
const start = async () => {
    try{
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e){
        console.log(e)
    }
}
start()