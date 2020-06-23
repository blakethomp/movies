const dotenv = require("dotenv");
const contentful = require('contentful-management');


if (process.env.ENVIRONMENT !== "production") {
  dotenv.config();
}

module.exports = async function (migration, context) {
    const movie = migration.editContentType('movie');

    movie.deleteField('rating');
    movie.deleteField('expectedRating');
    movie.deleteField('dateStarted');
    movie.deleteField('dateCompleted');
    movie.deleteField('notes');
    movie.deleteField('didNotFinish');
    movie.deleteField('validation_props');
    movie.deleteField('validation');
}
