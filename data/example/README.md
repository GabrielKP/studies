## Experiment data data-structure

A data dir is denoted by starting with `data`. E.g. `data_experiment`.
The typical organization is:

```bash
example/
├── config
│   ├── story_condition_id.txt
│   └── studyIDs.txt
├── raw
│   ├── participant_1.json
│   ├── participant_2.json
│   ├── ...
│   └── participant_N.json
└── README.md
```

### config

Contains config files for experiment:

- `story_condition_id.txt`: first line is the story id, the second line is the condition id
- `studyIDs.txt`: prolific studyIDs for which data is extracted in trialdatafiles.txt

### raw

Contains `.json` participant data.
