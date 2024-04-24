const fs = require('fs');

const axios = require('axios');


class Busquedas {

    historial = [];
    dbPath = './db/database.json'

    constructor() {
        //TODO: leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado(){
        // Capitalizar cada palabra
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');
        });
    }

    get paramsLocationIQ() {
        return {
            'format': 'JSON',
            'key': process.env.LOCATIONIQ_KEY,
            'limit': 5,
            'accept-language': 'es',
        }
    }

    get paramsOpenWeather() {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'lang': 'es',
            'units': 'metric',
            'format': 'JSON',
        }
    }

    async ciudad(lugar = '') {

        try {
            // Petición http
            const instance = axios.create({
                baseURL: `https://us1.locationiq.com/v1/search?q=${lugar}`,
                params: this.paramsLocationIQ
            });


            const resp = await instance.get();
            return resp.data.map(lugar => ({
                id: lugar.place_id,
                nombre: lugar.display_name,
                lng: lugar.lon,
                lat: lugar.lat,
            }));

        } catch (error) {
            return [];
        }

    }

    async climaLugar(lat, lon) {
        try {

            // instance
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}`,
                params: this.paramsOpenWeather
            });

            const resp = await instance.get();

            const { weather, main } = resp.data;
            // resp.data

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp,
            }


        } catch (error) {
            return [];
        }
    }

    agregarHistorial(lugar = '') {

        if (this.historial.includes(lugar.toLocaleLowerCase())) return;

        this.historial = this.historial.splice(0,5);

        this.historial.unshift(lugar.toLocaleLowerCase());

        // Grabar en DB
        this.guardarDB();
    }


    guardarDB() {

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));

    }

    leerDB() {

        // Debe de existir DB
        if (!fs.existsSync(this.dbPath)) return;
    
        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);
    
        this.historial = data.historial;

    }
}


module.exports = Busquedas;