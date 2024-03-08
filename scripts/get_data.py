#!/usr/bin/env python3
from typing import Dict
import json
import argparse
import subprocess


def get_data(studyname: str, hostname: str) -> None:
    # Get studyname which study uses on psyserver
    with open("www/studymap.json", "r") as f_studymap:
        studymap: Dict[str, str] = json.load(f_studymap)

    try:
        studyname_on_server = studymap[studyname]
    except KeyError:
        raise KeyError(
            f"studyname '{studyname}' not in studymap."
            f" Choose one of {list(studymap.keys())}."
        )

    # TODO: handle novel study dir

    subprocess.run(
        [
            "rsync",
            # "--delete",
            f"{hostname}:~/psyserver/data/studydata/{studyname_on_server}/*.json",
            f"data/{studyname}/json/",
        ],
        check=True,
    )

    # a bit hacky, but convenience wins
    print(f"Data downloaded into: 'data/{studyname}/json/'")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Synchronize experiment with psyserver."
    )
    parser.add_argument(
        "hostname",
        type=str,
        help="hostname for psyserver instance. Can be ssh Host.",
    )
    parser.add_argument("studyname", type=str, help="name of study to be synchronized.")
    args = parser.parse_args()
    get_data(args.studyname, args.hostname)
