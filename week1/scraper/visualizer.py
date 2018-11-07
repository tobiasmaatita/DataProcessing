#!/usr/bin/env python
# Name: Tobias Maätita
# Student number: 10730109
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data and a counter
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}
counter = {str(key): 0 for key in range(START_YEAR, END_YEAR)}


def visualize(input_file):
    with open(input_file) as movies:

        # read input file
        movies_dict = csv.DictReader(movies)

        # get year of release
        for row in movies_dict:
            year = row['Year']

            # add score to data_dict and count no. of films in year
            if not data_dict[year]:
                data_dict[year] = float(row['Rating'])
                counter[year]  += 1
            else:
                data_dict[year] += float(row['Rating'])
                counter[year] += 1

        # get mean rating per year of release
        mean_rating = []
        year_release = []

        for key in range(START_YEAR, END_YEAR):
            year = str(key)
            data_dict[year] = round(data_dict[year] / counter[year], 1)
            mean_rating.append(data_dict[year])
            year_release.append(key)

        # plot mean rating against year of release
        plt.plot(year_release, mean_rating)
        plt.axis([START_YEAR, END_YEAR - 1, 0, 10])
        plt.xticks(range(START_YEAR, END_YEAR))
        plt.yticks(range(11))
        plt.suptitle('Mean IMDB rating of top-50 films', fontsize = 15)
        plt.title('per year between 2007 and 2018', loc = 'center')
        plt.xlabel('Year of release')
        plt.ylabel('Mean IMDB rating')

        # return plot
        return plt.show()


if __name__ == "__main__":
    visualize(INPUT_CSV)
