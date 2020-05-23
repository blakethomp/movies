import React from 'react';
import { daysWatched } from '../utils/date';

function Stat({label, value}) {
    return (
        <div className="max-w-1/4 flex flex-col text-center">
            <span className="text-sm">{label}</span>
            <span className="text-3xl">{value}</span>
        </div>
    )
}

export default ({ movies }) => {
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

            <div className="w-full mt-8 flex flex-row flex-wrap justify-around p-6 bg-blue-800 text-white rounded-lg">
                <h3 className="w-full text-2xl mb-4 text-center">Top Genres</h3>
                <div className="flex flex-col">
                    <span className="text-lg self-center">Last 90 Days</span>
                    <ol className="list-decimal pl-6 mt-2">
                        {completed && genreList(
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
                            return <li key={i}>{genre}</li>
                        })}
                    </ol>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg self-center">Last 365 Days</span>
                    <ol className="list-decimal pl-6 mt-2">
                        {completed && genreList(
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
                            return <li key={i}>{genre}</li>
                        })}
                    </ol>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg self-center">All-Time</span>
                    <ol className="list-decimal pl-6 mt-2">
                        {completed && genreList(completed).slice(0, 5).map((genre, i) => {
                            return <li key={i}>{genre}</li>
                        })}
                    </ol>
                </div>
            </div>
        </div>
    )
}

function averageRating(movies) {
    if (movies.length === 0) {
        return 'n/a';
    }

    const total = movies.reduce((total, next) => {
        return total + next.node.rating;
    }, 0);
    const average = total / movies.length;
    return average.toFixed(2);
}

function averageDays(movies) {
    if (movies.length === 0) {
        return 'n/a';
    }

    const total = movies.reduce((total, next) => {
        return total + daysWatched(next.node.dateStarted, next.node.dateCompleted);
    }, 0);
    const average = total / movies.length;
    return average.toFixed(1);
}

function genreList(movies) {
    if (!movies) {
        return 'n/a';
    }

    const genres = {};
    movies.forEach((movie, index) => {
        const { node: { genre } } = movie;
        if (genre) {
            genre.forEach(({ name }) => {
                if (!genres[name]) {
                    genres[name] = 1;
                } else {
                    genres[name]++;
                }
            });
        }
    });

    const sortedGenres = Object.keys(genres).sort((a, b) => {
        return genres[b] - genres[a];
    });

    return sortedGenres;
}
