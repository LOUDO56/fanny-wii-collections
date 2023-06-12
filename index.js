const express = require('express');
const fs = require('fs')
const xml2js = require('xml2js');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

const db = new sqlite3.Database('./wiigamecollected.db', sqlite3.OPEN_READWRITE, (err)=>{
	if (err) return console.error(err.message);

	console.log("Connected to database")
});


app.listen(port, () => {
	console.log("Server started at port", port)
});


// app.get('/howmanygameowned', async (req, res) => {
// 	try {
// 		const count = await Game.countDocuments();
// 		res.json({ count });
// 	} catch (err) {
// 		console.error('Erreur lors de la récupération du nombre de documents dans la collection "Game":', err);
// 		res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération du nombre de documents.' });
// 	}
// 	});





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




app.get('/jeuxpossedes', (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT * FROM jeupossedes WHERE id = ?`, [gameID], (err, row) => {
		if (err) {
			console.error('Erreur lors de l\'exécution de la requête :', err.message);
		} else {
		if (row) {
			res.json({result: true})
		} else {
			res.json({result: false})
		}
	}
	});
});


app.get('/ajoutsuppr', (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT * FROM jeupossedes WHERE id = ?`, [gameID], (err, row) => {
		if (err) {
			console.error('Erreur lors de l\'exécution de la requête :', err.message);
		} else {

			if (row) {

				db.run(`DELETE FROM jeupossedes WHERE id = ?`, [gameID], (err) => {
					if (err) return console.error("Erro during inserting id to database: ", err.message);
				});
				res.json({result: true})
			} else {
				db.run(`INSERT INTO jeupossedes VALUES (?,?)`, [gameID, Date.now()], (err) => {
					if (err) return console.error("Erro during inserting id to database: ", err.message);
				});
				res.json({result: false})
			}
		}
	});
});