import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, Tooltip } from 'recharts';
import Layout from '../components/layout';
import MoviesInProgress from '../components/movies-in-progress';
import { daysWatched } from '../utils/date';
import defaultTheme from 'tailwindcss/defaultTheme';

const StatsPage = ({data: { allMovies: { edges: allMovies }, pageContext}}) => {
    const didNotFinish = allMovies.filter(movie => movie.node.didNotFinish);
    const completed = allMovies.filter(movie => movie.node.dateCompleted);
    const genres = moviesByGenre(completed);

    return (
        <Layout title="Stats">
            <div className="flex flex-wrap md:flex-no-wrap">
                <div className="w-full max-w-screen-md md:pr-8">
                    <div className="flex flex-wrap justify-between mb-8">
                        <Stat label="Watched" value={completed.length} />
                        <Stat label="Average Rating" value={averageRating(completed)} />
                        <Stat label="Average Days to Finish" value={averageDays(completed)} />
                        <Stat label="Did Not Finish" value={didNotFinish.length} />
                    </div>
                    <h2>Movies By Genre</h2>
                    <ResponsiveContainer width="100%" height={genres.length * 50}>
                        <BarChart
                            data={genres}
                            layout="vertical"
                            margin={{ top: 5, right: 5, bottom: 5, left: 60 }}
                        >
                            <YAxis type="category" dataKey="name"  />
                            <XAxis type="number" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="movies.length" name="viewings" fill={defaultTheme.colors.green[700]} />
                        </BarChart>
                    </ResponsiveContainer>
                    {didNotFinish.length > 0 &&
                        <>
                            <h2>Did Not Finish</h2>
                            <p>I started these at some point, but probably won't bother to finish them...</p>
                            <ul className="my-4 list-disc pl-4">
                                {didNotFinish
                                    .sort((a, b) => a.node.omdb.Title.localeCompare(b.node.omdb.Title))
                                    .map(({ node: movie }, i) => (
                                        <li key={i}>{movie.omdb.Title} ({movie.omdb.Year})</li>
                                    ))
                                }
                            </ul>
                        </>
                    }
                </div>
                <div className="w-full md:w-40 mt-4 md:mt-0 ml-auto md:flex-none">
                    <MoviesInProgress />
                </div>
            </div>
        </Layout>
    )
}

export default StatsPage;

export const pageQuery = graphql`
    query allStatsMoviesQuery {
        allMovies: allContentfulMovie(sort: { fields: dateCompleted, order: DESC }) {
            edges {
                node {
                    dateStarted
                    dateCompleted
                    rating
                    expectedRating
                    genre {
                        name
                    }
                    didNotFinish
                    omdb {
                        Title
                        Year
                    }
                }
            }
        }
    }
`

export const Stat = ({ label, value }) => {
    return (
        <div className="max-w-1/4 flex flex-col text-center">
            <span className="text-sm">{label}</span>
            <span className="text-3xl">{value}</span>
        </div>
    )
}

Stat.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]).isRequired
}

export function averageRating(movies) {
    if (movies.length === 0) {
        return 'n/a';
    }

    const total = movies.reduce((total, next) => {
        return total + next.node.rating;
    }, 0);
    const average = total / movies.length;
    return average.toFixed(2);
}

export function averageDays(movies) {
    if (movies.length === 0) {
        return 'n/a';
    }

    const total = movies.reduce((total, next) => {
        return total + daysWatched(next.node.dateStarted, next.node.dateCompleted);
    }, 0);
    const average = total / movies.length;
    return average.toFixed(1);
}

export function moviesByGenre(movies, sort = 'count') {
    if (!movies) {
        return 'n/a';
    }

    const genres = {};
    const moviesByGenre = [];

    movies.forEach(movie => {
        const { node: { genre } } = movie;
        if (genre) {
            genre.forEach(({ name }) => {
                if (!genres[name]) {
                    genres[name] = {
                        name: name,
                        movies: [movie],
                    }
                    moviesByGenre.push(genres[name]);
                } else {
                    genres[name].movies.push(movie);
                }
            });
        }
    });

    switch (sort) {
        case 'alpha':
            moviesByGenre.sort((a, b) => a.name.localeCompare(b.name));
            break;

        default:
            moviesByGenre.sort((a, b) => b.movies.length - a.movies.length);
            break;
    }

    return moviesByGenre;
}
