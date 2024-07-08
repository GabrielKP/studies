#!/usr/bin/env python3
from typing import Dict, Optional
import argparse
import json
import os
import subprocess
from pathlib import Path


def backup_data(studyname: str, hostname: str, backup_folder: Optional[str]) -> int:
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

    backup_folder = backup_folder or os.environ.get("STUDY_BACKUP_FOLDER")
    if backup_folder is None:
        print(
            "Neither '--backup_folder' is given or STUDY_BACKUP_FOLDER is set. Aborting."
        )
        return 1

    # if backup_folder is none try to load from the environment

    # a bit risky to use delete...
    server_path = Path(backup_folder, studyname)
    subprocess.run(
        [
            "rsync",
            "-rv",
            "--delete",
            f"data/{studyname}/",
            f"{hostname}:{server_path}",
        ],
        check=True,
    )

    # hacky, but convenience...
    print(f"Data backed up into: {hostname}:{server_path}")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backup study data to labserver.")
    parser.add_argument("studyname", type=str, help="name of study to be synchronized.")
    parser.add_argument(
        "hostname",
        type=str,
        help="hostname for labserver instance. Can be ssh Host.",
    )
    parser.add_argument(
        "--backup-folder",
        dest="backup_folder",
        type=str,
        default=None,
        help="backup folder location on labserver, if None, will try to load from the env.",
    )
    args = parser.parse_args()
    backup_data(args.studyname, args.hostname, args.backup_folder)
