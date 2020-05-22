import React from 'react';
import { daysWatched } from '../utils/date';

export default ({all, current}) => {
    const year = new Date().getUTCFullYear();

    return (
        <div className="flex flex-wrap justify-between mb-8">
            <div className="max-w-1/3 flex flex-col text-center">
                <span className="text-sm">Watched in {year}</span>
                <span className="text-3xl">{current.length}</span>
            </div>
            <div className="max-w-1/3 flex flex-col text-center">
                <span className="text-sm">Average Rating</span>
                <span className="text-3xl">{averageRating(current)}</span>
            </div>
            <div className="max-w-1/3 flex flex-col text-center">
                <span className="text-sm">Average Days to Finish</span>
                <span className="text-3xl">{averageDays(current)}</span>
            </div>
            <div className="w-full mt-8 flex flex-row flex-wrap justify-around p-6 bg-blue-800 text-white rounded-lg">
                <h2 className="w-full text-2xl mb-4 text-center">Top Genres</h2>
                <div className="flex flex-col">
                    <span className="text-lg self-center">Last 90 Days</span>
                    <ol className="list-decimal pl-6 mt-2">
                        {genreList(
                            all.filter((element => {
                                const days = 90;
                                const dateCompleted = new Date(element.node.dateCompleted);
                                dateCompleted.setTime(dateCompleted.getTime() + (days * 24 * 60 * 60 * 1000));
                                const today = new Date();
                                return dateCompleted >= today;
                            }))
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
                        {genreList(
                            all.filter((element => {
                                const days = 365;
                                const dateCompleted = new Date(element.node.dateCompleted);
                                dateCompleted.setTime(dateCompleted.getTime() + (days * 24 * 60 * 60 * 1000));
                                const today = new Date();
                                return dateCompleted >= today;
                            }))
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
                        {genreList(all).slice(0, 5).map((genre, i) => {
                        return <li key={i}>{genre}</li>
                        })}
                    </ol>
                </div>
            </div>
        </div>
    )
}

function averageRating(movies) {
    const total = movies.reduce((total, next) => {
        return total + next.node.rating;
    }, 0);
    const average = total / movies.length;
    return average.toFixed(2);
}

function averageDays(movies) {
    const total = movies.reduce((total, next) => {
        return total + daysWatched(next.node.dateStarted, next.node.dateCompleted);
    }, 0);
    const average = total / movies.length;
    return average.toFixed(1);
}

function genreList(movies) {
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
