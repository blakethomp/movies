import React from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import SEO from './seo';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const Layout = ({ title, children, path }) => {
    const { title: siteTitle } = useSiteMetadata();

    return (
        <>
            <SEO title={title} />
            <div className="mx-auto px-6 max-w-screen-lg">
                <h1 className="font-display uppercase">{ title ? title: siteTitle }</h1>
                {path !== '/' && <Link to="/" className="mb-6">Home</Link>}
                <div className="mt-8">
                    {children}
                </div>
            </div>
        </>
    )
}

Layout.propTypes = {
    title: PropTypes.string,
    children: PropTypes.element,
    path: PropTypes.string,
}

export default Layout;
