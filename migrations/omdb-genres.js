const contentful = require('contentful-management');

module.exports = async function (migration, context) {
    const client = contentful.createClient({
        accessToken: context.accessToken,
    });
    const space = await client.getSpace(context.spaceId);
    const environment = await space.getEnvironment(context.environmentId);
    const genreEntries = await environment.getEntries({content_type: 'genre'});

    migration.transformEntries({
        contentType: 'movie',
        from: ['omdb'],
        to: ['genre'],
        transformEntryForLocale: async (from, locale) => {
            if (!from.omdb[locale].Genre) {
                return;
            }
            const newGenres = [];
            const omdbGenres = from.omdb[locale].Genre.split(', ');
            for await (const genre of omdbGenres) {
                let genreEntry = genreEntries.items.find(element => element.fields.name[locale] === genre);
                if (!genreEntry) {
                    genreEntry = await createGenre(genre, locale);
                }

                newGenres.push({
                    sys: {
                        type: 'Link',
                        linkType: genreEntry.sys.type,
                        id: genreEntry.sys.id,
                    }
                })
            }

            return {
                genre: newGenres,
                validation: true
            }
        }
    })

    async function createGenre(name, locale) {
        const data = {
            fields: {
                name: {
                    [locale]: name
                }
            }
        };

        const genre = await environment.createEntry('genre', data);
        genre.publish();
        genreEntries.items.push(genre);

        return genre;
    }
}
