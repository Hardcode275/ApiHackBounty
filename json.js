const axios = require('axios');
const fs = require('fs');

const url = "https://hackscan.hackbounty.io/public/hack-address.json";

async function fetchAndSaveData() {
    try {
        const response = await axios.get(url);
        console.log("Datos recibidos:", response.data);

        // Guardar en un archivo JSON
        fs.writeFileSync('data.json', JSON.stringify(response.data, null, 2));
        console.log("Datos guardados en data.json");
    } catch (error) {
        console.error("Error en la solicitud:", error.message);
    }
}

fetchAndSaveData();
