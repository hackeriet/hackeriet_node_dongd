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
            console.log("Subscribed to doorbell")
        }
    })
    client.subscribe('hackeriet/space_state', function (err) {
        if (!err) {
            console.log("Subscribed to space state")
        }
    })
})

let receivedPersistentSpaceStatus = false;
client.on('message',async function (topic, message) {
    let msg = message.toString()

    // Play sound effects for space state changes
    if (topic === "hackeriet/space_state") {
        // The space status is persisted to MQTT, we will receive a copy on
        // subscribe of the persisted state which we need to ignore
        if (!receivedPersistentSpaceStatus) {
            receivedPersistentSpaceStatus = true;
            return;
        }
        if (msg === "OPEN") {
            await exec(`aplay "sfx/space-open.wav"`)
        } else {
            await exec(`aplay "sfx/space-close.wav"`)
        }
    }

    // Announce knocks on the doorbell
    if (topic === "hackeriet/ding") {
        let tts = msg.split("<")[0].replace(/[^a-zA-Z ]/g, "")
        tts = `DingDong ${tts}`;

        await exec('amixer sset PCM 100%')

        // Play a random file from audio folder, if we have any
        var files = fs.readdirSync('audio')
        if (files.length) {
            let chosenFile = files[Math.floor(Math.random() * files.length)]
            await execFile("aplay", [`audio/${chosenFile}`])
        }
        await execFile("espeak-ng", ["-v", "nb", tts])

    }
})
