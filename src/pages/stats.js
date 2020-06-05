import React from 'react';
import PropTypes from 'prop-types';
import { graphql, Link } from 'gatsby';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, CartesianGrid } from 'recharts';
import moment from 'moment';
import defaultTheme from 'tailwindcss/defaultTheme';
import Layout from '../components/layout';
import MoviesInProgress from '../components/movies-in-progress';
import Watchlist from '../components/movies-watchlist';
import { daysWatched } from '../utils/date';

const StatsPage = ({ data: { allMovies: { edges: allMovies } }, path }) => {
    const didNotFinish = allMovies.filter(movie => movie.node.didNotFinish);
    const completed = allMovies.filter(movie => movie.node.dateCompleted);
    const genres = moviesByGenre(completed);

    return (
        <Layout title="Stats" path={path}>
            <div className="flex flex-wrap md:flex-no-wrap">
                <div className="w-full max-w-screen-md md:pr-8">
                    <div className="flex flex-wrap justify-between mb-8">
                        <Stat label="Watched" to="all" value={completed.length} />
                        <Stat label="Average Rating" value={averageRating(completed)} />
                        <Stat label="Average Days to Finish" value={averageDays(completed)} />
                        <Stat label="Did Not Finish" value={didNotFinish.length} />
                    </div>

                    <ViewingsByMonth movies={completed} />

                    <ViewingsByGenre genres={genres} />

                    <div className="my-8 h-px" />

                    <AvgRatingByGenre genres={genres} />

                    <div className="my-8 h-px" />

                    <GenresOverTime movies={completed} genres={genres} />

                    <div className="my-8 h-px" />

                    {didNotFinish.length > 0 &&
                        <>
                            <h2>Did Not Finish</h2>
                            <p>I started these at some point, but probably won't bother to finish them...</p>
                            <ul className="my-4 list-disc pl-4">
                                {didNotFinish
                                    .sort((a, b) => a.node.omdb.Title.localeCompare(b.node.omdb.Title))
                                    .map(({ node: movie }, i) => (
                                        <li key={movie.omdb.Title}>{movie.omdb.Title} ({movie.omdb.Year})</li>
                                    ))
                                }
                            </ul>
                        </>
                    }
                </div>
                <div className="w-full md:w-40 mt-4 md:mt-0 ml-auto md:flex-none">
                    <MoviesInProgress />
                    <Watchlist />
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

export const Stat = ({ label, value, to }) => {
    const labelEl = <span className="block text-sm">{label}</span>;

    return (
        <div className="max-w-1/4 flex flex-col text-center">
            {to ? <Link to={to}>{labelEl}</Link> : labelEl}
            <span className="text-3xl">{value}</span>
        </div>
    )
}

Stat.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]).isRequired,
    to: PropTypes.string
}

export function averageRating(movies) {
    if (movies.length === 0) {
        return 0;
    }

    const total = movies.reduce((total, next) => {
        return total + next.node.rating;
    }, 0);
    const average = total / movies.length;
    return parseFloat(average.toFixed(2));
}

export function averageDays(movies) {
    if (movies.length === 0) {
        return 'n/a';
    }

    const total = movies.reduce((total, next) => {
        return total + daysWatched(next.node.dateStarted, next.node.dateCompleted);
    }, 0);
    const average = total / movies.length;
    return parseFloat(average.toFixed(1));
}

export function moviesByGenre(movies, sort = 'count') {
    if (!movies) {
        return 'n/a';
    }

    const genres = {};

    movies.forEach(movie => {
        const { node: { genre } } = movie;
        if (genre) {
            genre.forEach(({ name }) => {
                if (!genres[name]) {
                    genres[name] = {
                        name: name,
                        movies: [movie],
                    }
                } else {
                    genres[name].movies.push(movie);
                }
            });
        }
    });

    const moviesByGenre = Object.keys(genres).map(key => {
        const genre = genres[key];
        genre.rating = averageRating(genre.movies);
        return genre;
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

export function moviesByMonth(movies) {
    if (!movies) {
        return;
    }

    const months = {};

    movies.forEach(movie => {
        const { node: { dateCompleted } } = movie;
        if (dateCompleted) {
            const date = moment.utc(new Date(dateCompleted));
            const key = `${date.format('YYYY')}-${date.format('MM')}`
            if (!months[key]) {
                months[key] = {
                    label: `${date.format('MMM')} ${date.format('YYYY')}`,
                    movies: [movie],
                    date: `${key}-01`,
                }
            } else {
                months[key].movies.push(movie);
            }
        }
    });

    const moviesByMonth = Object.keys(months).map(key => months[key])
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return moviesByMonth;
}

function moviesByGenreByMonth(movies) {
    if (!movies) {
        return;
    }

    const moviesByDate = moviesByMonth(movies);

    const moviesByDateByMonth = moviesByDate.map(month => {
        const moviesForGenre = moviesByGenre(month.movies);
        moviesForGenre.forEach(genre => {
            month[genre.name] = genre.movies.length;
        });
        return month;
    });

    return moviesByDateByMonth;
}

const ViewingsByMonth = ({ movies }) => {
    const data = moviesByMonth(movies);

    return (
        <>
            <h2>Viewings By Month</h2>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart
                    data={data}
                    maxBarSize={40}
                >
                    <YAxis />
                    <XAxis type="category" dataKey="label" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="movies.length" name="Viewings" fill={defaultTheme.colors.green[400]} />
                </BarChart>
            </ResponsiveContainer>
        </>
    )
}

ViewingsByMonth.propTypes = {
    movies: PropTypes.array.isRequired
}

const ViewingsByGenre = ({ genres }) => {
    return (
        <>
            <h2>Viewings By Genre</h2>
            <ResponsiveContainer width="100%" height={genres.length * 30}>
                <BarChart
                    data={genres}
                    layout="vertical"
                    margin={{ top: 5, right: 5, bottom: 5, left: 60 }}
                    barSize={15}
                >
                    <YAxis type="category" dataKey="name" interval={0}  />
                    <XAxis type="number" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="movies.length" name="Viewings" fill={defaultTheme.colors.green[700]} />
                </BarChart>
            </ResponsiveContainer>
        </>
    )
}

ViewingsByGenre.propTypes = {
    genres: PropTypes.array.isRequired
}

const AvgRatingByGenre = ({ genres }) => {
    return (
        <>
            <h2>Average Rating by Genre</h2>
            <ResponsiveContainer width="100%" height={genres.length * 30}>
                <RadarChart data={genres} startAngle={80} endAngle={-280}>
                    <PolarGrid stroke={defaultTheme.colors.blue[200]} />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis tick={{ fill: defaultTheme.colors.yellow[600] }} axisLine={false} orientation="left" type="number" angle={90} domain={[1, 5]} />
                    <Radar name="Rating" dataKey="rating" stroke={defaultTheme.colors.blue[700]} fill={defaultTheme.colors.blue[600]} fillOpacity={0.2} dot={true} />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>
        </>
    )
}

AvgRatingByGenre.propTypes = {
    genres: PropTypes.array.isRequired
}

const GenresOverTime = ({ movies, genres }) => {
    const data = moviesByGenreByMonth(movies);
    const excludedColors = ['black', 'indigo', 'white', 'transparent', 'current'];
    const colors = Object.keys(defaultTheme.colors).filter(
        color => excludedColors.indexOf(color) === -1
    );

    return (
        <>
            <h2>Genres over Time</h2>
            <ResponsiveContainer width="100%" height={500}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" height={70} />
                    <YAxis label={{ value: 'Viewings', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend verticalAlign="bottom" chartHeight={250} />
                    {genres.map((genre, index) => {
                        const colorWeight = 500 + (100 * Math.floor(index / colors.length));
                        const colorIndex = index % colors.length;
                        return (
                            <Line key={genre.name} type="monotone" dataKey={genre.name} stroke={defaultTheme.colors[ colors[colorIndex] ][colorWeight]} />
                        )
                    })}
                </LineChart>
            </ResponsiveContainer>
        </>
    )
}

GenresOverTime.propTypes = {
    movies: PropTypes.array.isRequired,
    genres: PropTypes.array.isRequired
}
