#!/usr/bin/env python3
import argparse
import json


def debug(path_json: str):
    with open(path_json, "r") as f_in:
        data = json.load(f_in)

    if path_json.endswith(".json"):
        output_path = path_json.replace(".json", ".debug.json")
    else:
        output_path = path_json + ".debug.json"

    # take unnecessary information out
    for datapoint in data["trialdata"]:
        datapoint.pop("participantID")
        datapoint.pop("study_id")
        datapoint.pop("session_id")

    with open(output_path, "w") as f_out:
        json.dump(data, f_out, indent=4)

    print("Output:")
    print(output_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "path_json", type=str, help="Path to json file to make look nice"
    )
    args = parser.parse_args()
    debug(args.path_json)
