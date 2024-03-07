#!/usr/bin/env python3
from typing import Dict
import json
import argparse
import subprocess


def sync(studyname: str, hostname: str) -> None:
    # To make studynames unobvious on psyserver
    with open("www/studymap.json", "r") as f_studymap:
        studymap: Dict[str, str] = json.load(f_studymap)

    try:
        studyname_on_server = studymap[studyname]
    except KeyError:
        raise KeyError(
            f"studyname '{studyname}' not in studymap."
            f" Choose one of {list(studymap.keys())}."
        )

    subprocess.run(
        [
            "rsync",
            "-rv",
            "--delete",
            f"www/{studyname}/",
            f"{hostname}:~/psyserver/data/studies/{studyname_on_server}",
        ],
        check=True,
    )

    # a bit hacky, but convenience wins
    if hostname == "psyserver.demo":
        print(f"Study live on https://demo.honeylab.org/{studyname_on_server}")
    if hostname == "psyserver":
        print(
            f"Study live on https://www.behaviorstudyonline.com/{studyname_on_server}"
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Synchronize experiment with psyserver."
    )
    parser.add_argument("studyname", type=str, help="name of study to be synchronized.")
    parser.add_argument(
        "hostname",
        type=str,
        help="hostname for psyserver instance. Can be ssh Host.",
    )
    args = parser.parse_args()
    sync(args.studyname, args.hostname)
