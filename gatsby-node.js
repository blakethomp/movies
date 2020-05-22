const path = require(`path`)

exports.createPages = function({ graphql, actions }) {
  const { createPage } = actions

  createPage({
    path: `/`,
    component: path.resolve(`./src/pages/index.js`),
    context: {
      // Data passed to context is available
      // in page queries as GraphQL variables.
      year: new Date().getUTCFullYear(),
    },
  })
}
