import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    knex.schema.hasTable('gloses').then(function (exists) {
        if (!exists) {
            return knex.schema.createTable('gloses', function (t) {
                t.increments('id').primary()
                t.string('title', 100)
                t.text('description')
                t.datetime('created_at')
                t.text('tags')
            })
        }
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('gloses')
}
