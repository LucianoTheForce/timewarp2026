# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a minimal repository containing 3D assets for a project called "palco timewarp". The repository currently contains:

- `assets/1.glb` - A 3D model file (approximately 60MB)

## Project Structure

```
.
├── assets/
│   └── 1.glb    # Main 3D model asset
└── CLAUDE.md    # This file
```

## Working with GLB Files

The main asset is a GLB (GL Transmission Format Binary) file, which is a binary format for 3D scenes and models. GLB files are commonly used in web applications with Three.js, Babylon.js, or other WebGL frameworks.

## Development Notes

Since this repository currently only contains a 3D asset:

- No build system is configured
- No package management is in place
- No testing framework is present
- The repository is not initialized as a Git repository

When adding code to work with the 3D model, common patterns include:
- Web applications using Three.js for GLB loading and rendering
- Game engines that support GLB import
- 3D modeling pipelines that process GLB files

## Future Development

If this becomes a web project, typical additions might include:
- `package.json` for dependency management
- Web framework setup (React, Vue, vanilla JS)
- 3D rendering library integration
- Build tooling for bundling and optimization