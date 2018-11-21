#!/usr/bin/env python
# Name: Tobias Maätita
# Student number: 1073019
import pandas as pd
import csv
import json
import statistics as stat
import matplotlib.pyplot as plt
import numpy as np

# input file retreived from https://www.kaggle.com/daverosenman/nba-finals-team-stats/version/5,
#  courtesy of user DaveRosenman
#  if needed, enter another filename here
INPUT_FILE = "data/NBA_finals.csv"

# the info wanted from the dataset
#  in this case, I chose to only use year, team name, status, total points,
#  percentage of field goals scored and percentage of three pointers scored.
NEEDED_INFO = ["Year", "Status", "Team", "PTS", "FGP", "TPP"]

def input_read(input):
    """
    Parse the dataset and store in a dict to read later.
    """

    with open(input) as f:
        reader = csv.DictReader(f)

        fieldnames = reader.fieldnames

        data_dict = {str(key): [] for key in NEEDED_INFO}

        for i, row in enumerate(reader):
            for key in NEEDED_INFO:
                data_dict[key].append(row[key])

    return data_dict


def preprocess(data_dict):
    """
    Preprocess data to use in json file, for instance change strings to floats
    or integers for calculations.
    """

    # for int:
    int_keys = ['Year']
    for key in int_keys:
        data_dict[key] = [int(value) for value in data_dict[key]]

    # for float:
    float_keys = ['PTS', 'FGP', 'TPP']
    float_decimals = 2
    for key in float_keys:
        data_dict[key] = [round(float(value), float_decimals)
                          for value in data_dict[key]]

    return data_dict


def to_json(data_dict):
    """
    Write the json file.
    """

    with open('data/temp.json', 'w') as f:

        # select on which key to arrange JSON file: in this case I used the year.
        head = 'Year'

        # initiate json dict
        json_dict = {}
        json_dict = {str(key): {} for key in set(data_dict[head])}

        # selection keys
        select_1 = 'Champions'
        select_2 = 'Runner up'

        # code specificly for this dataset: even numbers are champions, odd numbers
        #  are the runner ups
        for index, key in enumerate(data_dict[head]):
            if index % 2 == 0:
                json_dict[str(key)][select_1] = {}
                for key2 in NEEDED_INFO[2::]:
                    json_dict[str(key)][select_1][key2] = data_dict[key2][index]
            else:
                json_dict[str(key)][select_2] = {}
                for key2 in NEEDED_INFO[2::]:
                    json_dict[str(key)][select_2][key2] = data_dict[key2][index]

        # write json
        f.write(json.dumps(json_dict))

    return True


if __name__ == "__main__":
    # champ, runnerup, years = input_read(INPUT_FILE)
    dict = input_read(INPUT_FILE)
    data = preprocess(dict)
    to_json(data)
