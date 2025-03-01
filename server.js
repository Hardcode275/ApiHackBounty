require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Bottleneck = require('bottleneck');

const app = express();
const PORT = process.env.PORT || 3000;

const HACKSCAN_URL = "https://hackscan.hackbounty.io/public/hack-address.json";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_URL = "https://api.etherscan.io/api";

// Verificar que las variables de entorno están cargadas
console.log("ETHERSCAN_API_KEY:", ETHERSCAN_API_KEY);
console.log("PORT:", PORT);

// Habilitar CORS
app.use(cors());

// Limitar el número de solicitudes simultáneas a la API de Etherscan
const limiter = new Bottleneck({
    maxConcurrent: 5, // Número máximo de solicitudes simultáneas
    minTime: 250 // Tiempo mínimo entre solicitudes en ms (4 solicitudes por segundo)
});

// Función para obtener el balance de una dirección
async function getEthereumBalance(address) {
    try {
        const response = await axios.get(ETHERSCAN_URL, {
            params: {
                module: "account",
                action: "balance",
                address: address,
                tag: "latest",
                apikey: ETHERSCAN_API_KEY
            },
            timeout: 20000 // Aumentar el tiempo de espera a 20 segundos
        });

        if (response.data.status !== "1") {
            console.error(`Error en la respuesta de Etherscan para ${address}:`, response.data);
            throw new Error(`Error en la respuesta de Etherscan: ${response.data.message}`);
        }

        return {
            address,
            balance: response.data.result / 1e18 // Convertir Wei a ETH
        };
    } catch (error) {
        console.error(`Error obteniendo balance de ${address}:`, error.message);
        console.error(`Detalles del error:`, error.response ? error.response.data : error);
        return { address, balance: 0 };
    }
}

// Endpoint para obtener los balances de las wallets
app.get('/top-wallets', async (req, res) => {
    try {
        console.log("Fetching addresses from Hackscan...");
        const hackscanResponse = await axios.get(HACKSCAN_URL);
        const addresses = hackscanResponse.data;
        console.log("Addresses received:", addresses);

        // Extraer las direcciones de Ethereum
        const ethAddresses = addresses['0221'].eth;
        console.log("Ethereum addresses:", ethAddresses);

        // Verificar si la respuesta es un array
        if (!Array.isArray(ethAddresses)) {
            console.error("Las direcciones de Ethereum no son un array:", ethAddresses);
            throw new Error("Las direcciones de Ethereum no son un array");
        }

        // Obtener balances de todas las direcciones con limitación de solicitudes
        const balancePromises = ethAddresses.map(addr => limiter.schedule(() => getEthereumBalance(addr)));
        const walletsWithBalances = await Promise.all(balancePromises);
        console.log("Wallets with balances:", walletsWithBalances);

        // Devolver todos los balances obtenidos
        res.json(walletsWithBalances);
    } catch (error) {
        console.error("Error al obtener los datos:", error.message);
        res.status(500).json({ error: "Error al obtener los datos" });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}/top-wallets`);
});
