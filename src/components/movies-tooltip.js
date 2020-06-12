import React, { useRef } from 'react'
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';

const MovieTooltip = ({ movies, id }) => {
    const tooltipRef = useRef(null);

    return (
        <ReactTooltip
            className="tooltip"
            event="click"
            globalEventOff="click"
            clickable={true}
            place="left"
            id={id}
            effect="solid"
            type="info"
            ref={tooltipRef}
            getContent={dataTip => {
                if (!dataTip) return;
                const movie = movies[dataTip].node;

                return (
                    <MovieTooltipContent movie={movie} tooltipRef={tooltipRef} />
                )
            }}
        />

    )
}

MovieTooltip.propTypes = {
    movies: PropTypes.array,
    id: PropTypes.string
}

export default MovieTooltip;

const MovieTooltipContent = ({ movie, tooltipRef }) => {
    return (
        <div className="flex flex-col md:block w-full py-1">
            <button className="inline-block absolute top-0 right-0 p-2 mr-2" title="Close" onClick={() => tooltipRef.current.setState({show: false})}>X</button>
            {movie.omdb.Ratings.length > 0 &&
                <div className="md:w-64 mt-4 md:mt-8 md:float-right md:ml-3 md:mb-1 order-1">
                    <div className="p-3 border border-solid rounded">
                        <h3 className="text-base mb-2">Is it good?</h3>
                        <ul>
                            {movie.omdb.Ratings.map(rating => {
                                let source;
                                switch (rating.Source.toLowerCase()) {
                                    case 'internet movie database':
                                        source = 'IMDb';
                                        break;
                                    case 'rotten tomatoes':
                                        source = 'RT';
                                        break;
                                    default:
                                        source = rating.Source
                                }
                                return (
                                    <li key={rating.Source}><strong>{source}:</strong> {rating.Value}</li>
                                )
                            })}
                            {movie.omdb.Awards && <li><strong>Awards:</strong> {movie.omdb.Awards}</li>}
                        </ul>
                    </div>
                </div>
            }
            <div className="order-0">
                <h2 className="text-lg">{movie.title} ({movie.omdb.Year})</h2>
                <p className="mb-2">
                    {movie.omdb.Rated}, {movie.omdb.Runtime}, {movie.omdb.Language}, {movie.omdb.Country}
                </p>
                <div className="leading-5">
                    <strong>Director(s):</strong> {movie.omdb.Director}<br/>
                    <strong>Writer(s):</strong> {movie.omdb.Writer}<br/>
                    <strong>Cast:</strong> {movie.omdb.Actors}<br/>
                    <strong>Genre(s):</strong> {movie.omdb.Genre}<br/>
                </div>
            </div>
            <div className="w-full text-right order-2 clear-right"><a className="text-white inline-block pt-4" href={movie.imdb}>View on IMDb</a></div>
        </div>
    )
}

MovieTooltip.propTypes = {
    movie: PropTypes.object,
    ref: PropTypes.object
}
