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
    subprocess.run(
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
    return 0


def recover_data(studyname: str, hostname: str, backup_folder: Optional[str]) -> int:

    backup_folder = backup_folder or os.environ.get("STUDY_BACKUP_FOLDER")
    if backup_folder is None:
        print(
            "Neither '--backup_folder' is given or STUDY_BACKUP_FOLDER is set. Aborting."
        )
        return 1

    server_path = Path(backup_folder, studyname)
    subprocess.run(
        [
            "rsync",
            "-rv",
            "--update",
            f"{hostname}:{server_path}/",
            f"data/{studyname}",
        ],
        check=True,
    )
    print(f"Data recovered into: data/{studyname}")
    return 0


def sync_id_mapping(hostname: str, backup_folder: Optional[str]) -> int:

    backup_folder = backup_folder or os.environ.get("STUDY_BACKUP_FOLDER")
    if backup_folder is None:
        print(
            "Neither '--backup_folder' is given or STUDY_BACKUP_FOLDER is set. Aborting."
        )
        return 1

    server_path = Path(backup_folder, "id_mapping", "id_mapping.json")
    local_path = Path("data", "id_mapping.json")

    print(f"{hostname} -> local")
    subprocess.run(
        [
            "rsync",
            "--update",
            f"{hostname}:{server_path}",
            local_path,
        ],
        check=True,
    )

    print(f"local -> {hostname}")
    subprocess.run(
        [
            "rsync",
            "--update",
            local_path,
            f"{hostname}:{server_path}",
        ],
        check=True,
    )

    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backup study data to labserver.")
    parser.add_argument(
        "studyname",
        type=str,
        help="name of study to be backed up. If 'id_mapping' will sync id_mapping.json file.",
    )
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

    if args.studyname == "id_mapping":
        sync_id_mapping(args.hostname, args.backup_folder)
    elif args.recover:
        recover_data(args.studyname, args.hostname, args.backup_folder)
    else:
        backup_data(args.studyname, args.hostname, args.backup_folder)
