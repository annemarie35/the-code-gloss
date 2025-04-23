import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

import pg from 'pg'
const { Pool } = pg

config()

// Configuration de la connexion à la base de données
const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    application_name: 'code-gloss',
    max: 6,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 0,
    allowExitOnIdle: false
})

// Définition de la table cible et de la requête d'insertion
const TARGET_TABLE = 'gloses' // Nom de la table à mettre à jour
const INSERT_QUERY = `INSERT INTO gloses (description, tags, title) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`

async function updateDatabase() {
    try {
        // Chemin vers le fichier JSON contenant les données
        const dataFilePath = path.resolve(process.cwd(), 'infra/database/seeds.json')

        console.log(`Recherche du fichier de données à : ${dataFilePath}`)

        // Vérification que le fichier existe
        if (!fs.existsSync(dataFilePath)) {
            throw new Error(`Le fichier de données n'existe pas à l'emplacement : ${dataFilePath}`)
        }

        // Lecture du fichier JSON
        const dataEntries = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'))

        // Vérification que dataEntries est un tableau
        if (!Array.isArray(dataEntries)) {
            throw new Error("Le fichier JSON doit contenir un tableau d'entrées")
        }

        console.log(`Début de la mise à jour de la base de données avec ${dataEntries.length} entrées...`)

        // Vérification que la table existe, sinon la créer
        //await ensureTableExists()

        // Connexion à la base de données
        const client = await pool.connect()

        try {
            // Début de la transaction
            await client.query('BEGIN')

            // Insertion de chaque entrée du tableau
            for (let i = 0; i < dataEntries.length; i++) {
                const entry = dataEntries[i]

                if (!entry.title || !entry.description || !entry.tags) {
                    console.warn(`Entrée #${i + 1} ignorée : format incorrect (title et description requis)`)
                    continue
                }

                console.log(`Traitement de l'entrée "${entry.title}"...`)

                try {
                    // Insertion des données dans la table
                    await client.query(INSERT_QUERY, [entry.description, entry.tags, entry.title])
                    console.log(`✅ Entrée "${entry.title}" traitée avec succès`)
                } catch (queryError) {
                    console.error(`❌ Erreur lors du traitement de l'entrée "${entry.title}": ${queryError.message}`)
                    throw queryError // Propager l'erreur pour annuler la transaction
                }
            }

            // Validation de la transaction
            await client.query('COMMIT')
            console.log('✅ Toutes les entrées ont été traitées avec succès')
        } catch (error) {
            console.log('error', error)
            // Annulation de la transaction en cas d'erreur
            await client.query('ROLLBACK')
            console.error("❌ Transaction annulée en raison d'une erreur")
            throw error
        } finally {
            // Libération du client
            client.release()
        }
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la base de données: ${error.message}`)
        process.exit(1)
    } finally {
        // Fermeture du pool de connexion
        await pool.end()
    }
}

// Fonction pour s'assurer que la table cible existe
async function ensureTableExists() {
    const client = await pool.connect()
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS ${TARGET_TABLE} (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
        console.log(`✅ Table '${TARGET_TABLE}' vérifiée/créée avec succès`)
    } catch (error) {
        console.error(`❌ Erreur lors de la vérification/création de la table: ${error.message}`)
        throw error
    } finally {
        client.release()
    }
}

// Exécution de la fonction principale
updateDatabase()
