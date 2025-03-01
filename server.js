require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Bottleneck = require('bottleneck');
const fs = require('fs');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 3000;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_URL = "https://api.etherscan.io/api";

console.log("ETHERSCAN_API_KEY:", ETHERSCAN_API_KEY);
console.log("PORT:", PORT);

app.use(cors());

const limiter = new Bottleneck({
    maxConcurrent: 1, // Número máximo de solicitudes simultáneas
    minTime: 300    // Tiempo mínimo entre solicitudes (ms)
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
            timeout: 20000 
        });

        if (response.data.status !== "1") {
            console.error(`Error en la respuesta de Etherscan para ${address}:`, response.data);
            throw new Error(`Error en la respuesta de Etherscan: ${response.data.message}`);
        }

        return {
            address,
            balance: response.data.result / 1e18 // Convertir el balance a Ether
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
        console.log("Cargando direcciones desde el archivo JSON...");
        const filePath = path.join(__dirname, 'json', 'data.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const addresses = JSON.parse(data);
        console.log("Addresses received:", addresses);

        // Extraer y filtrar las direcciones de Ethereum
        const ethAddresses = addresses['0221'].eth.slice(0, 1000); /**
        en esta parte se filtra las solicitudes deseadas si uno desea poder ver aun mas recordar mover 
        el maximo de solicitudes esperadas y el tiempo maximo de respuesta sino la etherscan dara error*/
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
