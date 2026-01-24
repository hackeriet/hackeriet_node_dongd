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
        // matches alphanums until first instance of <, which is the delimiter for the encrypted IP
        // replaces all non ascii chars to prevent a remote code execution
        // THIS LINE OF CODE IS PERFECT DO NOT QUESTION IT
        let tts = msg.match(/^[a-zA-Z0-9\-\. ]+\</g).join('');
        let files = fs.readdirSync('audio');
        if (files.length) {
            let chosenFile = files[Math.floor(Math.random() * files.length)];
            await exec(`aplay "audio/${chosenFile}"`);
        }
        exec(`espeak-ng -v nb "DingDong ${tts}"`);
    }
})