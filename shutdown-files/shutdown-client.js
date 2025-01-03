const express = require("express")
const fs = require("fs")
const { exec } = require("child_process")
const app = express()
const port = 4021

const configPath = "./config.json"
let config

try {
	const data = fs.readFileSync(configPath)
	config = JSON.parse(data)
} catch (err) {
	console.error("Error reading config.json:", err)
	process.exit(1)
}

app.use(express.json())

app.post("/shutdown", (req, res) => {
    const { token } = req.body
    if (token !== config.token) {
        return res.status(403).json({ message: "Forbidden: Invalid token" })
    }

    res.json({ message: "Server is shutting down..." })
    console.log("Server is shutting down...")
    exec("/sbin/shutdown now", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error shutting down: ${error}`)
            return res.status(500).json({ message: "Failed to shutdown the server" })
        }
    })
})

app.listen(port, () => {
	console.log(`Shutdown server API listening at http://localhost:${port}`)
})