#!/usr/bin/env node
const dotenv = require("dotenv")
dotenv.config()
if (process.env.TOKEN === undefined) {
    log("error", "no TOKEN in .env file or environment")
    process.exit(1);
}

const http = require("http")
const ngrok = require("ngrok")
const request = require("request");

const Emitter = require("events")
const emitter = new Emitter();

(async function () {
    _ = await startServer(3000)
    u = await ngrok.connect(3000)
    log("server", "accessible at", u)

    try {
        // get workspace
        console.time("⏱  configure")
        w = await listWorkspaces()
        wn = w.workspaces[0].name
        log("workspace", wn)

        // create source
        sn = "sources/hookshot"
        _ = await deleteSource(wn, sn)
        s = await createSource(wn, sn)
        log("source", s.name)

        // create dest
        d = await createDest(wn, sn, u)
        log("dest", d.name)
        console.timeEnd("⏱  configure")

        // send event
        console.time("⏱  send/recv")
        e = await createEvent(s)
        log("event", e)

        // receive webhook
        r = await receiveEvent()
        log("request", r.messageId)
        console.timeEnd("⏱  send/recv")
    } catch (errorRes) {
        log("ERROR", errorRes.statusCode, errorRes.body)
        process.exit(1)
    }

    process.exit(0)
})()

function log(step, ...args) {
    console.log(`${step}:`.padEnd(13), ...args)
}

async function startServer(port) {
    const requestHandler = (request, response) => {
        let body = []
        request.on('data', (chunk) => {
            body.push(chunk)
        }).on('end', () => {
            body = JSON.parse(Buffer.concat(body).toString())
            response.end('Hello Node.js Server!')
            emitter.emit('event', body)
        })
    }

    await http.createServer(requestHandler).listen(port, (err) => {
        if (err) return console.log('something bad happened', err)
        log("server", `listening on ${port}`)
    })
}

async function receiveEvent() {
    return new Promise(function (resolve, reject) {
        emitter.on('event', (e) => {
            resolve(e)
        })
    })
}

async function req(method, url, body, headers, user, pass) {
    var options = { method, url, body, headers, json: true };

    if (user !== undefined)
        options.auth = { user, pass }

    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (error) return reject(error);

            if (response.statusCode >= 400) return reject(response)

            resolve(body)
        });

    })
}

async function reqBearer(method, url, body) {
    return req(method, url, body, {
        "Authorization": `Bearer ${process.env.TOKEN}`,
        "Content-Type": "application/json"
    })
}

async function listWorkspaces() {
    return reqBearer("GET", "https://platform.segmentapis.com/v1beta/workspaces")
}

async function deleteSource(w, s) {
    return reqBearer("DELETE", `https://platform.segmentapis.com/v1beta/${w}/${s}`)
}

async function createSource(w, s) {
    return reqBearer("POST", `https://platform.segmentapis.com/v1beta/${w}/sources`, {
        "source": {
            "name": `${w}/${s}`,
            "catalog_name": "catalog/sources/javascript"
        }
    })
}

async function createDest(w, s, url) {
    return reqBearer("POST", `https://platform.segmentapis.com/v1beta/${w}/${s}/destinations`, {
        "destination": {
            "name": `${w}/${s}/destinations/webhooks`,
            "config": [
                {
                    "name": `${w}/${s}/destinations/webhooks/config/hooks`,
                    "type": "mixed",
                    "value": [
                        {
                            "hook": url
                        }
                    ]
                }
            ],
            "connection_mode": "CLOUD",
            "enabled": true
        }
    })
}

async function createEvent(s) {
    return req("POST", "https://api.segment.io/v1/track", {
        "event": "User Created",
        "userId": "78e56a08-ad10-42b1-88d2-b823623ac875",
        "properties": {
            "username": "user1"
        },
        "context": {
            "library": "postman"
        }
    }, { "Content-Type": "application/json" }, s.write_keys[0])
}