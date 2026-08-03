#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "Pillow>=11.0,<13",
# ]
# ///

"""Generate optimized WebP thumbnails for project and museum images."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSETS_DIR = ROOT / "assets"
STATIC_DIR = ROOT / "static"


@dataclass(frozen=True)
class Collection:
    name: str
    output_dir: Path
    size: tuple[int, int]
    crop: bool
    data_file: Path | None = None
    image_field: str = "image"
    nested_field: str | None = None
    sources: tuple[str, ...] = ()


COLLECTIONS = (
    Collection(
        name="projects",
        output_dir=STATIC_DIR / "img/thumbnails/projects",
        size=(720, 405),
        crop=True,
        data_file=ROOT / "data/projects.json",
    ),
    Collection(
        name="models",
        output_dir=STATIC_DIR / "img/thumbnails/models",
        size=(720, 405),
        crop=False,
        data_file=ROOT / "data/bytes.json",
        image_field="poster",
        nested_field="model",
    ),
    Collection(
        name="museum",
        output_dir=STATIC_DIR / "img/thumbnails/museum",
        size=(640, 480),
        crop=False,
        data_file=ROOT / "data/museum.json",
    ),
    Collection(
        name="about",
        output_dir=STATIC_DIR / "img/thumbnails/about",
        size=(900, 572),
        crop=False,
        sources=("img/about/cave.png",),
    ),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="validate generated images without modifying files",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="regenerate images even when outputs are current",
    )
    return parser.parse_args()


def load_records(collection: Collection) -> list[dict[str, object]]:
    if collection.sources:
        return [{collection.image_field: source} for source in collection.sources]
    if collection.data_file is None:
        raise ValueError(f"{collection.name} requires a data file or source images")
    with collection.data_file.open(encoding="utf-8") as data_handle:
        records = json.load(data_handle)
    if not isinstance(records, list):
        raise ValueError(f"{collection.data_file} must contain a top-level array")
    if collection.nested_field is not None:
        nested_records = []
        for record in records:
            nested = record.get(collection.nested_field)
            if nested is None:
                continue
            if not isinstance(nested, dict):
                raise ValueError(
                    f"{collection.data_file}: {collection.nested_field} must be an object"
                )
            nested_records.append(nested)
        return nested_records
    return records


def source_path(image: str) -> Path:
    source = (ASSETS_DIR / image.lstrip("/")).resolve()
    if not source.is_relative_to(ASSETS_DIR.resolve()):
        raise ValueError(f"image path escapes assets directory: {image}")
    return source


def output_path(collection: Collection, source: Path) -> Path:
    return collection.output_dir / f"{source.stem}.webp"


def expected_size(collection: Collection, source: Path) -> tuple[int, int]:
    if collection.crop:
        return collection.size
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail(collection.size, Image.Resampling.LANCZOS)
        return image.size


def validate_output(collection: Collection, source: Path, output: Path) -> list[str]:
    errors: list[str] = []
    if not output.exists():
        return [f"missing optimized image: {output.relative_to(ROOT)}"]
    if output.stat().st_mtime < source.stat().st_mtime:
        errors.append(f"stale optimized image: {output.relative_to(ROOT)}")
    try:
        with Image.open(output) as image:
            if image.format != "WEBP":
                errors.append(f"not WebP: {output.relative_to(ROOT)}")
            wanted_size = expected_size(collection, source)
            if image.size != wanted_size:
                errors.append(
                    f"wrong dimensions for {output.relative_to(ROOT)}: "
                    f"{image.size[0]}x{image.size[1]} (expected {wanted_size[0]}x{wanted_size[1]})"
                )
    except OSError as error:
        errors.append(f"invalid image {output.relative_to(ROOT)}: {error}")
    return errors


def image_focus(record: dict[str, object]) -> tuple[float, float]:
    value = record.get("imageFocus", (0.5, 0.5))
    if (
        not isinstance(value, (list, tuple))
        or len(value) != 2
        or not all(isinstance(position, (int, float)) for position in value)
        or not all(0 <= position <= 1 for position in value)
    ):
        raise ValueError(f"imageFocus must contain two numbers from 0 to 1: {value!r}")
    return float(value[0]), float(value[1])


def optimize(
    collection: Collection,
    source: Path,
    output: Path,
    focus: tuple[float, float],
) -> None:
    collection.output_dir.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        if collection.crop:
            image = ImageOps.fit(
                image,
                collection.size,
                Image.Resampling.LANCZOS,
                centering=focus,
            )
        else:
            image.thumbnail(collection.size, Image.Resampling.LANCZOS)
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        temporary = output.with_suffix(".tmp")
        image.save(temporary, format="WEBP", quality=82, method=6)
        temporary.replace(output)


def main() -> int:
    args = parse_args()
    failures: list[str] = []
    processed = 0
    pruned = 0
    skipped = 0
    seen_outputs: set[Path] = set()

    for collection in COLLECTIONS:
        failure_count = len(failures)
        collection_outputs: set[Path] = set()
        try:
            records = load_records(collection)
        except (OSError, ValueError, json.JSONDecodeError) as error:
            failures.append(str(error))
            continue

        for record in records:
            image_value = record.get(collection.image_field)
            if image_value is None:
                continue
            if not isinstance(image_value, str) or not image_value:
                failures.append(
                    f"invalid {collection.image_field} field in "
                    f"{collection.data_file or collection.name}: {image_value!r}"
                )
                continue

            try:
                source = source_path(image_value)
            except ValueError as error:
                failures.append(str(error))
                continue
            output = output_path(collection, source)
            collection_outputs.add(output)

            if output in seen_outputs:
                failures.append(f"duplicate optimized output: {output.relative_to(ROOT)}")
                continue
            seen_outputs.add(output)

            if not source.is_file():
                failures.append(f"missing source image: {source.relative_to(ROOT)}")
                continue

            try:
                focus = image_focus(record)
            except ValueError as error:
                failures.append(f"{collection.name}: {error}")
                continue

            if args.check:
                failures.extend(validate_output(collection, source, output))
                continue

            if not args.force and output.exists() and output.stat().st_mtime >= source.stat().st_mtime:
                skipped += 1
                continue

            try:
                optimize(collection, source, output, focus)
                processed += 1
                print(f"optimized {source.relative_to(ROOT)} -> {output.relative_to(ROOT)}")
            except OSError as error:
                failures.append(f"failed to optimize {source.relative_to(ROOT)}: {error}")

        if len(failures) != failure_count or not collection.output_dir.exists():
            continue

        unexpected_outputs = set(collection.output_dir.glob("*.webp")) - collection_outputs
        for output in sorted(unexpected_outputs):
            if args.check:
                failures.append(f"unexpected optimized image: {output.relative_to(ROOT)}")
            else:
                output.unlink()
                pruned += 1
                print(f"removed obsolete {output.relative_to(ROOT)}")

    if failures:
        for failure in failures:
            print(f"error: {failure}", file=sys.stderr)
        return 1

    if args.check:
        print(f"validated {len(seen_outputs)} optimized images")
    else:
        print(
            f"optimized {processed} images; "
            f"removed {pruned} obsolete images; "
            f"skipped {skipped} current images"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
