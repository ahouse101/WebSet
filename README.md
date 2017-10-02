# Shoebox
Shoebox is a photo and video collection manager. It leaves media files in place and stores all information about the library in a single folder. This lets you keep track of your existing media collection via feature tags, person tags, albums, etc. without having to change their position on the filesystem.

### Issues
- File paths that contain URL escape characters (%27 as an example) cause problems.
- Currently, thumbnails generate all at once in one step, launching as many FFmpeg processes as videos with no thumbnail. This can slow the computer to a crawl as potentially hundreds (or more, up to the library size) of processes are launched as fast as possible. Thumbnail generation should be offloaded to a background process (WebWorker), and rate should be controlled (either by combining the thumbnail operations into a single fluent-ffmpeg call, if possible, or by limiting the max number of fluent-ffmpeg calls that can currently be running).

### To-Do
- Add a library's folders to the sidebar.
- Integrate Vuex.
- Fix broken MediaCollection keyboard navigation.
- Add library deletion.
- Fix thumbnail generation/metadata gathering pipeline.
- Add custom video player controls.
- Add second window capability. You should be able to open media in an external window (potentially reusing that window for opening other media, or allowing users to open any number of external media windows).
- Add images as a supported format (JPG, PNG, GIF, etc should be no problem as they're already supported in Chrome).
- Add RAW image support (CR2 at least, likely through some interface to dcraw).
- Add video formats that are supported by <video> as supported formats (currently WebM needs to be added, MP4 is already supported).
- Add collections/albums.
- Add feature tagging (as distinct from person tagging).
- Add person tagging.
- Add view filters (based on resolution/tags/people/creation date, etc).
- Add facial recognition to photos (videos are theoretically possible, but would be much more difficult).
- Add metadata export. All information gathered about library media should be able to be exported.