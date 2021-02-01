import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { graphql, Link } from 'gatsby';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, CartesianGrid, ReferenceLine, ComposedChart, Area } from 'recharts';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import defaultTheme from 'tailwindcss/defaultTheme';
import Layout from '../components/layout';
import { displayDate, daysWatched } from '../utils/date';

const StatsPage = ({ data: { allViewings: { edges: allViewings } }, path }) => {
    const didNotFinish = allViewings.filter(viewing => viewing.node.didNotFinish);
    const completed = allViewings.filter(viewing => viewing.node.dateCompleted);
    const genres = viewingsByGenre(completed);

    return (
        <Layout title="Stats" path={path}>
            <div className="flex flex-wrap justify-between mb-8">
                <Stat label="Watched" to="all" value={completed.length} />
                <Stat label="Average Rating" value={averageRating(completed)} />
                <Stat label="Average Days to Finish" value={averageDays(completed)} />
                <Stat label="Did Not Finish" value={didNotFinish.length} />
            </div>

            <ViewingsByMonth viewings={completed} />

            <div className="my-8 h-px" />

            <ViewingsByGenre genres={genres} />

            <div className="my-8 h-px" />

            <AvgRatingByGenre genres={genres} />

            <div className="my-8 h-px" />

            <GenresOverTime viewings={completed} genres={genres} />

            <div className="my-8 h-px" />

            <GenresOverTimeCumulative viewings={completed} genres={genres} />

            <div className="my-8 h-px" />

            <DisappointmentDelight viewings={completed} />

            <div className="my-8 h-px" />

            <FrequentCastCrew viewings={completed} />

            <div className="my-8 h-px" />

            {didNotFinish.length > 0 &&
                <>
                    <h2>Did Not Finish</h2>
                    <p>I started these at some point, but probably won't bother to finish them...</p>
                    <ul className="mt-4 mb-8 list-disc pl-4">
                        {didNotFinish
                            .sort((a, b) => a.node.movie[0].title.localeCompare(b.node.movie[0].title))
                            .map(({ node: { movie: [ movie ] } }) => (
                                <li key={movie.title}>{movie.title} ({movie.omdb.Year})</li>
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
    query allStatsViewingsQuery {
        allViewings: allContentfulViewing(sort: { fields: dateCompleted, order: DESC }) {
            edges {
                node {
                    id
                    dateStarted
                    dateCompleted
                    rating
                    expectedRating
                    didNotFinish
                    ...MovieDetails
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

export function averageRating(viewings) {
    if (viewings.length === 0) {
        return 0;
    }

    const total = viewings.reduce((total, next) => {
        return total + next.node.rating;
    }, 0);
    const average = total / viewings.length;
    return parseFloat(average.toFixed(2));
}

export function averageDays(viewings) {
    if (viewings.length === 0) {
        return 'n/a';
    }

    const total = viewings.reduce((total, next) => {
        return total + daysWatched(next.node.dateStarted, next.node.dateCompleted);
    }, 0);
    const average = total / viewings.length;
    return parseFloat(average.toFixed(1));
}

export function viewingsByGenre(viewings, sort = 'count') {
    if (!viewings) {
        return 'n/a';
    }

    const genres = {};

    viewings.forEach(viewing => {
        const { node: { movie: [{ genre }] } } = viewing;
        if (genre) {
            genre.forEach(({ name }) => {
                if (!genres[name]) {
                    genres[name] = {
                        name: name,
                        viewings: [],
                    }
                }
                genres[name].viewings.push(viewing);
            });
        }
    });

    const viewingsByGenre = Object.keys(genres).map(key => {
        const genre = genres[key];
        genre.rating = averageRating(genre.viewings);
        return genre;
    });

    switch (sort) {
        case 'count':
            viewingsByGenre.sort((a, b) => b.viewings.length - a.viewings.length || a.name.localeCompare(b.name));
            break;
        default: 
            viewingsByGenre.sort((a, b) => a.name.localeCompare(b.name));
    }

    return viewingsByGenre;
}

export function viewingsByMonth(viewings) {
    if (!viewings) {
        return;
    }

    const months = {};

    viewings.forEach(viewing => {
        const { node: { dateCompleted } } = viewing;
        if (dateCompleted) {
            const date = moment.utc(new Date(dateCompleted));
            const key = `${date.format('YYYY-MM')}`
            if (!months[key]) {
                months[key] = {
                    label: `${date.format('MMM YYYY')}`,
                    viewings: [viewing],
                    date: `${key}-01`,
                }
            } else {
                months[key].viewings.push(viewing);
            }
        }
    });

    const viewingsByMonth = Object.keys(months).map(key => months[key])
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return viewingsByMonth;
}

function viewingsByGenreByMonth(viewings, cumulative = false) {
    if (!viewings) {
        return;
    }

    const viewingsByDate = viewingsByMonth(viewings);
    const genresCount = {};

    const viewingsByDateByMonth = viewingsByDate.map(month => {
        const viewingsForGenre = viewingsByGenre(month.viewings);
        viewingsForGenre.forEach(genre => {
            if (!genresCount[genre.name]) {
                genresCount[genre.name] = 0;
            }
            genresCount[genre.name] += genre.viewings.length;
            month[genre.name] = cumulative ? genresCount[genre.name] : genre.viewings.length;
        });

        if (cumulative) {
            Object.keys(genresCount).filter(key => !Object.keys(month).includes(key)).forEach(genreName => {
                month[genreName] = genresCount[genreName];
            });
        }
        return month;
    });

    return viewingsByDateByMonth;
}

const ViewingsByMonth = ({ viewings }) => {
    const data = viewingsByMonth(viewings);
    const [monthlyViewings, setMonthlyViewings] = useState();

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
                    <Bar
                        dataKey="viewings.length"
                        name="Viewings"
                        onClick={(data, index) => {
                            setMonthlyViewings(data);
                        }}
                        fill={defaultTheme.colors.indigo[500]}
                    />
                </BarChart>
            </ResponsiveContainer>
            <div className="movie-popout">
                {monthlyViewings && (
                    <>
                        <button className="btn btn-red py-1 float-right" onClick={() => setMonthlyViewings()}>close</button>
                        <h3>{monthlyViewings.label}</h3>
                        <ul className="mt-4">
                            {monthlyViewings.viewings.sort((a, b) => a.node.movie[0].title.localeCompare(b.node.movie[0].title)).map(({ node: { id, dateCompleted, movie: [ movie ] } }) => {
                                return (
                                    <li key={id}>{movie.title}</li>
                                )
                            })}
                        </ul>
                    </>
                )}
            </div>

        </>
    )
}

ViewingsByMonth.propTypes = {
    viewings: PropTypes.array.isRequired
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
                    <Bar dataKey="viewings.length" name="Viewings" fill={defaultTheme.colors.red[500]} />
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

const GenresOverTime = ({ viewings, genres }) => {
    const data = viewingsByGenreByMonth(viewings);
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
    viewings: PropTypes.array.isRequired,
    genres: PropTypes.array.isRequired
}

const GenresOverTimeCumulative = ({ viewings, genres }) => {
    const data = viewingsByGenreByMonth(viewings, true);
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
    viewings: PropTypes.array.isRequired,
    genres: PropTypes.array.isRequired
}

const DisappointmentDelight = ({ viewings }) => {
    const viewingsByDate = viewingsByMonth(viewings);
    const labels = {
        1: '',
        2: 'Major',
        3: 'Distinguished',
        4: 'Unfathomable'
    }
    const movieDiffs = {};
    let overallDiff = 0;
    const metExpectationsWeight = (viewings.filter(viewing => viewing.node.rating - viewing.node.expectedRating === 0).length / viewings.length) / 3;
    const data = viewingsByDate.map(month => {
        const diffs = {};
        month.viewings.forEach(viewing => {
            const diff = viewing.node.rating - viewing.node.expectedRating;
            if (!diffs[diff]) {
                diffs[diff] = 0;
            }
            if (!movieDiffs[diff]) {
                movieDiffs[diff] = [];
            }
            diffs[diff] += diff >= 0 ? 1 : -1;
            overallDiff += diff === 0 ? metExpectationsWeight : diff;
            movieDiffs[diff].push(viewing);
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
                            return movieDiffs[diff].sort((a, b) => b.node.expectedRating - a.node.expectedRating || a.node.movie[0].title.localeCompare(b.node.movie[0].title)).map(({ node: viewing, node: { movie: [ movie ] } }) => {
                                return (
                                    <li className="text-sm" key={`delight-${movie.title}`}><a href={movie.imdb}>{movie.title}</a> ({viewing.expectedRating} / {viewing.rating})</li>
                                )
                            });
                        })}
                    </ul>
                </div>
                <div className="w-full md:w-1/2 mt-4 md:mt-0">
                    <h3>Disappontments</h3>
                    <ul>
                        {Object.keys(movieDiffs).filter(diff => diff < 0).sort((a, b) => a - b).map(diff => {
                            return movieDiffs[diff].sort((a, b) => b.node.expectedRating - a.node.expectedRating).map(({ node: viewing, node: { movie: [ movie ] } }) => {
                                return (
                                    <li className="text-sm" key={`disappointment-${movie.title}`}><a href={movie.imdb}>{movie.title}</a> ({viewing.expectedRating} / {viewing.rating})</li>
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
    viewings: PropTypes.array.isRequired
}

const FrequentCastCrew = ({ viewings }) => {
    const castCount = {};
    const directorCount = {};
    const writerCount = {};
    viewings.forEach(({ node: { movie: [ movie ] } }) => {
        const cast = movie.omdb.Actors.split(', ');
        cast.forEach(name => {
            if (!castCount[name]) {
                castCount[name] = {
                    name: name,
                    count: 0,
                    movies: {}
                };
            }
            castCount[name].count++;
            if (castCount[name].movies[movie.title]) {
                castCount[name].movies[movie.title].count++;
            } else {
                castCount[name].movies[movie.title] = {count: 1}
            }
        });

        // Directors can have designations (i.e. "co-director") in parentheses, remove them.
        const director = [...movie.omdb.Director.split(', ').map(name => name.replace(/\s?\(.*?\)$/, ''))];
        director.forEach(name => {
            if (!directorCount[name]) {
                directorCount[name] = {
                    name: name,
                    count: 0,
                    movies: {}
                };
            }
            directorCount[name].count++;
            if (directorCount[name].movies[movie.title]) {
                directorCount[name].movies[movie.title].count++;
            } else {
                directorCount[name].movies[movie.title] = {count: 1}
            }
        });

        // Writers can be on the same movie multiple times for screenplay, story, etc. use Set() to filter out duplicates.
        const writer = [...new Set(movie.omdb.Writer.split(', ').map(name => name.replace(/\s\(.*?\)$/, '')))];
        writer.forEach(name => {
            if (!writerCount[name]) {
                writerCount[name] = {
                    name: name,
                    count: 0,
                    movies: {}
                };
            }
            writerCount[name].count++;
            if (writerCount[name].movies[movie.title]) {
                writerCount[name].movies[movie.title].count++;
            } else {
                writerCount[name].movies[movie.title] = {count: 1}
            }
        });
    });

    const orderedCast = Object.keys(castCount).sort((a, b) => castCount[b].count - castCount[a].count || a.localeCompare(b)).map(name => ({...castCount[name]}));
    const castThreshold = orderedCast.slice(0, Math.ceil(orderedCast.length / 3 / 2)).reverse()[0].count;
    const orderedDirectors = Object.keys(directorCount).sort((a, b) => directorCount[b].count - directorCount[a].count || a.localeCompare(b)).map(name => ({...directorCount[name]}));
    const directorThreshold = orderedDirectors.slice(0, Math.ceil(orderedDirectors.length / 3 / 2)).reverse()[0].count;
    const orderedWriters = Object.keys(writerCount).sort((a, b) => writerCount[b].count - writerCount[a].count || a.localeCompare(b)).map(name => ({...writerCount[name]}));
    const writerThreshold = orderedWriters.slice(0, Math.ceil(orderedWriters.length / 3 / 2)).reverse()[0].count;
    
    function PeopleList({heading, list, displayThreshold}) {
        return (
            <>
                <h3>{heading}</h3>
                <ul>
                    {[...list].filter(person => person.count >= (displayThreshold === 1 ? 2 : displayThreshold)).map(person => {
                        const {name, count, movies} = person;
                        const tipContent = Object.keys(movies).sort((a, b) => movies[b].count - movies[a].count || a.localeCompare(b)).map(movie => {
                            const {[movie]: {count: titleCount}} = movies;
                            return `${movie}${titleCount > 1 ? ` (${titleCount})` : ''}`;
                        }).join(', ');
                        return <li key={`${heading}-${name}-list`} data-tip={tipContent} data-for={`${heading}ToolTip`}>{name} ({count})</li>
                    })}
                </ul>
                <ReactTooltip
                    className="tooltip"
                    place="top"
                    id={`${heading}ToolTip`}
                    effect="solid"
                    type="info"
                />
            </>
        )
    }

    return (
        <>
            <h2>Frequent People</h2>
            <div className="flex flex-col xs:flex-row flex-wrap justify-between">
                <div className="flex flex-col mt-4 items-center xs:items-start">
                    <PeopleList heading="Cast" list={orderedCast} displayThreshold={castThreshold} />
                </div>
                <div className="flex flex-col mt-4 items-center xs:items-start">
                    <PeopleList heading="Directors" list={orderedDirectors} displayThreshold={directorThreshold} />
                </div>
                <div className="flex flex-col mt-4 items-center xs:items-start">
                    <PeopleList heading="Writers" list={orderedWriters} displayThreshold={writerThreshold} />
                </div>
            </div>
        </>
    )
}
