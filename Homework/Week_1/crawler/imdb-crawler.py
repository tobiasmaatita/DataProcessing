#!/usr/bin/env python
# Name: Tobias Maätita
# Student number: 10730109
"""
This script crawls the IMDB top 250 movies.
"""

import os
import csv
import codecs
import errno

from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

# global constants
TOP_250_URL = 'http://www.imdb.com/chart/top'
OUTPUT_CSV = 'top250movies.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

# --------------------------------------------------------------------------
# Utility functions (no need to edit):


def create_dir(directory):
    """
    Create directory if needed.
    Args:
        directory: string, path of directory to be made
    Note: the backup directory is used to save the HTML of the pages you
        crawl.
    """

    try:
        os.makedirs(directory)
    except OSError as e:
        if e.errno == errno.EEXIST:
            # Backup directory already exists, no problem for this script,
            # just ignore the exception and carry on.
            pass
        else:
            # All errors other than an already existing backup directory
            # are not handled, so the exception is re-raised and the
            # script will crash here.
            raise


def save_csv(filename, rows):
    """
    Save CSV file with the top 250 most popular movies on IMDB.
    Args:
        filename: string filename for the CSV file
        rows: list of rows to be saved (250 movies in this exercise)
    """
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'title', 'runtime', 'genre(s)', 'director(s)', 'writer(s)',
            'actor(s)', 'rating(s)', 'number of rating(s)'
        ])

        writer.writerows(rows)


def make_backup(filename, html):
    """
    Save HTML to file.
    Args:
        filename: absolute path of file to save
        html: (unicode) string of the html file
    """

    with open(filename, 'wb') as f:
        f.write(html)


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


def main():
    """
    Crawl the IMDB top 250 movies, save CSV with their information.
    Note:
        This function also makes backups of the HTML files in a sub-directory
        called HTML_BACKUPS (those will be used in grading).
    """

    # Create a directory to store copies of all the relevant HTML files (those
    # will be used in testing).
    print('Setting up backup dir if needed ...')
    create_dir(BACKUP_DIR)

    # Make backup of the IMDB top 250 movies page
    print('Access top 250 page, making backup ...')
    top_250_html = simple_get(TOP_250_URL)
    top_250_dom = BeautifulSoup(top_250_html, "lxml")


    make_backup(os.path.join(BACKUP_DIR, 'index.html'), top_250_html)

    # extract the top 250 movies
    print('Scraping top 250 page ...')
    url_strings = scrape_top_250(top_250_dom)

    # grab all relevant information from the 250 movie web pages
    rows = []
    for i, url in enumerate(url_strings):  # Enumerate, a great Python trick!
        print('Scraping movie %d ...' % i)

        # Grab web page
        movie_html = simple_get(url)

        # Extract relevant information for each movie
        movie_dom = BeautifulSoup(movie_html, "lxml")
        rows.append(scrape_movie_page(movie_dom))

        # Save one of the IMDB's movie pages (for testing)
        if i == 83:
            html_file = os.path.join(BACKUP_DIR, 'movie-%03d.html' % i)
            make_backup(html_file, movie_html)

    # Save a CSV file with the relevant information for the top 250 movies.
    print('Saving CSV ...')
    save_csv(os.path.join(SCRIPT_DIR, 'top250movies.csv'), rows)


# --------------------------------------------------------------------------
# Functions to adapt or provide implementations for:

def scrape_top_250(soup):
    """
    Scrape the IMDB top 250 movies index page.
    Args:
        soup: parsed DOM element of the top 250 index page
    Returns:
        A list of strings, where each string is the URL to a movie's page on
        IMDB, note that these URLS must be absolute (i.e. include the http
        part, the domain part and the path part).
    """

    # allocate movie_urls
    movie_urls = []

    # get movie links
    movies_all = soup.find_all('td', class_ = 'titleColumn')

    # append url to urls
    for movie in movies_all:
        url = ""
        url += "http://imdb.com"
        url += movie.a['href']
        movie_urls.append(url)

    return movie_urls


def scrape_movie_page(dom):
    """
    Scrape the IMDB page for a single movie
    Args:
        dom: BeautifulSoup DOM instance representing the page of 1 single
            movie.
    Returns:
        A list of strings representing the following (in order): title, year,
        duration, genre(s) (semicolon separated if several), director(s)
        (semicolon separated if several), writer(s) (semicolon separated if
        several), actor(s) (semicolon separated if several), rating, number
        of ratings.
    """
    # allocate movie_info
    movie_info = []

    # info from title_wrapper
    title_wrapper = dom.find_all('div', class_ = 'title_wrapper')[0]

    # movie title
    title = title_wrapper.find('h1').contents[0]
    movie_info.append(title[:-1])

    # movie year
    year = title_wrapper.find('h1').contents[1].text.strip('()')
    movie_info.append(year)

    # movie duration
    duration = title_wrapper.find('time')['datetime'].strip('PTM')
    movie_info.append(duration)

    # movie genres, separated by ; when more than 1
    genres = title_wrapper.find_all('a', 'genres' in 'href')[1:-1]

    # return a string of genres
    movie_genres = ""
    if len(genres) > 1:
        for i in range(len(genres)):
            genre = genres[i].string.strip()
            movie_genres += genre
            movie_genres += '; '

        # omit last '; '
        movie_genres = movie_genres[:-2]
    else:
        movie_genres = genres[0].string.strip()

    movie_info.append(movie_genres)

    # info from credit_summary_item
    summary = dom.find_all('div', class_ = 'credit_summary_item')

    # movie directors, separated by ; if more than one
    directors = summary[0].find_all('a')

    # return a string of directors
    movie_directors = ""
    if len(directors) > 1:
        for i in range(len(directors)):
            director = directors[i].string.strip()
            movie_directors += director
            movie_directors += '; '

        # omit last ;
        movie_directors = movie_directors[:-2]
    else:
        movie_directors = directors[0].string.strip()

    movie_info.append(movie_directors)

    # movie writers, separated by ; if more than 1
    writers = summary[1].find_all('a')
    movie_writers = ""

    if len(writers) > 1:
        for i in range(len(writers)):
            writer = writers[i].string.strip()

            # sometimes, last writer(s) are noted as '1 more credit'
            if 'credit' in writer:
                pass
            else:
                movie_writers += writer
                movie_writers += '; '

        # omit last '; '
        movie_writers = movie_writers[:-2]
    else:
        movie_writers = writers[0].string.strip()

    movie_info.append(movie_writers)

    # first three movie actors, separated by ; if more than 1
    actors = summary[2].find_all('a')

    # return string of actors
    movie_actors = ""
    for i in range(3):
        actor = actors[i].string
        movie_actors += actor
        movie_actors += '; '

    # omit last '; ' and append
    movie_actors = movie_actors[:-2]
    movie_info.append(movie_actors)

    # IMDB-rating
    rating = dom.find('span', itemprop = "ratingValue").string
    movie_info.append(rating)

    # number of ratings
    rating_amount = dom.find('span', itemprop = 'ratingCount').string.replace(',', '')
    movie_info.append(rating_amount)

    # success
    return movie_info


if __name__ == '__main__':
    main()
