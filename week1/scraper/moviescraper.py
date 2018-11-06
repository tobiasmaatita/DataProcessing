#!/usr/bin/env python
# Name: Tobias Maätita
# Student number: 1073019
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    # load all movies from dom
    movie_all = dom.find_all('div', class_ = 'lister-item mode-advanced')

    #  initiate lists
    titles = []
    ratings = []
    years = []
    actors = []
    runtimes = []

    for movie in movie_all:

        # get each movie's title, rating, year of release, and runtime
        titles.append(movie.h3.a.text)
        ratings.append(float(movie.strong.text))
        years.append(int(movie.h3.find('span', class_ = 'lister-item-year text-muted unbold').text.strip('())(  I')))
        runtimes.append(int(movie.find('span', 'runtime').text.split(' ')[0]))

        # get actors and director(s)
        actors_movie = []
        actors_directors = movie.find_all('p', class_ = "")[1]

        # loop through actors and directors
        for actor in actors_directors:

            # actors start after Stars:
            if "Stars:" in actor:
                while True:
                    actor = actor.next_sibling

                    # break if no next_sibling
                    if actor == None:
                        break

                    # append and skip next comma
                    actors_movie.append(actor.text)
                    actor = actor.next_sibling

        # some films have no actors listed
        if not actors_movie:
            actors.append('-')
        else:
            actors.append(actors_movie)

    # fill dictionary to return
    movies_dict = {}
    movies_dict['titles'] = titles
    movies_dict['ratings'] = ratings
    movies_dict['years'] = years
    movies_dict['actors'] = actors
    movies_dict['runtimes'] = runtimes

    # success
    return movies_dict


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """

    writer = csv.writer(outfile)
    writer.writerow(['sep=,'])
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    # write lines
    for line in range(len(movies['titles']) - 1):

        # convert list of actors to string
        string_actors = ""
        for actor in movies['actors'][line]:
            string_actors += actor
            string_actors += ", "

        # omit last ", "
        string_actors = string_actors[:-2]

        # write row
        writer.writerow([movies['titles'][line], movies['ratings'][line],
                        movies['years'][line], string_actors,
                        movies['runtimes'][line]])


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
