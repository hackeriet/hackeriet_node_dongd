require('dotenv').config();
const mqtt = require('mqtt')
const { exec } = require("child_process");
const client = new mqtt.connect(process.env.MQTT_URL, {rejectUnauthorized:false, username: process.env.MQTT_USER, password: process.env.MQTT_PASS, ca: "/etc/ssl/certs/ca-certificates.crt",  })

client.on('connect', function () {
    console.log("Connected")
    client.subscribe('hackeriet/ding', function (err) {
        if (!err) {
            console.log("Subscribe")
        }
    })
})

client.on('message', function (topic, message) {
    // message is Buffer
    if (topic === "hackeriet/ding") {
        let msg = message.toString().split("<")[0].replace(/[^a-zA-Z ]/g, "")

        exec(`espeak-ng -v nb "DingDong ${msg}"`)
    }
})