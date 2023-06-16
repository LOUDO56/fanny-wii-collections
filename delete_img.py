import os
import shutil
import xml.etree.ElementTree as ET
import sqlite3

# Chemin vers la base de données SQLite
database_file = "wiigames.db"

# Établir une connexion à la base de données
connection = sqlite3.connect(database_file)
cursor = connection.cursor()

# Exécuter une requête pour récupérer tous les ID de la table correspondante
cursor.execute("SELECT id FROM gamelist")
results = cursor.fetchall()

# Fermer la connexion à la base de données
connection.close()

# Extraire les ID de la liste de résultats
game_ids = [result[0] for result in results]




# Chemin vers le fichier XML
xml_file = "wiitdb.xml"

# Répertoire cible pour les images
covers_directory = "Covers-2"

# Vérifier si le répertoire de couvertures existe, sinon le créer
if not os.path.exists(covers_directory):
    os.makedirs(covers_directory)

# Charger le fichier XML
tree = ET.parse(xml_file)
root = tree.getroot()

# Parcourir les balises <game>
for game in root.iter('game'):
    game_id = game.find('id').text
    if game_id in game_ids:
        cover_filename = f"{game_id}.png"
        cover_source_path = os.path.join("Wii_Covers-2", cover_filename)
        cover_destination_path = os.path.join(covers_directory, cover_filename)

        # Vérifier si le fichier .png existe et le déplacer vers le répertoire "Covers"
        if os.path.exists(cover_source_path):
            shutil.move(cover_source_path, cover_destination_path)
            print(f"Image déplacée : {cover_filename}")
