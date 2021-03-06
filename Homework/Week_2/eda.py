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
    """
    Parse and preprocess input csv file.
    Returns a dataframe and a dictionary with the parsed info.
    """

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

    return df, countries_info


def gdp_central_tendency(df):
    """
    Calculate central tendency of the GDP per capita per country.
    Isolates the GDP column from a dataframe and returns a histogram of the
    distribution of GDP.
    Also prints the maximum, minimum, mean, mode, median and standard deviation
    of the dataset.
    There was one outlier; Suriname's gdp is 400000 dollars per capita, which is
    abnormally high. I decided to remove this value from the list. The next highest
    value was Luxembourg's 55100 dollars per capita. However, this is not too high.
    """

    # extract series GDP
    gdp_data = df['GDP ($ per capita) dollars']

    # drop NaN and convert to list of ints, whilst cutting outliers
    gdp_data = gdp_data.dropna(axis=0, how="any")
    gdp_list = [int(gdp) for gdp in gdp_data.tolist() if int(gdp) <= 100000]

    gdp_info = {}
    gdp_info['max_gdp'] = max(gdp_list)
    gdp_info['min_gdp'] = min(gdp_list)
    gdp_info['mean_gdp'] = round(np.mean(gdp_list), 2)
    gdp_info['median_gdp'] = np.median(gdp_list)
    gdp_info['mode_gdp'] = stat.mode(gdp_list)
    gdp_info['stdd_gdp'] = round(np.std(gdp_list), 2)

    # inspect max, min for possible outliers in histogram
    #  turns out there were outliers, data is now cleaned while making gdp_list,
    #  see function description.
    plt.hist(gdp_list, bins = 15, rwidth = 0.8)
    plt.xlabel("GDP ($ per capita)")
    plt.xticks(np.arange(0, gdp_info['max_gdp'], step=10000))
    plt.ylabel("Frequency")
    plt.title("Worldwide distribution of GDP per capita", fontsize = 14)

    print("\nGDP INFO\n")
    print(f"- Maximum value: {gdp_info['max_gdp']}\n- Minimum value: {gdp_info['min_gdp']}\n"
          f"- Mean: {gdp_info['mean_gdp']}\n"
          f"- Median: {gdp_info['median_gdp']}\n- Mode: {gdp_info['mode_gdp']}\n"
          f"- Std. dev: {gdp_info['stdd_gdp']}\n")

    return gdp_info, plt.show()


def five_number_infants(df):
    """
    Calculates a five number summary of the information on worldwide infant
    mortality rates. Returns a dictionary with this information, along with a
    boxplot, visualizing the information.
    """

    # get infant mortality data, clean NaN and make a list of float values
    infants = df['Infant mortality (per 1000 births)']
    infants = infants.dropna(axis=0, how="any")
    infant_list = [float(infant.replace(',','.')) for infant in infants.tolist()]

    # load five numbers summary into a dict
    infants_info = {}
    infants_info['Minimum'] = min(infant_list)
    infants_info['Maximum'] = max(infant_list)
    quartiles = np.percentile(infant_list, [25, 50, 75])
    infants_info['Q1'] = quartiles[0]
    infants_info['Median'] = quartiles[1]
    infants_info['Q3'] = quartiles[2]

    print("\nINFANT MORTALITY FIVE NUMBER SUMMARY\n")
    print(f"- Minimum: {infants_info['Minimum']}\n- Q1: {infants_info['Q1']}\n"
          f"- Median: {infants_info['Median']}\n- Q3: {infants_info['Q3']}\n"
          f"- Maximum: {infants_info['Maximum']}\n")

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
        flier.set(marker='o', markerfacecolor='#3E99B9', alpha=0.5)

    plt.suptitle("Worldwide infant mortality per 1000 births", fontsize = 14)
    plt.title("Five Number Summary")
    plt.ylabel("Infant mortality per 1000 births")

    return plt.show()


def write_to_json(countries_info):
    """
    Write dictionary to json file.
    """

    with open('countries.json', 'w') as f:
        countries_dict = {}
        # iterate over countries, getting each name
        for index, country in enumerate(countries_info['Country']):

            # every name is a key holding a own dictionary
            countries_dict[country] = {}

            # fill dictionary behind name with its info
            for key in WANTED_INFO:
                # NaN is a float, json takes 'NULL' rather than 'NaN'
                if key is not 'Country' and not isinstance(countries_info[key][index], float):

                    # as per the example in the assignment, commas need to be
                    #  replaced by dots
                    if ',' in countries_info[key][index]:
                        countries_info[key][index] = countries_info[key][index].replace(',','.')

                    # insert dictionary behind country key
                    countries_dict[country][key] = countries_info[key][index]

                # replace NaN with 'NULL'
                elif isinstance(countries_info[key][index], float):
                    countries_dict[country][key] = 'NULL'

        # write to json file
        f.write(json.dumps(countries_dict))

    return True


def scatter(df):
    """
    Scatterplot of a country's gdp plotted against its infant mortality rate per
    1000 births.
    """

    # infant data
    infants = df['Infant mortality (per 1000 births)']
    infant_list = []

    # possibly incorrect data, as it is unclear to me how NaN values are processed
    for infant in infants:
        if isinstance(infant, float):
            infant_list.append('NaN')
        else:
            infant_list.append(float(infant.replace(',','.')))

    # gdp data
    gdp_data = df['GDP ($ per capita) dollars']
    gdp_list = []
    for gdp in gdp_data:
        if isinstance(infant, float):
            gdp_list.append('NaN')
        elif float(gdp) > 100000:
            gdp_list.append(float(50000))
        else:
            gdp_list.append(float(gdp))

    plt.scatter(gdp_list, infant_list, cmap = 'viridis')
    plt.title("Each country's infant mortality plotted against GDP")
    plt.xlabel("GDP per capita ($)")
    plt.ylabel("Infant mortality per 1000 births")
    plt.show()

    return True


def main(input):
    """
    Main function.
    """

    # obtain dataframe
    df, countries_info = parse(input)

    # get dict with gdp data and histogram
    gdp_info = gdp_central_tendency(df)

    # five number summary of infant mortality rates
    five_number_infants(df)

    # write to json
    write_to_json(countries_info)

    # scatterplot (optional)
    scatter(df)

    return True


if __name__ == "__main__":
    main(INPUT_FILE)
