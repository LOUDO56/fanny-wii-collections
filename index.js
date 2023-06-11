const express = require('express');
const fs = require('fs')
const xml2js = require('xml2js');
const loki = require('lokijs');
const app = express();
const port = 3000;
require('dotenv').config();


const db = new loki('wiigamecollected.db');

const gameList = db.addCollection('gameList');

app.listen(port, () => {
	console.log("Server started at port", port)
});



app.get('/howmanygameowned', async (req, res) => {
	try {
		const count = await gameList.countDocuments();
		res.json({ count });
	} catch (err) {
		console.error('Erreur lors de la récupération du nombre de documents dans la collection "Game":', err);
		res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération du nombre de documents.' });
	}
	});

app.get("/gamelist", (req, res) => {
	fs.readFile('./wiitdb.xml', 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
	
		const parser = new xml2js.Parser();
		parser.parseString(data, (err, result) => {
			if (err) {
				console.error(err);
				return;
			}

			res.json(result.datafile.game)
		});
	});

})


app.get("/arrayjeuxpossedes", async (req, res) => {
	res.json(await gameList.find())
})


app.get('/jeuxpossedes', async (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	try {
		const game = await gameList.findOne({ id: gameID });
		if (game) {
			res.json({ result: true });
		} else {
			res.json({ result: false });
		}
	} catch (err) {
		console.error('Erreur lors de l\'exécution de la requête :', err.message);
		res.status(500).json({ error: err.message });
	}
	});

app.get('/ajoutsuppr', async (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	try {
		const game = await gameList.findOne({ id: gameID });
		if (game) {
			await gameList.remove(game);
			res.json({ result: true });
		} else {
			gameList.insert({
				id: gameID,
				timestamp: Date.now()
			});
			db.saveDatabase();
			res.json({ result: false });
		}
	} catch (err) {
		console.error('Erreur lors de l\'exécution de la requête :', err.message);
		res.status(500).json({ error: err.message });
	}
});


