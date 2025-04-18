#!/usr/bin/env python3
import argparse
import glob
import json
import os


def check_participant(studyname: str, prolific_id: str):
    if not os.path.exists(os.path.join("data", studyname)):
        raise ValueError(f"Invalid studyname: {studyname}")

    path_json_files = glob.glob(os.path.join("data", studyname, "json", "*.json"))
    candidates = [
        path_json_file
        for path_json_file in path_json_files
        if prolific_id in path_json_file
    ]
    if len(candidates) == 0:
        print("No json file found.")
        return 0
    non_debug_candidates = [
        candidate
        for candidate in candidates
        if not candidate.endswith(".debug.json")
        and not candidate.endswith(".excluded.json")
    ]
    if len(non_debug_candidates) > 1:
        print("Multiple submissions!")

    with open(non_debug_candidates[-1], "r") as f_in:
        data = json.load(f_in)

    stage_beginnings = dict()
    stage_endings = dict()
    for datapoint in data["trialdata"]:
        if datapoint["data"].get("status") == "stage_begin":
            stage_beginnings[datapoint["stage"]] = datapoint["timestamp"]
        if datapoint["data"].get("status") == "stage_end":
            stage_endings[datapoint["stage"]] = datapoint["timestamp"]

    stage_beginnings["TOTAL"] = stage_beginnings["welcome"]
    stage_endings["TOTAL"] = stage_beginnings["complete"]

    max_len = max(map(len, stage_beginnings.keys()))
    for stage in stage_beginnings:
        whitespaces = " " * (max_len - len(stage))
        if stage not in stage_endings:
            print(f"{stage}{whitespaces} | no ending")
            continue
        stage_time_s = (stage_endings[stage] - stage_beginnings[stage]) / 1000
        stage_time_m = stage_time_s / 60

        print(
            f"{stage}{whitespaces} | {round(stage_time_s, 2):6.2f}s |  {round(stage_time_m, 2):6.2f}m"
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser("Checks on a participants data submission.")
    parser.add_argument("studyname", type=str, help="name of study to be synchronized.")
    parser.add_argument("prolific_id", type=str, help="prolific id")
    args = parser.parse_args()
    check_participant(args.studyname, args.prolific_id)
