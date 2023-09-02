
// --------- Partie setup --------- //


const express = require('express');
const fs = require('fs');
const xml2js = require('xml2js');
const sqlite3 = require('sqlite3').verbose()
const cors = require('cors');
const app = express();
require('dotenv').config({ path: 'mdp.env' });
const port = process.env.PORT;

let db = new sqlite3.Database('wiigames.db')

app.listen(port, () => {
	console.log("Server started at port", port)
});

app.use(cors())



// --------- Partie intéraction --------- //


app.get("/img", (req, res) => {
	const gameID = req.query.gameID;
	if(fs.existsSync("Frontend/Images/Covers/Wii_Covers-1/" + gameID + ".png")){
		res.json({img_path: "Frontend/Images/Covers/Wii_Covers-1/" + gameID + ".png"})
	} else if(fs.existsSync("Frontend/Images/Covers/Wii_Covers-2/" + gameID + ".png")){
		res.json({img_path: "Frontend/Images/Covers/Wii_Covers-2/" + gameID + ".png"})
	} else {
		res.json({img_path: "Frontend/Images/Covers/cover_not_found.png"})
	}

})


//Fonction principale pour retourner les jeux
app.get("/gamelist", (req, res) => {
	const request = req.query.filter;
	let sql = `SELECT * FROM wiigames ORDER BY title;`
	if(request === 'games-owned') {sql = `SELECT * FROM wiigames WHERE owned = true ORDER BY title;`}
	if(request === 'games-not-owned') {sql = `SELECT * FROM wiigames WHERE owned = false ORDER BY title;`}
	if(request === 'wish-list') {sql = `SELECT * FROM wiigames INNER JOIN wish_list ON wiigames.id = wish_list.id;`}
	db.all(sql, (err, data) => {
		if (err) return console.error("Erreur durant récupération jeux", err.message)
		res.json(data)
	});
})



//Fonction qui permet de savoir combien de jeu nous avons
app.get('/howmanygameowned', (req, res) => {
	db.get(`SELECT COUNT(*) FROM wiigames WHERE owned = true`, (err, row) => {
		if (err) return console.error("Erreur lors de la récupération de nombre de jeuz possedés", err.message);
		res.json({count: row['COUNT(*)']});
	});
});




// Fonction qui permet de vérifier si le jeu est possédé ou non pour l'affichage HTML
app.get('/jeuxpossedes', (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT owned FROM wiigames WHERE id = ?;`, [gameID], (err, row) => {
		if (err) {
			console.error('Erreur lors de l\'exécution de la requête :', err.message);
		} else {
			if (row !== undefined && row.owned === 1) {
				res.json({result: true})
			} else {
				res.json({result: false})
			}
	}
	});
});



// Fonction qui permet d'ajouter un jeu ou le supprimer
app.get('/ajoutsuppr', (req, res) => {
	if(req.query.password !== process.env.MDP){return;}
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT owned FROM wiigames WHERE id = ?;`, [gameID], (err, row) => {
		if (err) {
			console.error('Erreur lors de l\'exécution de la requête :', err.message);
		} else {
			if (row !== undefined && row.owned === 1) {
				db.run(`UPDATE wiigames SET owned = 0 WHERE id = ?;`, [gameID], (err) => {
					if (err) return console.error("Error during deleting game owned to database: ", err.message);
				});
				res.json({result: true})
			} else {
				db.run(`UPDATE wiigames SET owned = 1 WHERE id = ?;`, [gameID], (err) => {
					if (err) return console.error("Error during inserting game owned to database: ", err.message);
				});
				db.run(`DELETE FROM wish_list WHERE id = ?;`, [gameID], (err, row) => {
					if (err) {console.error('Erreur lors de l\'exécution de la requête :', err.message);}
				})
				res.json({result: false})
			}
		}
	});
});


app.get('/wishlist', (req, res) => {
	if(req.query.password !== process.env.MDP){return;}
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT id FROM wish_list WHERE id = ?;`, [gameID], (err, row) => {
		if (err) { console.error('Erreur lors de l\'exécution de la requête :', err.message);}
		else {
			if(row === undefined){
				db.run(`INSERT INTO wish_list (id) VALUES (?);`, [gameID], (err, row) => {
					if (err) {console.error('Erreur lors de l\'exécution de la requête :', err.message);}
				})
			} else {
				db.run(`DELETE FROM wish_list WHERE id = ?;`, [gameID], (err, row) => {
					if (err) {console.error('Erreur lors de l\'exécution de la requête :', err.message);}
				})
			}
			res.json({result: row === undefined})
		}
		
	});
});

app.get('/inwishlist', (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT id FROM wish_list WHERE id = ?;`, [gameID], (err, row) => {
		if (err) { console.error('Erreur lors de l\'exécution de la requête :', err.message);}
		else {
			res.json({result: row === undefined})
		}
	});
});