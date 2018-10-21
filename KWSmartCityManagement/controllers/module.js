const { promisify } = require('util');
const request = require('request');
const cheerio = require('cheerio');
var YQL = require('yql');
var google = require('google-charts')
/**
 * GET /modules/weather
 * Modules.
 */


exports.getAgriculture = (req, res) => {
    res.render('modules/agriculture', {
        title: 'Agriculture'
    });
};


exports.getAnalytics = (req, res) => {
    res.render('modules/analytics', {
        title: 'Analytics'
    });
};

exports.getEgov = (req, res) => {
    res.render('modules/egovernance', {
        title: 'E-Governance'
    });
};


exports.getEnergydemand = (req, res) => {
    res.render('modules/energydemand', {
        title: 'Energy Demand'
    });
};

exports.getHealthcare = (req, res) => {
    res.render('modules/healthcare', {
        title: 'Health Care'
    });
};


exports.getOtheralerts = (req, res) => {
    res.render('modules/otheralerts', {
        title: 'Other Alerts'
    });
};

exports.getPublicworks = (req, res) => {
    res.render('modules/publicworks', {
        title: 'Public Works'
    });
};


exports.getRealestate = (req, res) => {
    res.render('modules/realestate', {
        title: 'Real Estate'
    });
};

exports.getTraffic = (req, res) => {
    res.render('modules/traffic', {
        title: 'Traffic'
    });
};

exports.getWeather = (req, res, next) => {


    var query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="chicago, IL")');

    query.exec(function(err, data) {
        console.log(data.query.results);
        const temp = data.query.results.channel.item.condition.temp;
        const rain = data.query.results.channel.item.condition.text;
        const wind = data.query.results.channel.wind.speed;
        const visibility = data.query.results.channel.atmosphere.visibility;
        const humidity = data.query.results.channel.atmosphere.humidity;
        const desc = data.query.results.channel.item.description
        res.render('modules/weather', {
            title: 'Weather',
            temp,
            rain,
            wind,
            visibility,
            desc,
            humidity
        });
    });

};