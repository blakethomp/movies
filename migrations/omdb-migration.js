const fetch = require('node-fetch');
const dotenv = require("dotenv");

if (process.env.ENVIRONMENT !== "production") {
  dotenv.config();
}

module.exports = function (migration) {
    const apiKey = process.env.omdbKey;
    // Simplistic function deducing a category from a tag name.
    async function getMovie(imdbId) {
        if (apiKey && imdbId) {
            try {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}`);
            const data = await response.json();
                return data;
            } catch (error) {
                return error;
            }
        }
    }

    // Derives categories based on tags and links these back to blog post entries.
    migration.transformEntries({
        // Start from blog post's tags field
        contentType: 'movie',
        from: ['imdb'],
        // We'll only create a category using a name for now.
        to: ['omdb'],
        transformEntryForLocale: async (from, locale) => {
            const matches = from.imdb[locale].match(/imdb\.com\/title\/(tt[^/]*)/);
            if (matches) {
                const data = await getMovie(matches[1]);
                if (typeof data === 'object' && data.Response.toLowerCase() === 'true') {
                    return {
                        omdb: data
                    }
                }
            }
        }
    })
}
