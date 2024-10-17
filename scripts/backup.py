#!/usr/bin/env python3
from typing import Dict, Optional
import argparse
import os
import subprocess
from pathlib import Path


def backup_data(studyname: str, hostname: str, backup_folder: Optional[str]) -> int:

    backup_folder = backup_folder or os.environ.get("STUDY_BACKUP_FOLDER")
    if backup_folder is None:
        print(
            "Neither '--backup_folder' is given or STUDY_BACKUP_FOLDER is set. Aborting."
        )
        return 1

    # if backup_folder is none try to load from the environment

    # a bit risky to use delete...
    server_path = Path(backup_folder, studyname)
    backup_path = Path(backup_folder, "backup", studyname)
    completed_process = subprocess.run(
        [
            "rsync",
            "-rv",
            "--delete",
            "--backup",
            f"--backup-dir={backup_path}",
            f"data/{studyname}/",
            f"{hostname}:{server_path}",
        ],
        check=True,
    )

    # hacky, but convenience...
    print(f"Data backed up into: {hostname}:{server_path}")
    return completed_process.returncode


def recover_data(studyname: str, hostname: str, backup_folder: Optional[str]) -> int:

    backup_folder = backup_folder or os.environ.get("STUDY_BACKUP_FOLDER")
    if backup_folder is None:
        print(
            "Neither '--backup_folder' is given or STUDY_BACKUP_FOLDER is set. Aborting."
        )
        return 1

    server_path = Path(backup_folder, studyname)
    completed_process = subprocess.run(
        [
            "rsync",
            "-rv",
            "--update",
            f"{hostname}:{server_path}/",
            f"data/{studyname}",
        ],
        check=True,
    )
    return completed_process.returncode


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
    parser.add_argument(
        "--recover",
        action="store_true",
        help="download data from hostname instead of backing up.",
    )
    args = parser.parse_args()

    if args.recover:
        recover_data(args.studyname, args.hostname, args.backup_folder)
    else:
        backup_data(args.studyname, args.hostname, args.backup_folder)
