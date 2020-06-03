import React from 'react';
import PropTypes from 'prop-types';
import SEO from './seo';

const Layout = ({ title, children }) => {
    return (
        <>
            <SEO title={title} />
            <div className="mx-auto px-6 max-w-screen-lg">
                <h1 className="mb-8 font-display uppercase">{ title }</h1>
                {children}
            </div>
        </>
    )
}

Layout.propTypes = {
    title: PropTypes.string,
    children: PropTypes.element
}

export default Layout;
