
# Install and run

To build just install podman
- [podman https://podman.io/docs/installation](https://podman.io/docs/installation) On ubuntu just use`sudo apt install podman`


# Deps:

- [Bun https://bun.sh/docs/installation] (https://bun.sh/docs/installation) Install globally by following the instructions on the bun website.
- [meson https://mesonbuild.com/Getting-meson.html (but I don't recommend getting it from here)] (https://mesonbuild.com/Getting-meson.html) for building the cpp code. Make sure meson is on path, I recommend using the [uv python package manager https://docs.astral.sh/uv/getting-started/installation/](https://docs.astral.sh/uv/getting-started/installation/) then install meson with `uv tool install meson`
- [Taskfile https://taskfile.dev/installation/](https://taskfile.dev/installation/) Installed by npm, or install globally for building and running the project, If you want to install globally and used uv in the last step, you can install it with ` uv tool install go-task-bin`
- [ninja https://github.com/ninja-build/ninja/releases] (https://github.com/ninja-build/ninja/releases) as a build system used by meson
- Pkg-config, gcc, and cmake with `sudo apt install pkg-config build-essential cmake` on ubuntu
- [chafa](https://github.com/hpjansson/chafa) for terminal graphics, on ubuntu: `sudo apt install glib-2.0 chafa libchafa-dev`
- Optional: [vscode](https://code.visualstudio.com/) with these recommended extensions:
    - "mesonbuild.mesonbuild",
    - "ms-vscode.cpptools-extension-pack",
    - "oven.bun-vscode",
    - "esbenp.prettier-vscode",
    - "slevesque.shader",
    - "task.vscode-task",
    - "redhat.vscode-yaml"

### Version map
These are the versions of the tools used to build and run the project:
- Bun 1.2.21
- Taskfile v3.44.1
- Meson 1.9.0
- pkg-cofig 1.8.1
- gcc 13.3.0
- cmake 3.28.3
- chafa 1.14.0
- see third_party/Readme.md for the versions of the bundled dependencies


# Running and building

This project uses [task](https://taskfile.dev/) to manage tasks,
this will be installed locally by npm, so you can also use the
local version like this:
```bash
npm run task build
```
or 
```bash
npx task build
```
or if you have task installed globally, you can just use:
```bash
task build
```

The rest of the guide assumes you have task installed globally, but
you can always use the local version as described above.



Just run `task run` or even just `task` to build and run the project.

```bash
task
```

# Development

use `task --list` to list all available tasks

There are a lot of build setup and other files cluttering the root directory.
Use the task

```bash
task hide-etc
```

to hide all files except source code.

likewise use

```bash
task show-etc
```

to show all files again.

- `task make-source NAME=<source_name>` to create a new cpp file and add it the meson.build file


## Notes

Runs best on kitty terminal, but best when running kitty in x11 mode, not wayland.
On wayland the cpu usage skyrockets. I believe it is because of Nvidia driver
support with wayland.


## Distributing

Note that on 22.04 you may have to 
`sudo apt install libfuse2` 
and in ubuntu 24.04 `sudo apt install libfuse2t64`

You can create the app image with
```sh
task publish
```
It sometimes fails for no reason (:, so just run it again.

If you are just building for your own computers you can stop there.

Otherwise, continue on this journey with me.

The thing with AppImage is that compatibility is tied to build base, so if 
you build in ubuntu 24.04, the appimage may fail on ubuntu 22.04. So, let's 
use `podman` to build the AppImage. We will build an ubuntu 22.04 image because
it is the oldest current supported version at the time of writing ('25).

## Requirements
- [podman https://podman.io/docs/installation](https://podman.io/docs/installation) I just use `sudo apt install podman`


1. ```sh
podman pull ubuntu:22.04
