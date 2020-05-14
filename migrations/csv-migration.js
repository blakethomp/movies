const fs = require('fs');
const Parser = require('csv-parse');
const contentful = require('contentful-management');
const dotenv = require("dotenv");

if (process.env.ENVIRONMENT !== "production") {
  dotenv.config();
}

const client = contentful.createClient({
  accessToken: process.env.managementToken,
});

async function main () {
  const space = await client.getSpace(process.env.spaceId)
  const environment = await space.getEnvironment('master')
  const parser = new Parser({delimiter: ',', columns: true});
  const readStream = fs.createReadStream('./movies.csv').pipe(parser);

  for await (const chunk of readStream) {
    const entry = await rowToEntry(environment, chunk)
    console.log(entry);
    entry.publish();
  }
}

async function rowToEntry(env, row) {
  const date = new Date(row.Finished.replace('-', '/'))
  return await env.createEntry('movie', {
    fields: {
      title: {
        'en-US': row.Title
      },
      dateCompleted: {
        'en-US': date.toISOString()
      },
      expectedRating: {
        'en-US': parseInt(row.Expected)
      },
      rating: {
        'en-US': parseInt(row['Rating (of 5)'])
      }
    }
  })
}

main().catch(console.error)
