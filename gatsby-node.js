const fetch = require(`node-fetch`)
const parser = require(`csv-parse/lib/sync`);

exports.onCreatePage = ({ page, actions }) => {
  // Example for setting index context.
  const { createPage, deletePage } = actions;
  if (page.path === '/') {
    deletePage(page);
    // You can access the variable "house" in your page queries now
    createPage({
      ...page,
      context: {
        ...page.context,
        date: `${new Date().getUTCFullYear()}-01-01`
      },
    });
  }
}

exports.sourceNodes = async ({
  actions: { createNode },
  createContentDigest,
}) => {
  // get data from GitHub API at build time
  const result = await fetch(`https://www.imdb.com/list/ls057314059/export`)
  const resultData = await result.text()
  const watchlistItems = parser(resultData, {
    'columns': true
  });

  // create node for build time data example in the docs
  watchlistItems.filter(item => item['Title Type'] === 'movie').forEach(item => {
    createNode({
      // nameWithOwner and url are arbitrary fields from the data
      title: item.Title,
      url: item.URL,
      genre: item.Genres,
      year: item.Year,
      rating: item['IMDb Rating'],
      director: item.Directors,
      release: item['Release Date'],
      runtime: item['Runtime (mins)'],
      position: item.Position,
      added: new Date(item.Created),
      // required fields
      id: `watchlist-${item.Const}`,
      parent: null,
      children: [],
      internal: {
        type: `watchlist`,
        contentDigest: createContentDigest(item),
      },
    })
  })
}
