#!/usr/bin/env python
# Name: Tobias Maätita
# Student number: 1073019
import pandas as pd
import csv
import json
import statistics as stat
import matplotlib.pyplot as plt
import numpy as np

INPUT_FILE = "input.csv"
WANTED_INFO = ['Country', 'Region', 'Pop. Density (per sq. mi.)',
               'Infant mortality (per 1000 births)',
               'GDP ($ per capita) dollars']

def parse(input):
    with open(input) as countries:

        # read input file
        countries_dict = csv.DictReader(countries)

        # info of all countries will be list with dictionaries
        countries_info = {str(key): [] for key in WANTED_INFO}

        # iterate over information
        for country in countries_dict:
            country_info = []
            missing_info = False
            missing_keys = []

            # check whether all information is available
            for key, value in country.items():

                # missing information
                if not value and key in WANTED_INFO:
                    missing_info = True

                    # remember which values are missing
                    missing_keys.append(key)

                # some values are unknown
                elif value == 'unknown':
                    missing_info = True
                    missing_keys.append(key)

            # add info
            for i, info in enumerate(WANTED_INFO):

                # missing info is 'unknown'
                if missing_info and info in missing_keys:
                    countries_info[info].append(np.nan)

                # convert string to float
                elif 4 > i > 1:
                    # str_to_float = country[info[1]].replace(',', '.')
                    # countries_info[info[1]].append(float(str_to_float))
                    countries_info[info].append(country[info])

                # convert string to int, get rid of 'dollars'
                elif i == 4:
                    # countries_info[info[1]].append(int(country[info[1]].strip(' dollars')))
                    countries_info[info].append(country[info].strip(' dollars'))

                # strip blank spaces
                else:
                    countries_info[info].append(country[info].strip())

        # dataframe
        df = pd.DataFrame.from_dict(countries_info)

    return df

def gdp_central_tendency(df):
    """
    Calculate central tendency of the GDP per capita per country.
    Isolates the GDP column from a dataframe and returns a histogram of the
    distribution of GDP.
    Also prints the maximum, minimum, mean, mode, median and standard deviation
    of the dataset
    """

    # extract series GDP
    gdp_data = df['GDP ($ per capita) dollars']

    # drop NaN and convert to list of ints, whilst cutting outliers
    gdp_data = gdp_data.dropna(axis=0, how="any")
    gdp_list = [int(gdp) for gdp in gdp_data.tolist() if int(gdp) <= 100000]

    # inspect max, min for possible outliers in histogram
    #  turns out there were outliers, data is now cleaned while making gdp_list,
    #  see justification.txt
    plt.hist(gdp_list, rwidth = 0.8)
    plt.xlabel("GDP ($ per capita)")
    plt.ylabel("Frequency")
    plt.title("Worldwide distribution of GDP per capita", fontsize = 14)

    max_gdp = max(gdp_list)
    min_gdp = min(gdp_list)
    mean_gdp = round(np.mean(gdp_list), 2)
    median_gdp = np.median(gdp_list)
    mode_gdp = stat.mode(gdp_list)
    stdd_gdp = round(np.std(gdp_list), 2)
    print("\nGDP INFO\n")
    print(f"- Maximum value: {max_gdp}\n- Minimum value: {min_gdp}\n- Mean: {mean_gdp}\n"
          f"- Median: {median_gdp}\n- Mode: {mode_gdp}\n- Std. dev: {stdd_gdp}\n")

    return plt.show()

def five_number_infants(df):
    # get infant mortality data, clean NaN and make a list of float values
    infants = df['Infant mortality (per 1000 births)']
    infants = infants.dropna(axis=0, how="any")
    infant_list = [float(infant.replace(',','.')) for infant in infants.tolist()]

    # make boxplot
    bp = plt.boxplot(infant_list, patch_artist = True)

    # color boxplot
    for box in bp['boxes']:
        # change outline color
        box.set(color='#153C66', linewidth=2)
        # change fill color
        box.set(facecolor = '#3E99B9')
    for median in bp['medians']:
        median.set(color='#000000', linewidth=2)
    for flier in bp['fliers']:
        flier.set(marker='o', color='#e7298a', alpha=0.5)

    plt.title("Worldwide infant mortality per 1000 births", fontsize = 14)

    return plt.show()


def main():

    # obtain dataframe
    df = parse(INPUT_FILE)

    # get gdp data and histogram
    gdp_central_tendency(df)

    # five number summary of infant mortality rates
    five_number_infants(df)


if __name__ == "__main__":
    # parse(INPUT_FILE)
    main()
