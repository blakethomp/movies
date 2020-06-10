import React from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import SEO from './seo';
import MoviesInProgress from '../components/movies-in-progress';
import Watchlist from '../components/movies-watchlist';
import { useSiteMetadata } from '../hooks/use-site-metadata';

import styles from './layout.module.css';

const Layout = ({ title, children, path, sidebar = <><MoviesInProgress /><Watchlist /></> }) => {
    const { title: siteTitle } = useSiteMetadata();

    return (
        <>
            <SEO title={title} />
            <div className="mx-auto px-6 max-w-screen-lg">
                <h1 className="font-display uppercase">{ title ? title: siteTitle }</h1>
                {path !== '/' && <Link to="/" className="mb-6">Home</Link>}
                <div className="mt-8">
                    <div className="flex flex-wrap sidebar:flex-no-wrap">
                        <div className={`w-full sidebar:pr-8 ${styles.main}`}>
                            {children}
                        </div>
                        <div className="w-full sidebar:w-40 mt-4 sidebar:mt-0 ml-auto sidebar:flex-none">
                            {sidebar}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

Layout.propTypes = {
    title: PropTypes.string,
    children: PropTypes.arrayOf(PropTypes.element),
    path: PropTypes.string,
    sidebar: PropTypes.element
}

export default Layout;
