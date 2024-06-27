"""Script to create a sentence by sentence javascript file.

Requires nltk, and the english corpus.
A virtual environment is recommended:
```sh
conda create -n stj python=3.11
conda activate stj
pip install nltk

python scripts/sentences_to_js.py /path/to/story.txt [-t 30000] [-o /path/to/output.js]
```
"""

import argparse
from typing import List, Dict

from nltk.corpus import cmudict
from nltk.tokenize import word_tokenize


def load_lines(path: str) -> List[str]:
    """Loads file.txt in which each line is treated as a new sentence."""
    with open(path, "r") as f_in:
        lines = f_in.readlines()

    if lines[-1][-1] != "\n":
        raise ValueError("Only accept files with newline at the end.")

    return [line[:-1] for line in lines]


def nsyl_word(word: str, d: Dict):
    word = word.lower().strip()
    for tok in ".!?, ’‘:;'”“``":
        word = word.replace(tok, "")
    if len(word) == 0:
        return 0
    # Words which are not in dict: add manually here.
    if word == "neighbour":
        word = "neighbor"
    if word in ["whined", "kneeled", "nt", "ll", "hummed"]:
        # https://www.howmanysyllables.com/syllables/
        # nt -> n't -> not
        # ll -> 'll -> will
        return 1
    if word in [
        "hoovered",
        "jennies",
        "clattered",
        "white-haired",
        "top-hat",
        "two-year",
        "red-blue",
    ]:
        return 2
    if word == "dismissively":
        return 4
    return len(list(y for y in d[word][0] if y[-1].isdigit()))


def nsyl_sen(sentence, d: Dict):
    try:
        nsyls = sum(nsyl_word(word, d) for word in word_tokenize(sentence))
    except KeyError as err:
        print(f"Keyerror: {err}. Fix sentence or add manual entry.")
        print(sentence)
        import sys

        sys.exit(-1)
    return nsyls


def sentences_to_js(sentences: List[str], total_time: int) -> List[str]:
    try:
        d = cmudict.dict()
    except LookupError:
        from nltk import download

        download("cmudict")
        download("punkt")
        d = cmudict.dict()

    sentence_syllables = [nsyl_sen(sentence, d) for sentence in sentences]

    n_total_syllables = sum(sentence_syllables)
    time_for_syllable = total_time / n_total_syllables

    lines = ["var story = {\n  row: [\n"]
    for id_sen, (sentence, syllables) in enumerate(
        zip(sentences, sentence_syllables), 1
    ):
        sentence_n = sentence.replace('"', '\\"')
        lines.extend(
            [
                "    {\n",
                f'      Story: "{sentence_n}",' + "\n",
                f'      order: "{id_sen}",' + "\n",
                f'      num_char: "{len(sentence)}",' + "\n",
                f'      num_syl: "{syllables}",' + "\n",
                f'      time: "{time_for_syllable * syllables}",' + "\n",
                "    },\n",
            ]
        )
    lines.append("  ],\n")
    lines.append("}")

    return lines


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert sentences into JS format.")
    parser.add_argument(
        "path_sentences", type=str, help="path to txt with each sentence in one line."
    )
    parser.add_argument(
        "-t",
        "--time",
        default=30000,
        type=int,
        help="Total time in which story has to be read.",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        default=None,
        help="path to output file, if not given output is printed to console.",
    )
    args = parser.parse_args()

    sentences = load_lines(args.path_sentences)
    js = sentences_to_js(sentences, args.time)

    if args.output is not None:
        with open(args.output, "w") as f_out:
            f_out.writelines(js)
    else:
        print("".join(js) + "\n")
