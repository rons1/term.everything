#!/bin/bash

# This script builds a distributable AppImage
# of the term.everything application using Podman.

PODMAN_ROOT="./.podman"
PODMAN_RUNROOT="./.podman-run"
PODMAN="podman --root $PODMAN_ROOT --runroot $PODMAN_RUNROOT"
if ! command -v podman >/dev/null 2>&1; then
    echo "Warning: podman is not installed or not in PATH. On ubuntu \"sudo apt install podman\". Please install podman to proceed, it's literally all you need. Don't even need attention. Just podman. Just get podman. What are you waiting for? Stop reading this and install podman."
    exit 1
fi
# Create a distributable appimage using podman
$PODMAN build -t term.everything:appimage -f ./resources/ContainerFile .
$PODMAN create --name term-appimg term.everything:appimage
$PODMAN cp term-appimg:/out ./dist
$PODMAN rm term-appimg
$PODMAN rmi -f term.everything:appimage
$PODMAN image prune -f
$PODMAN unmount -a || true
$PODMAN system reset -f || true
chmod -R u+rwX $PODMAN_ROOT || true
rm -rf $PODMAN_ROOT || true
rm -rf $PODMAN_RUNROOT || true
echo ""
echo "Output is in ./dist/out/term.everything!mmulet.AppImage"

chmod +x ./third_party/chafa
./third_party/chafa ./resources/icon.png
