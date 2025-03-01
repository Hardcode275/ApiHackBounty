## ApiHackBounty

ApiHackBounty es una API en desarrollo que permite obtener los balances de direcciones de Ethereum y Bitcoin utilizando las APIs de Etherscan y Blockchair. En futuras versiones, se agregarán más conexiones con otras APIs para mejorar la funcionalidad.

## 🚀 Requisitos

- **Node.js** (v14 o superior)
- **npm** (v6 o superior)

## 📥 Instalación

1. **Clona el repositorio:**
    ```
    git clone https://github.com/tu-usuario/ApiHackBounty.git
    cd ApiHackBounty
    ```

2. **Instala las dependencias:**
    ```
    npm install
    ```

3. **Configura las variables de entorno:**
   
   Crea un archivo `.env` en la raíz del proyecto y agrega tu clave de API de Etherscan:
    ```env
    ETHERSCAN_API_KEY=tu_clave_de_api_de_etherscan
    PORT=3000
    ```

4. **Añade el archivo JSON con direcciones**
   
   Asegúrate de que exista la carpeta `json/` y dentro un archivo `data.json` con la siguiente estructura:
    ```
    {
        "0221": {
            "eth": [
                "0x...",
                "0x..."
            ],
            "btc": [
                "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                "1BoatSLRHtKNngkdXEeobR76b53LETtpyT"
            ]
        }
    }
    ```

## 🚀 Uso

1. **Inicia el servidor:**
    ```
    npm start
    ```

2. **Accede a los endpoints disponibles:**
    ```
    http://localhost:3000/top-wallets
    ```

## 🔗 Endpoints

### 📌 `GET /top-wallets`
Obtiene los balances de las direcciones de Ethereum y Bitcoin.

#### 🟢 **Ejemplo de respuesta:**
```
{
    "ethereum": [
        {
            "address": "0x...",
            "balance": 1.234
        }
    ],
    "bitcoin": [
        {
            "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            "balance": 0.567
        }
    ]
}
```

## 📜 Licencia
Este proyecto está bajo la licencia MIT.

