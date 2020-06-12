import React from 'react';
import PropTypes from 'prop-types';
import { graphql, Link } from 'gatsby';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, CartesianGrid, ReferenceLine, ComposedChart, Area } from 'recharts';
import moment from 'moment';
import defaultTheme from 'tailwindcss/defaultTheme';
import Layout from '../components/layout';
import { daysWatched } from '../utils/date';

const StatsPage = ({ data: { allMovies: { edges: allMovies } }, path }) => {
    const didNotFinish = allMovies.filter(movie => movie.node.didNotFinish);
    const completed = allMovies.filter(movie => movie.node.dateCompleted);
    const genres = moviesByGenre(completed);

    return (
        <Layout title="Stats" path={path}>
            <div className="flex flex-wrap justify-between mb-8">
                <Stat label="Watched" to="all" value={completed.length} />
                <Stat label="Average Rating" value={averageRating(completed)} />
                <Stat label="Average Days to Finish" value={averageDays(completed)} />
                <Stat label="Did Not Finish" value={didNotFinish.length} />
            </div>

            <ViewingsByMonth movies={completed} />

            <div className="my-8 h-px" />

            <ViewingsByGenre genres={genres} />

            <div className="my-8 h-px" />

            <AvgRatingByGenre genres={genres} />

            <div className="my-8 h-px" />

            <GenresOverTime movies={completed} genres={genres} />

            <div className="my-8 h-px" />

            <GenresOverTimeCumulative movies={completed} genres={genres} />

            <div className="my-8 h-px" />

            <DisappointmentDelight movies={completed} />

            <div className="my-8 h-px" />

            {didNotFinish.length > 0 &&
                <>
                    <h2>Did Not Finish</h2>
                    <p>I started these at some point, but probably won't bother to finish them...</p>
                    <ul className="mt-4 mb-8 list-disc pl-4">
                        {didNotFinish
                            .sort((a, b) => a.node.omdb.Title.localeCompare(b.node.omdb.Title))
                            .map(({ node: movie }, i) => (
                                <li key={movie.omdb.Title}>{movie.omdb.Title} ({movie.omdb.Year})</li>
                            ))
                        }
                    </ul>
                </>
            }
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
                    imdb
                }
            }
        }
    }
`

export const Stat = ({ label, value, to }) => {
    const labelEl = <span className="block text-sm">{label}</span>;

    return (
        <div className="w-1/2 sm:w-auto sm:max-w-1/4 flex flex-col text-center mt-4 sm:mt-0">
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
                        movies: [],
                    }
                }
                genres[name].movies.push(movie);
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
            const key = `${date.format('YYYY-MM')}`
            if (!months[key]) {
                months[key] = {
                    label: `${date.format('MMM YYYY')}`,
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

function moviesByGenreByMonth(movies, cumulative = false) {
    if (!movies) {
        return;
    }

    const moviesByDate = moviesByMonth(movies);
    const genresCount = {};

    const moviesByDateByMonth = moviesByDate.map(month => {
        const moviesForGenre = moviesByGenre(month.movies);
        moviesForGenre.forEach(genre => {
            if (!genresCount[genre.name]) {
                genresCount[genre.name] = 0;
            }
            genresCount[genre.name] += genre.movies.length;
            month[genre.name] = cumulative ? genresCount[genre.name] : genre.movies.length;
        });

        if (cumulative) {
            Object.keys(genresCount).filter(key => !Object.keys(month).includes(key)).forEach(genreName => {
                month[genreName] = genresCount[genreName];
            });
        }
        return month;
    });

    return moviesByDateByMonth;
}

const ViewingsByMonth = ({ movies }) => {
    const data = moviesByMonth(movies);

    return (
        <>
            <h2>Viewings By Month</h2>
            <ResponsiveContainer width="100%" height={250} className="mt-4">
                <BarChart
                    data={data}
                    maxBarSize={40}
                    margin={{ left: -30 }}
                >
                    <YAxis />
                    <XAxis type="category" dataKey="label" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="movies.length" name="Viewings" fill={defaultTheme.colors.indigo[500]} />
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
            <ResponsiveContainer width="100%" height={genres.length * 30} className="mt-4">
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
                    <Bar dataKey="movies.length" name="Viewings" fill={defaultTheme.colors.red[500]} />
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
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" height={70} />
                    <YAxis label={{ value: 'Viewings', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend verticalAlign="bottom" chartHeight={250} />
                    {genres.map((genre, index) => {
                        const colorWeight = 500 + (100 * Math.floor(index / colors.length));
                        const colorIndex = index % colors.length;
                        return (
                            <Bar key={genre.name} type="monotone" stackId="genre" dataKey={genre.name} fill={defaultTheme.colors[ colors[colorIndex] ][colorWeight]} />
                        )
                    })}
                </BarChart>
            </ResponsiveContainer>
        </>
    )
}

GenresOverTime.propTypes = {
    movies: PropTypes.array.isRequired,
    genres: PropTypes.array.isRequired
}

const GenresOverTimeCumulative = ({ movies, genres }) => {
    const data = moviesByGenreByMonth(movies, true);
    const excludedColors = ['black', 'indigo', 'white', 'transparent', 'current'];
    const colors = Object.keys(defaultTheme.colors).filter(
        color => excludedColors.indexOf(color) === -1
    );

    return (
        <>
            <h2>Genres over Time (Cumulative)</h2>
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

GenresOverTimeCumulative.propTypes = {
    movies: PropTypes.array.isRequired,
    genres: PropTypes.array.isRequired
}

const DisappointmentDelight = ({ movies }) => {
    const moviesByDate = moviesByMonth(movies);
    const labels = {
        1: '',
        2: 'Major',
        3: 'Distinguished',
        4: 'Unfathomable'
    }
    const movieDiffs = {};
    let overallDiff = 0;
    const metExpectationsWeight = (movies.filter(movie => movie.node.rating - movie.node.expectedRating === 0).length / movies.length) / 3;
    const data = moviesByDate.map(month => {
        const diffs = {};
        month.movies.forEach(movie => {
            const diff = movie.node.rating - movie.node.expectedRating;
            if (!diffs[diff]) {
                diffs[diff] = 0;
            }
            if (!movieDiffs[diff]) {
                movieDiffs[diff] = [];
            }
            diffs[diff] += diff >= 0 ? 1 : -1;
            overallDiff += diff === 0 ? metExpectationsWeight : diff;
            movieDiffs[diff].push(movie);
        });

        return {
            ...month,
            diffs: diffs,
            overallDiff: overallDiff
        }
    });

    return (
        <>
            <h2>Disappointments &amp; Delights</h2>
            <p>
                Comparing the expected rating vs the actual rating. Movies that met expectations add a
                ~<span className="text-green-500">{metExpectationsWeight.toFixed(2)}</span> to satisfaction
                per movie, derived from the overall percentage of movies that met expectations.
            </p>
            <p className="mt-2"><strong>General Satisfaction:</strong> <span className={overallDiff <= 0 ? 'text-red-600' : 'text-green-600'}>{overallDiff.toFixed(2)}</span></p>
            <ResponsiveContainer width="100%" height={500} className="mt-4">
                <ComposedChart
                    data={data}
                    stackOffset="sign"
                    margin={{
                        top: 5, right: 5, left: -30, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip
                        formatter={(value, name, props) => {
                            const val = props.dataKey === 'overallDiff' ? value.toFixed(2) : Math.abs(value);
                            return [val, name]
                        }}
                    />
                    <Legend wrapperStyle={{ paddingLeft: 30 }} />
                    <ReferenceLine y={0} stroke="#000" />
                    <Area name="Expectations Met" dataKey={`diffs[0]`} connectNulls={true} type="monotone" fillOpacity={0.3} />
                    {[4, 3, 2, 1, -1, -2, -3, -4].map(diff => {
                        const direction = diff > 0 ? 'Delights' : 'Disappointments';
                        const color = diff > 0 ? defaultTheme.colors.purple[700 - ((diff - 1) * 100)] : defaultTheme.colors.pink[700 + ((diff + 1) * 100)];
                        return <Bar maxBarSize={50} key={diff} name={`${labels[Math.abs(diff)]} ${direction}`} dataKey={`diffs[${diff}]`} fill={color} stackId="Satisfaction" />
                    })}
                    <Line dataKey="overallDiff" stroke={defaultTheme.colors.green[500]} name="Overall Satisfaction" />
                </ComposedChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap md:flex-no-wrap my-4 md:space-x-2">
                <div className="w-full md:w-1/2">
                    <h3>Delights</h3>
                    <ul>
                        {Object.keys(movieDiffs).filter(diff => diff > 0).sort((a, b) => a - b).map(diff => {
                            return movieDiffs[diff].sort((a, b) => b.node.expectedRating - a.node.expectedRating).map(movie => {
                                return (
                                    <li className="text-sm" key={movie.node.omdb.Title}><a href={movie.node.imdb}>{movie.node.omdb.Title}</a> ({movie.node.expectedRating} / {movie.node.rating})</li>
                                )
                            });
                        })}
                    </ul>
                </div>
                <div className="w-full md:w-1/2 mt-4 md:mt-0">
                    <h3>Disappontments</h3>
                    <ul>
                        {Object.keys(movieDiffs).filter(diff => diff < 0).sort((a, b) => a - b).map(diff => {
                            return movieDiffs[diff].sort((a, b) => b.node.expectedRating - a.node.expectedRating).map(movie => {
                                return (
                                    <li className="text-sm" key={movie.node.omdb.Title}><a href={movie.node.imdb}>{movie.node.omdb.Title}</a> ({movie.node.expectedRating} / {movie.node.rating})</li>
                                )
                            });
                        })}
                    </ul>
                </div>
            </div>
        </>
    )
}

DisappointmentDelight.propTypes = {
    movies: PropTypes.array.isRequired
}
