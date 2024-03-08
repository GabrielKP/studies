<div align="center">

# Studies

</div>

Javascript implementation of multiple online studies distributed via [psyserver](https://github.com/GabrielKP/psyserver).

## Structure

The root directory is structured as follows:

```bash
studies/
├── data
│   ├── example
│   ├── free-association
│   └── ...
├── readme
├── scripts
│   ├── get_data.sh
│   └── sync.sh
├── www
│   ├── free-association
│   └── linger-interference-pause
├── .gitignore
└── README.md
```

- `data` contains the data collected for each study. The directory names in data are the same as the ones in www
- `readme` contains files for the readme.
- `scripts` contains a synchronization script to psyserver (`sync.py`) and a data download script (`get_data.py`)
- `www` contains the code for each study.

## Studies

### Free Association

Chained free association task (also: word chain game).

Participants are asked to type any word that comes to mind, and then based on that word type the next word that comes to mind.

<div align="center">

<img src="readme/free-association.png" alt="Chained Free Association" height="200" width="360"/>

</div>

### linger-interference-pause

A study in which participants do free association, read a story, go through a pause, and then to free association again.

### linger-ocd

A study in which participants get a personality/rumination/depression and ocd questionnare at the end.
