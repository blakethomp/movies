const path = require(`path`)

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
