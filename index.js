const express = require('express');
const fs = require('fs')
const xml2js = require('xml2js');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

const uri = ''

const Game = mongoose.model('gameOwned', {
	id: String,
	timestamp: Date
  });

async function connect(){
	try {
		await mongoose.connect(uri);
		console.log("Connected to MongoDB")
	} catch (err){
		console.error(err)
	}
}


connect();

app.listen(port, () => {
	console.log("Server started at port", port)
});


app.get('/howmanygameowned', async (req, res) => {
	try {
		const count = await Game.countDocuments();
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
	res.json(await Game.find())
})


app.get('/jeuxpossedes', async (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	try {
		const game = await Game.findOne({ id: gameID });
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
		const game = await Game.findOne({ id: gameID });
		if (game) {
			await Game.deleteOne({ id: gameID });
			res.json({ result: true });
		} else {
			const newGame = new Game({
				id: gameID,
				timestamp: Date.now()
			});
			await newGame.save();
			res.json({ result: false });
		}
	} catch (err) {
		console.error('Erreur lors de l\'exécution de la requête :', err.message);
		res.status(500).json({ error: err.message });
	}
});


