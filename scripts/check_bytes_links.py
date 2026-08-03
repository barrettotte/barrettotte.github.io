#!/usr/bin/env -S uv run

"""Validate Bytes repository URLs in data/bytes.json against a local checkout."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "bytes.json"
REPOSITORY_PREFIX = ("barrettotte", "bytes")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repo",
        type=Path,
        default=ROOT.parent / "bytes",
        help="path to the local Bytes repository (default: sibling ../bytes)",
    )
    return parser.parse_args()


def strings(value: object, path: str = "$"):
    if isinstance(value, dict):
        for key, child in value.items():
            yield from strings(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from strings(child, f"{path}[{index}]")
    elif isinstance(value, str):
        yield path, value


def bytes_target(url: str) -> tuple[Path, str] | None:
    parsed = urlparse(url)
    parts = tuple(unquote(parsed.path).strip("/").split("/"))

    if parsed.netloc == "github.com" and parts[:2] == REPOSITORY_PREFIX:
        if len(parts) < 5 or parts[2] not in {"blob", "tree"}:
            return None
        expected_type = "file" if parts[2] == "blob" else "directory"
        return Path(*parts[4:]), expected_type

    if parsed.netloc == "raw.githubusercontent.com" and parts[:2] == REPOSITORY_PREFIX:
        if len(parts) < 4:
            return None
        return Path(*parts[3:]), "file"

    return None


def main() -> int:
    args = parse_args()
    repo = args.repo.expanduser().resolve()
    if not repo.is_dir():
        print(f"Error: Bytes repository was not found at {repo}", file=sys.stderr)
        return 2

    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    checked = 0
    errors: list[str] = []

    for field, url in strings(data):
        parsed = bytes_target(url)
        if parsed is None:
            continue

        relative, expected_type = parsed
        target = (repo / relative).resolve()
        try:
            target.relative_to(repo)
        except ValueError:
            errors.append(f"{field}: path escapes the repository: {url}")
            continue

        checked += 1
        if not target.exists():
            errors.append(f"{field}: missing {relative}: {url}")
        elif expected_type == "file" and not target.is_file():
            errors.append(f"{field}: expected a file at {relative}: {url}")
        elif expected_type == "directory" and not target.is_dir():
            errors.append(f"{field}: expected a directory at {relative}: {url}")

    if errors:
        print(f"Bytes link validation failed ({len(errors)} of {checked} invalid):", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(f"Validated {checked} Bytes repository links against {repo}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
