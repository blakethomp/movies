import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const SEO = ({ title, description }) => {
    const { title: siteTitle } = useSiteMetadata();

    return (
        <Helmet>
            <title>{title ? `${title} | ${siteTitle}` : siteTitle}</title>
        </Helmet>
    )
}

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string
}

export default SEO;
