#!/usr/bin/env python
"""Assemble the PNG frames from tools/record-demo.mjs into docs/demo/hero.gif.

Run after `node tools/record-demo.mjs`:

    python tools/build-demo-gif.py

Frames are downscaled to ~900px wide (GitHub renders README images at roughly
850px), quantised against a single shared palette so colours do not shimmer
between frames, and identical consecutive frames are collapsed into one frame
with a longer duration -- that keeps the deliberate holds without paying for
them in bytes.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FRAMES_DIR = ROOT / "tools" / ".demo-frames"
OUT = ROOT / "docs" / "demo" / "hero.gif"

TARGET_WIDTH = 900
FPS = 8
FRAME_MS = int(round(1000 / FPS))
COLORS = 256


def main() -> None:
    paths = sorted(FRAMES_DIR.glob("f*.png"))
    if not paths:
        raise SystemExit(f"no frames in {FRAMES_DIR} -- run tools/record-demo.mjs first")

    frames = []
    for p in paths:
        im = Image.open(p).convert("RGB")
        h = round(im.height * TARGET_WIDTH / im.width)
        frames.append(im.resize((TARGET_WIDTH, h), Image.LANCZOS))

    # One shared palette for the whole GIF, derived from every frame at once
    # (a montage of thumbnails) rather than a single frame -- otherwise colours
    # that only appear in, say, the button's hover glow get banded.
    tw = TARGET_WIDTH // 4
    th = round(frames[0].height * tw / frames[0].width)
    montage = Image.new("RGB", (tw, th * len(frames)))
    for i, f in enumerate(frames):
        montage.paste(f.resize((tw, th), Image.LANCZOS), (0, i * th))
    palette = montage.quantize(colors=COLORS, method=Image.Quantize.MEDIANCUT)

    quantised = [f.quantize(palette=palette, dither=Image.Dither.NONE) for f in frames]

    # Collapse runs of identical frames into one frame held for longer.
    out_frames, durations = [], []
    for q in quantised:
        data = q.tobytes()
        if out_frames and data == out_frames[-1].tobytes():
            durations[-1] += FRAME_MS
        else:
            out_frames.append(q)
            durations.append(FRAME_MS)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    out_frames[0].save(
        OUT,
        save_all=True,
        append_images=out_frames[1:],
        duration=durations,
        loop=0,
        optimize=True,
        disposal=1,
    )

    size = OUT.stat().st_size
    print(
        f"{OUT.relative_to(ROOT)}  {out_frames[0].width}x{out_frames[0].height}  "
        f"{len(out_frames)} frames (from {len(paths)})  "
        f"{sum(durations) / 1000:.1f}s  {size / 1_048_576:.2f} MB"
    )


if __name__ == "__main__":
    main()
