# linger-volition

How much do participants have to think about a recent experience story, even when told not to?

In this online experiment, participants are following the paradigm from Bellana et al. 2022 closely:

1. Free association (pre) - 3mins
2. Story reading
3. Free association (post) - 3mins
4. Questionnaires

During free association participants are told not to think about a certain topic. In the pre-story free association this is TOPIC A (tbd) in the post-story free association it is the story.
Additionally, participants are instructed to press a button, whenever they think about the story/topic A.

## Setup for development

```sh
# clone project
git clone git@github.com:GabrielKP/linger-volition.git

# change dir to root
cd linger-volition

# create conda environment
conda create -n psiturk python=3.9

# activate environment
conda activate psiturk

# install psyturk
pip install psiturk

# install python-Levenshtein (just to get rid of the warning...)
pip install python-Levenshtein

# turn on
psiturk server on

# turn off
psiturk server off
```

If there are version issues, this repo was created with:

```
python 3.9.15
psiturk 3.3.1
levenshtein 0.20.8
```

## Running an experiment

```bash
# 1. Adapt times in instruct-1-1.html and instruct-2-0.html
# 2. Adapt amount of participants in scripts/gen_word_permutations.py
# 3. Adapt amount of conditions in config.txt
# 3.5 Adpat start and end indices in static/js/task.js
# 4. Set up hosting machine
# 5. sync to host
scripts/sync.sh <host>
# 6. Run your experiment in prolific
# 7. make empty data folder
cp data data_experiment
# 7.5 add prolific experiment id to data_experiment/config/studyIDs.txt
# 8. get data
scripts/get_data.sh <host> data_experiment
# 9. exclude participants
python analysis/exclude_participants.py -s data_experiment
# 10. add proposed IDs to the excluded ones
#     excluded_participantIDs_proposal.txt -> excluded_participantIDs.txt
# 11. update database on host
ssh <host>
sudo -u postgres psql
\c psiturk
# copy statement found in data_experiment/config/sql_exclusion.txt
\q
exit
# 12. now run additional participants until all roles have been filled at least
#     once. You can chek it by inspecting the server log
ssh <host>
less word_simtype/server.log
#     look how many positions have 1 participants vs 0 participants
# 13. run process the data to get overview, output and plots
scripts/process.sh data_experiment
```

## Experiment data data-structure

A data dir is denoted by starting with `data`. E.g. `data_experiment`.
The typical organization is:

```bash
data_experiment/
├── config
│   ├── eventdatafiles.txt
│   ├── excluded_participantIDs_proposal.txt
│   ├── excluded_participantIDs.txt
│   ├── sql_exclusion.txt
│   ├── studyIDs.txt
│   └── trialdatafiles.txt
├── outputs
│   ├── moment_count.csv
│   ├── moment.csv
│   ├── moment_median.csv
│   ├── moment_raw.csv
│   ├── moment_variance.csv
│   ├── overview.txt
│   ├── README.md
│   ├── theme_count.csv
│   ├── theme.csv
│   ├── theme_median.csv
│   ├── theme_raw.csv
│   └── theme_variance.csv
├── plots
│   └── overview
│       ├── hist_count.png
│       ├── hist_rating_moment.png
│       ├── hist_rating_theme.png
│       ├── scatter_theme_moment.html
│       └── scatter_theme_moment.png
├── zipfiles
│   ├── plots.zip
│   └── ratings.zip
├── eventdata.csv
├── questiondata.csv
├── README.md
└── trialdata.csv
```

### Root data dir.

Root data dir, contains subdirs, raw
[`trialdata.csv`](https://psiturk.readthedocs.io/en/stable/recording.html#recording-trial-data),
`eventdata.csv`, `questiondata.csv` and a `README.md`.
Can contain multiple custom named csv files (e.g. `trialdata2.csv`).

### config

Contains config files for experiment:

- `eventdatafiles.txt`: all data files in the root dir containing eventdata (e.g. `eventdata.csv`). One file, one line.
- `trialdatafiles.txt`: all data files in the root dir containing trialdata (e.g. `trialdata.csv`, `trialdata2.csv`). One file, one line.
- `excluded_participantIDs.txt`: contains ids excluded from experiment. One ID, one line.
- `excluded_participantIDs_proposal.txt`: ids proposed to exclude. One ID, one line.
- `sql_exclusion.txt`: sql statement to exclude
- `studyIDs.txt`: prolific studyIDs for which data is extracted in trialdatafiles.txt
- `july`: file only present to mark it is a carver trial, for questionnaire answer analysis.

### outputs

Rating data extracted from raw datafiles.

Following files are contained (x = theme or x = moment):

- `x_raw.csv`: individual ratings
- `x.csv`: mean ratings
- `x_median.csv`: median ratings
- `x_count.csv`: word counts
- `x_variance.csv`: word variances
- `overview.txt`: file with some overview statistics
- `README.md`

Each file has a header in the first row (e.g. word,variance).

Moment words (event-related words may be a better fitting name) were rated
on this question:

- How related is the word to a specific moment within the story?
  (e.g. the word reminds you of specific details in the story)

Theme words were rated independently from each other based on this question:

- How related is the word to the general theme or mood of the story?
  (e.g. you feel the word is related, even though not to a specific moment)

### plots

Contains various basic histograms and plots.
To interactively plot all moment vs theme ratings open
`scatter_themme_moment.html` in your browser

### zipfiles

Contains `plots.zip` and `ratings.zip`, which are a compressed version of the
other folders in the experiment directory.
