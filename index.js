const axios = require('axios');

const url = "https://hackscan.hackbounty.io/public/hack-address.json";

async function fetchHackAddresses() {
    try {
        const response = await axios.get(url);
        console.log("Datos recibidos:", response.data);
    } catch (error) {
        console.error("Error en la solicitud:", error.message);
    }
}

// Ejecutar la función para obtener los datos
fetchHackAddresses();
