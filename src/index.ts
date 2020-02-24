#!/usr/bin/env node

import DateTimeFormat = Intl.DateTimeFormat;

const program = require('commander'); // (normal include)
const request = require('request')
const fs = require('fs');

type currency = "PLN" | "RUB" | "USD" | "EUR" | "BYN" | "GBP" | "MDL";

type responceSymbolSearch = { error: boolean, msg?: string, value: {} [] }
type responce = { error: boolean, msg?: string, value?: number }

class exchanger {
    private amount: number;
    private from: { name: currency };
    private to: { name: currency };

    constructor(amount: number, from: { name: currency }, to: { name: currency }) {
        this.amount = amount
        this.from = from
        this.to = to
    }
}

class Quota {
    private name: string;


    constructor(name: string) {
        this.name = name
    }
}

function consoleLogRes(res: responce) {
    if (res.error) {
        console.log(res.msg);
        return
    }
    console.log(res.value)

}

class Command {


    static add(name: "quota" | "change", parameters: string, res: responceSymbolSearch | responce) {


        let obj = {
            name: name,
            parameters: parameters,
            res: res,
            date: new Date().toString()
        }

        try {
            let file = JSON.parse(fs.readFileSync('file.json', 'utf-8'))
            file.push(obj)
            fs.writeFileSync('file.json', JSON.stringify(file, null, 2));
        } catch (e) {
            fs.writeFileSync('file.json', JSON.stringify(obj, null, 2));
        }

    }

}

program
    .command('change amount from to')
    .description(' makes a post request ')
    .action(function (amount: number, from: currency, to: currency) {

        const obj = new exchanger(parseInt(amount.toString()), {name: from}, {name: to})
        request.post({
            url: 'http://b840065b.ngrok.io/exchange',
            json: (obj)

        }, function (err: Error, response: responce, body: responce) {
            Command.add("change", (amount + " " + from + " " + to).toString(), body)
            consoleLogRes(body)
        });

    });

program
    .command('quota symbol ')
    .description(' makes a post request ')
    .action(function (symbol: string) {
        let obj = new Quota(symbol)
        request.post({
            url: 'http://b840065b.ngrok.io/quota',
            json: (obj)

        }, function (err: Error, response: responce, body: responce) {
            consoleLogRes(body)
            if (body.error) {
                request.post({
                    url: 'http://b840065b.ngrok.io/symbol_search',
                    json: (obj)

                }, function (err: Error, response: responce, body: responceSymbolSearch) {
                    Command.add("quota", (symbol).toString(), body)
                });
            } else {
                Command.add("quota", (symbol).toString(), body)
            }
        });
    });


program.parse(process.argv);
