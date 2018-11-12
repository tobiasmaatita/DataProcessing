#!/usr/bin/env python
# Name: Tobias Maätita
# Student number: 1073019
import pandas as pd
import csv
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


def main():

    # obtain dataframe
    df = parse(INPUT_FILE)

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
    plt.suptitle("Frequency of GDP worldwide")

    plt.show()

    max_gdp = max(gdp_list)
    min_gdp = min(gdp_list)
    print(f"Maximum value: {max_gdp}\nMinimum value: {min_gdp}")






    # # GDP Data: mean, mode and median
    # # gdps = df['GDP ($ per capita) dollars'].tolist()
    # gdps = df['GDP ($ per capita) dollars']
    # df.query('GDP ($ per capita) dollars != None')
    # mean = gdps.mean()
    # print(f"MEAN: {mean}")
    # count = 0
    # clean_gdps = [int(gdp) for gdp in gdps if gdp]
    # # gdp_mean = stat.mean(clean_gdps)
    # # gdp_mean = clean_gdps.mean()
    # gdp_mode = stat.mode(clean_gdps)
    # gdp_median = stat.median(clean_gdps)
    # gdp_stdev = stat.stdev(clean_gdps)
    # print(f"mean: {gdp_mean}\nmode: {gdp_mode}\nmedian: {gdp_median}\nstd.dev: {gdp_stdev}")
    # print(df['GDP ($ per capita) dollars'].tolist())
    # # histogram maken?\
    # print(len(clean_gdps))

    # infoant mortality
    # infants = df[df.'Infant mortality (per 1000 births)' != 'unknown']
    # clean_infants = [float(infant.replace(',','.')) for infant in infants if not infant == 'unknown']
    # print(len(infants))

    # boxplot = df.boxplot(column=['Infant mortality (per 1000 births)'])





if __name__ == "__main__":
    # parse(INPUT_FILE)
    main()
