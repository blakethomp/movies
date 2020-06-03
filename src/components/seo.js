import React from 'react';
import { Helmet } from 'react-helmet';
import { graphql, useStaticQuery } from 'gatsby';
import PropTypes from 'prop-types';

const SEO = ({ title, description }) => {
    const { site } = useStaticQuery(
        graphql`
            query {
                site {
                    siteMetadata {
                        title
                    }
                }
            }
        `
    )

    return (
        <Helmet>
            <title>{title ? `${title} | ${site.siteMetadata.title}` : site.siteMetadata.title}</title>
        </Helmet>
    )
}

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string
}

export default SEO;
