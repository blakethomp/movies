const dotenv = require("dotenv");
const contentful = require('contentful-management');


if (process.env.ENVIRONMENT !== "production") {
  dotenv.config();
}

module.exports = async function (migration, context) {
    const client = contentful.createClient({
        accessToken: context.accessToken,
    });
    const space = await client.getSpace(context.spaceId);
    const environment = await space.getEnvironment(context.environmentId);

    const movieEntries = await environment.getEntries({content_type: 'movie'});
    const moviesTransformed = {};
    const moviesToDelete = [];

    migration.transformEntries({
        contentType: 'movie',
        from: ['title', 'imdb'],
        to: ['viewings'],
        transformEntryForLocale: async (from, locale) => {
            if (moviesTransformed[locale] && moviesTransformed[locale].indexOf(from.imdb[locale]) !== -1) {
                return;
            }

            if (!moviesTransformed[locale]) {
                moviesTransformed[locale] = [];
            }

            const viewings = movieEntries.items.filter(movie => movie.fields.imdb[locale] === from.imdb[locale]);
            const viewingLinks = [];

            for await (const [index, viewing] of viewings.entries()) {
                const viewingEntry = await createViewing(viewing, locale);

                viewingLinks.push({
                    sys: {
                        type: 'Link',
                        linkType: viewingEntry.sys.type,
                        id: viewingEntry.sys.id,
                    }
                });

                moviesToDelete.push(viewing);
            }

            return {
                viewings: viewingLinks
            }
        }
    })

    for await (const movie of moviesToDelete) {
        await movie.delete();
    }

    async function createViewing(movie, locale) {
        const data = { fields: {} };
        const fields = ['title', 'dateStarted', 'dateCompleted', 'expectedRating', 'rating', 'notes', 'validation', 'validation_props', 'didNotFinish'];
        for (const field of fields) {
            if (movie.fields[field] && movie.fields[field][locale]) {
                data.fields[field] = {
                    [locale]: movie.fields[field][locale]
                };
            }
        }

        const viewing = await environment.createEntry('viewing', data);
        viewing.publish();

        return viewing;
    }
}
