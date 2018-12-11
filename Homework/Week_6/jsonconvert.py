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
INPUT_FILE = "data/tarantino.csv"

# the info wanted from the dataset
#  in this case, I chose to only use year, team name, status, total points,
#  percentage of field goals scored and percentage of three pointers scored.
NEEDED_INFO = ["movie", "type", "word"]

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
    # int_keys = ['minutes_in']
    # for key in int_keys:
    #     data_dict[key] = [int(value) for value in data_dict[key]]

    # for NULL
    key = 'type'
    for i, line in enumerate(data_dict[key]):
        if line == 'death':
            data_dict['word'][i] = 0

    # strip spaces
    key = 'word'
    for i, line in enumerate(data_dict[key]):
        if not line == 0:
            data_dict[key][i] = line.strip()

    # # for float:
    # key = 'minutes_in'
    # # every 10 minutes, rounded up to nearest 5
    # data_dict[key] = [round(float(value)) + 2 - round(float(value)) % 2
    #                   for value in data_dict[key]]

    return data_dict


def counter(data_dict):
    """
    Specific for tarantino.js, count number of words etc.
    """

    head = 'movie'

    # initiate json dict
    counter_dict = {}

    # get all words, put in Set
    all_words = set(data_dict['word'])

    counter_dict = {str(key): {'deaths': 0, 'profanity': 0, 'words': {word: 0 for word in all_words}} for key in set(data_dict[head])}

    deaths = 0
    profanity = 0

    for index, key in enumerate(data_dict[head]):
        print(key)
        film = data_dict[head][index]
        word = data_dict['word'][index]
        if not isinstance(word, int):
            counter_dict[film]['profanity'] += 1
            counter_dict[film]['words'][word] += 1
        else:
            counter_dict[film]['deaths'] += 1

    return counter_dict

def to_json(data_dict):
    """
    Write the json file.
    """

    with open('data/tarantinoPie.json', 'w') as f:

        # # select on which key to arrange JSON file: in this case I used the team.
        # head = 'movie'
        #
        # # initiate json dict
        # json_dict = {}
        # json_dict = {str(key): {'type': [], 'word': []} for key in set(data_dict[head])}
        #
        # # code specificly for this dataset
        # for index, key in enumerate(data_dict[head]):
        #     for key2 in NEEDED_INFO[1:]:
        #         json_dict[key][key2].append(data_dict[key2][index])

        # write json
        f.write(json.dumps(data_dict))

    return True


if __name__ == "__main__":
    # champ, runnerup, years = input_read(INPUT_FILE)
    dict = input_read(INPUT_FILE)
    data = preprocess(dict)
    counted = counter(data)
    to_json(counted)
