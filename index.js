//dotenv reads variables from a .env file and put them into process.env
require('dotenv').config();

const mqtt = require('mqtt')
const { exec } = require("child_process");
//Using FS to find a random sound clip to play
const fs = require('fs');
//Start a new client connection
const client = new mqtt.connect(process.env.MQTT_URL, {rejectUnauthorized:false, username: process.env.MQTT_USER, password: process.env.MQTT_PASS, ca: "/etc/ssl/certs/ca-certificates.crt",  })

client.on('connect', function () {
    console.log("Connected")
    client.subscribe('hackeriet/ding', function (err) {
        if (!err) {
            console.log("Subscribed")
        }
    })
})

client.on('message',async function (topic, message) {
    // message is Buffer
    let msg = message.toString()
    if (topic === "hackeriet/ding") {
        //Splits the message at < as there is a encrypted ip adress passed along with the name in Brackets
        //Replaces all non ascii chars to prevent a remote code execution
        let tts = msg.split("<")[0].replace(/[^a-zA-Z ]/g, "")

        //Passes the data to espeak-ng with a appended DingDong.

        //Play a random file from audio folder
        var files = fs.readdirSync('audio')
        if (files.length) {
            let chosenFile = files[Math.floor(Math.random() * files.length)]
            console.log(chosenFile)
            await exec(`aplay "audio/${chosenFile}"`, () => {
                exec(`espeak-ng -v nb "DingDong ${tts}"`)
            })
        } else {
            //If no files found just tts
            exec(`espeak-ng -v nb "DingDong ${tts}"`)
        }

    }
})