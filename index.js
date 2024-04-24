require('dotenv').config()

const { leerDB } = require('../04-TAREAS-HACER/helper/guardarArchivo');
const { leerInput, inquireMenu, pausaMenu, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

// console.log(process.env.LOCATIONIQ_KEY);

const main = async () => {

    const busquedas = new Busquedas();
    let opt;

    const historialDB = leerDB();

    if(historialDB){
        busquedas.historialCapitalizado(historialDB)
    }

    do {
        opt = await inquireMenu();

        switch (opt) {
            case 1:
                // Mostrar mensaje
                const termino = await leerInput('Escribe la ciudad: ')

                // Buscar los lugares
                const lugares = await busquedas.ciudad(termino);

                // Seleccionar el lugar
                const id = await listarLugares(lugares);
                if(id === '0') continue;

                const lugarSel = lugares.find( l => l.id === id);

                // Guardar en DB
                busquedas.agregarHistorial(lugarSel.nombre);

                // Clima
                const latitud = lugarSel.lat;
                const longitud = lugarSel.lng;
                const clima = await busquedas.climaLugar(latitud, longitud);
                // console.log({clima});

                // Mostrar resultados
                console.log('\nInformación de la ciudad.\n'.green);
                console.log('Ciudad:', lugarSel.nombre);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Descripción:', clima.desc);
                console.log('Temperatura:', clima.temp );
                console.log('Mínima:', clima.min);
                console.log('Máxima:', clima.max);

                break;

            case 2:
                // historial
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i + 1}.`.green;
                    console.log(`${idx} ${lugar}`);
                })
                break;

        }

        await pausaMenu();

    } while (opt !== 0);



}


main();