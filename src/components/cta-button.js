import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';

const Button = ({ to, text, className }) => {
    return (
        <div className={`text-center ${className}`}>
            <Link to={to} className="inline-block rounded-lg p-4 bg-green-700 hover:bg-green-800 text-white uppercase no-underline">{text}</Link>
        </div>
    )
}

Button.propTypes = {
    to: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    className: PropTypes.string
}

Button.defaultProps = {
    className: ''
}

export default Button;
