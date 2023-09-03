
// --------- Partie setup --------- //


const express = require('express');
const fs = require('fs');
const xml2js = require('xml2js');
const sqlite3 = require('sqlite3').verbose()
const cors = require('cors');
const { send } = require('process');
const app = express();
const port = 4001;

let db = new sqlite3.Database('wiigames.db')

app.listen(port, () => {
	console.log("Server started at port", port)
});

app.use(cors());



// --------- Partie intéraction --------- //


app.get('/', (req, res) => {

	res.status(404).send("Nothing to see here.")

});


app.get("/img", (req, res) => {
	const gameID = req.query.gameID;
	if(fs.existsSync("Frontend/Images/Covers/Wii_Covers-1/" + gameID + ".png")){
		res.status(200).json({img_path: "Frontend/Images/Covers/Wii_Covers-1/" + gameID + ".png"})
	} else if(fs.existsSync("Frontend/Images/Covers/Wii_Covers-2/" + gameID + ".png")){
		res.status(200).json({img_path: "Frontend/Images/Covers/Wii_Covers-2/" + gameID + ".png"})
	} else {
		res.status(200).json({img_path: "Frontend/Images/Covers/cover_not_found.png"})
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
		res.status(200).json(data)
	});
})



//Fonction qui permet de savoir combien de jeu nous avons
app.get('/howmanygameowned', (req, res) => {
	db.get(`SELECT COUNT(*) FROM wiigames WHERE owned = true`, (err, row) => {
		if (err) return console.error("Erreur lors de la récupération de nombre de jeux possedés", err.message);
		res.status(200).json({count: row['COUNT(*)']});
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
				res.status(200).json({result: true})
			} else {
				res.status(200).json({result: false})
			}
	}
	});
});



// Fonction qui permet d'ajouter un jeu ou le supprimer
app.get('/ajoutsuppr', (req, res) => {
	// if(req.query.password !== process.env.MDP){return;} Only needed on server side
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT owned FROM wiigames WHERE id = ?;`, [gameID], (err, row) => {
		if (err) {
			console.error('Erreur lors de l\'exécution de la requête :', err.message);
		} else {
			if (row !== undefined && row.owned === 1) {
				db.run(`UPDATE wiigames SET owned = 0 WHERE id = ?;`, [gameID], (err) => {
					if (err) return console.error("Error during deleting game owned to database: ", err.message);
				});
				res.status(200).json({result: true})
			} else {
				db.run(`UPDATE wiigames SET owned = 1 WHERE id = ?;`, [gameID], (err) => {
					if (err) return console.error("Error during inserting game owned to database: ", err.message);
				});
				db.run(`DELETE FROM wish_list WHERE id = ?;`, [gameID], (err, row) => {
					if (err) {console.error('Erreur lors de l\'exécution de la requête :', err.message);}
				})
				res.status(200).json({result: false})
			}
		}
	});
});


app.get('/wishlist', (req, res) => {
	// if(req.query.password !== process.env.MDP){return;} Only needed on server side
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
			res.status(200).json({result: row === undefined})
		}
		
	});
});

app.get('/inwishlist', (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT id FROM wish_list WHERE id = ?;`, [gameID], (err, row) => {
		if (err) { console.error('Erreur lors de l\'exécution de la requête :', err.message);}
		else {
			res.status(200).json({result: row === undefined})
		}
	});
});
