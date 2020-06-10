import React from 'react';
import PropTypes from 'prop-types';
import CTAButton from './cta-button';
import { Stat } from '../pages/stats';
import { averageDays, averageRating, moviesByGenre } from '../pages/stats';

const MoviesOverview = ({ movies, showLink }) => {
    const year = new Date().getUTCFullYear();
    const completed = movies.filter(movie => movie.node.dateCompleted);
    const currentYear = completed.filter((movie) => {
        const threshold = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const date = new Date(movie.node.dateCompleted);
        return date > threshold;
    });
    const inProgress = movies.filter(movie => !movie.node.dateCompleted && !movie.node.didNotFinish);
    const didNotFinish = movies.filter(movie => movie.node.didNotFinish);

    return (
        <div className="flex flex-wrap justify-between mb-8">
            <h2 className="w-full">Overview</h2>
            <h3 className="w-full text-center my-4">{year}</h3>
            <Stat label="Watched" value={currentYear.length} />
            <Stat label="Average Rating" value={averageRating(currentYear)} />
            <Stat label="Average Days to Finish" value={averageDays(currentYear)} />
            <Stat label="In Progress" value={inProgress.length} />

            <h3 className="w-full text-center mt-8 mb-4">All-Time</h3>
            <Stat label="Watched" value={completed.length} />
            <Stat label="Average Rating" value={averageRating(completed)} />
            <Stat label="Average Days to Finish" value={averageDays(completed)} />
            <Stat label="Did Not Finish" value={didNotFinish.length} />

            <div className="w-full mt-8 p-4 lg:p-6 bg-blue-800 text-white rounded-lg">
                <h3 className="ms-xl text-center">Top Genres</h3>
                <div className="flex flex-col xs:flex-row flex-wrap justify-around">
                    <div className="flex flex-col mt-4 items-center xs:items-start">
                        <span className="ms-lg self-center">Last 90 Days</span>
                        <ol className="list-decimal pl-6 mt-2">
                            {completed && moviesByGenre(
                                completed.filter(movie => {
                                    const days = 90;
                                    const dateCompleted = new Date(movie.node.dateCompleted);
                                    dateCompleted.setTime(dateCompleted.getTime() + (days * 24 * 60 * 60 * 1000));
                                    const today = new Date();
                                    return dateCompleted >= today;
                                })
                            )
                            .slice(0, 5)
                            .map((genre, i) => {
                                return <li key={genre.name}>{genre.name}</li>
                            })}
                        </ol>
                    </div>
                    <div className="flex flex-col mt-4 items-center xs:items-start">
                        <span className="ms-lg self-center">Last 365 Days</span>
                        <ol className="list-decimal pl-6 mt-2">
                            {completed && moviesByGenre(
                                completed.filter(movie => {
                                    const days = 365;
                                    const dateCompleted = new Date(movie.node.dateCompleted);
                                    dateCompleted.setTime(dateCompleted.getTime() + (days * 24 * 60 * 60 * 1000));
                                    const today = new Date();
                                    return dateCompleted >= today;
                                })
                            )
                            .slice(0, 5)
                            .map((genre, i) => {
                                return <li key={genre.name}>{genre.name}</li>
                            })}
                        </ol>
                    </div>
                    <div className="flex flex-col mt-4 items-center xs:items-start">
                        <span className="ms-lg self-center">All-Time</span>
                        <ol className="list-decimal pl-6 mt-2">
                            {completed && moviesByGenre(completed).slice(0, 5).map((genre, i) => {
                                return <li key={genre.name}>{genre.name}</li>
                            })}
                        </ol>
                    </div>
                </div>
            </div>

            {showLink && <CTAButton className="w-full mt-4" to="stats" text="All Stats" />}
        </div>
    )
}

MoviesOverview.propTypes = {
    movies: PropTypes.array.isRequired,
    showLink: PropTypes.bool
}

MoviesOverview.defaultProps = {
    showButton: false
}

export default MoviesOverview;
