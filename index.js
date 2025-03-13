#!/usr/bin/env node

const express = require('express');
const morgan = require('morgan');
const qrcode = require('qrcode-terminal');
const { randomBytes } = require('crypto');
const { networkInterfaces } = require('os');
const { select } = require('@inquirer/prompts');
const app = express();
const port = process.env.PORT || 3000;
let nic = process.argv[2];
let file = process.argv[3];



async function init() {


    if (file === undefined) {

        if (nic === undefined) {
            throw new Error("Paylaşılacak dosya seçili değil!!!")
        }

        file = nic;
        let nics = Object.getOwnPropertyNames(networkInterfaces())
        nic = await select({
            message: "NIC Seç",
            choices: nics
        })
    }

    let ip;
    try {

        ip = networkInterfaces()[nic].find(ip => ip.family === 'IPv4').address;
    } catch (e) {
    } finally {


        if (!ip) {
            for (const nic in networkInterfaces()) {
                console.log(nic)
            }
            console.log("Nic Bulunamadı!!!");
            process.exit(1);
        }
    }


    const id = randomBytes(2).toString('hex');
    const url = `http://${ip}:${port}/${id}`;


    app.use(morgan('combined'));

    app.get(`/${id}`, (req, res) => {
        res.download(file);

    })

    app.listen(port, ip, () => {
        qrcode.generate(url);
        console.log(url)
    })
}

init()