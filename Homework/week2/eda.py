#!/usr/bin/env python
# Name: Tobias Maätita
# Student number: 1073019
import pandas as pd
import csv
import statistics as stat
import matplotlib.pyplot as plt

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
            for info in enumerate(WANTED_INFO):

                # missing info is 'unknown'
                if missing_info and info[1] in missing_keys:
                    countries_info[info[1]].append('unknown')

                # convert string to float
                elif 4 > info[0] > 1:
                    # str_to_float = country[info[1]].replace(',', '.')
                    # countries_info[info[1]].append(float(str_to_float))
                    countries_info[info[1]].append(country[info[1]])

                # convert string to int, get rid of 'dollars'
                elif info[0] == 4:
                    # countries_info[info[1]].append(int(country[info[1]].strip(' dollars')))
                    countries_info[info[1]].append(country[info[1]].strip(' dollars'))

                # strip blank spaces
                else:
                    countries_info[info[1]].append(country[info[1]].strip())

        # dataframe
        df = pd.DataFrame.from_dict(countries_info)

    return df


def main():

    # obtain dataframe
    df = parse(INPUT_FILE)

    # GDP Data: mean, mode and median
    # gdps = df['GDP ($ per capita) dollars'].tolist()
    # count = 0
    # clean_gdps = [int(gdp) for gdp in gdps if not gdp == 'unknown']
    # gdp_mean = stat.mean(clean_gdps)
    # gdp_mode = stat.mode(clean_gdps)
    # gdp_median = stat.median(clean_gdps)
    # gdp_stdev = stat.stdev(clean_gdps)
    # print(f"mean: {gdp_mean}\nmode: {gdp_mode}\nmedian: {gdp_median}\nstd.dev: {gdp_stdev}")

    # histogram maken?

    # infoant mortality
    infants = df['Infant mortality (per 1000 births)']
    count = 0
    for infant in infants:
        count += 1
        if infant == 'unknown':
            print('drop')
            df.drop(index = 0)

    infants = df['Infant mortality (per 1000 births)']
    # print(infants)
    print(len(infants))
    print(len(df))



if __name__ == "__main__":
    # parse(INPUT_FILE)
    main()
