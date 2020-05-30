const fetch = require('node-fetch');
const dotenv = require("dotenv");

if (process.env.ENVIRONMENT !== "production") {
  dotenv.config();
}

module.exports = function (migration) {
    const apiKey = process.env.omdbKey;
    // Get movie data from OMDB API.
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

    // Use IMDb ID to get OMDB data and populate field.
    migration.transformEntries({
        contentType: 'movie',
        from: ['imdb'],
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
