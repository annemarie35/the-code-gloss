import type { Knex } from 'knex'

const config: { [key: string]: Knex.Config } = {
    development: {
        client: 'postgresql',
        connection: {
            database: 'postgres',
            user: 'username',
            password: 'password123'
        },
        pool: {
            min: 1,
            max: 4
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },
    production: {
        client: 'postgresql',
        connection: {
            database: 'postgres',
            user: 'username',
            password: 'password123'
        },
        pool: {
            min: 1,
            max: 4
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }
}

module.exports = config
