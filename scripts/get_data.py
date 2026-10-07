#!/usr/bin/env python3
import argparse
import glob
import json
import shutil
import subprocess
from pathlib import Path
from typing import Dict


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
    print("Using study_id:", studyname_on_server)
    if not Path.exists(Path("data", studyname, "json")):
        print(f"Creating new data dir for {studyname}")
        # 1. copy example over
        shutil.copytree(Path("data", "example"), Path("data", studyname))

        # 2. Fill in study config ids
        story = input("Story: ")
        condition = input("Condition: ")
        with open(
            Path("data", studyname, "config", "story_condition_id.txt"), "w"
        ) as f_out:
            f_out.writelines([story, "\n", condition, "\n"])

        # 3. remove gitkeep
        Path("data", studyname, "json", ".gitkeep").unlink()

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

    # remove all the files that were marked as excluded beforehand
    paths = sorted(glob.glob(f"data/{studyname}/json/*.json"))
    previous_path = None
    for path in paths:
        if path.replace(".json", ".excluded.json") == previous_path:
            Path.unlink(Path(path))
            print(f"Deleted {Path(path).name} (excluded)")
        else:
            previous_path = path

    # now download videos
    remote_video_dir = f"~/psyserver/data/studydata/{studyname_on_server}/video/*"

    has_videos = subprocess.run(
        ["ssh", hostname, f'test -n "$(ls -A {remote_video_dir} 2>/dev/null)"']
    )
    if has_videos.returncode == 255:
        raise ValueError(f"Cannot connect to {hostname}")

    if has_videos.returncode == 0:
        video_dir = Path("data") / studyname / "video"
        video_dir.mkdir(parents=True, exist_ok=True)

        subprocess.run(
            [
                "rsync",
                "-a",
                "--partial",
                f"{hostname}:{remote_video_dir}",
                f"data/{studyname}/video/",
            ],
            check=True,
        )
        print(f"Video data downloaded into: 'data/{studyname}/video/'")


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
