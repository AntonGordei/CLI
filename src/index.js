#!/usr/bin/env node
"use strict";
var DateTimeFormat = Intl.DateTimeFormat;
var program = require('commander'); // (normal include)
var request = require('request');
var fs = require('fs');
var exchanger = /** @class */ (function () {
    function exchanger(amount, from, to) {
        this.amount = amount;
        this.from = from;
        this.to = to;
    }
    return exchanger;
}());
var Quota = /** @class */ (function () {
    function Quota(name) {
        this.name = name;
    }
    return Quota;
}());
function consoleLogRes(res) {
    if (res.error) {
        console.log(res.msg);
        return;
    }
    console.log(res.value);
}
var Command = /** @class */ (function () {
    function Command() {
    }
    Command.add = function (name, parameters, res) {
        var obj = {
            name: name,
            parameters: parameters,
            res: res,
            date: new Date().toString()
        };
        try {
            var file = JSON.parse(fs.readFileSync('file.json', 'utf-8'));
            file.push(obj);
            fs.writeFileSync('file.json', JSON.stringify(file, null, 2));
        }
        catch (e) {
            fs.writeFileSync('file.json', JSON.stringify(obj, null, 2));
        }
    };
    return Command;
}());
program
    .command('change amount from to')
    .description(' makes a post request ')
    .action(function (amount, from, to) {
    var obj = new exchanger(parseInt(amount.toString()), { name: from }, { name: to });
    request.post({
        url: 'http://b840065b.ngrok.io/exchange',
        json: (obj)
    }, function (err, response, body) {
        Command.add("change", (amount + " " + from + " " + to).toString(), body);
        consoleLogRes(body);
    });
});
program
    .command('quota symbol ')
    .description(' makes a post request ')
    .action(function (symbol) {
    var obj = new Quota(symbol);
    request.post({
        url: 'http://b840065b.ngrok.io/quota',
        json: (obj)
    }, function (err, response, body) {
        consoleLogRes(body);
        if (body.error) {
            request.post({
                url: 'http://b840065b.ngrok.io/symbol_search',
                json: (obj)
            }, function (err, response, body) {
                Command.add("quota", (symbol).toString(), body);
            });
        }
        else {
            Command.add("quota", (symbol).toString(), body);
        }
    });
});
program.parse(process.argv);
