## lazycopy
This is a simple CLI utility for copying all files from one directory to another. Allows for overwriting files in src directory if they already exist.

### Motivation
I'm super lazy and I have a huge music library. Rather than manually copying files to my NAS when I want to backup my latest music collection changes, I wrote a simple utility to automate this for me so I can leave it running in the background. This utility will also maintain the relative file tree structure when copying files.

## CLI Arguments
- `--from` - `{string}` - Folder path with files you want to copy
- `--to` - `{string}` - Folder destination where you want all of the files to go. Folder will be created if it doesn't already exist. All nested file tree paths will be created inside of this folder to mirror the `--from` path.
- `--overwrite` - `{optional}` - Override files in the `--to` path if they already exist. Leave them alone if otherwise.
