from app.services.media_persist import (
    ALLOWED_MEDIA_EXTENSIONS,
    MAX_FILE_SIZE,
    MAX_VIDEO_FILE_SIZE,
    VIDEO_EXTENSIONS,
    max_upload_size_for_extension,
    media_extension,
)


def test_video_extensions_are_supported():
    assert {".mp4", ".webm", ".ogg", ".mov", ".m4v"} <= VIDEO_EXTENSIONS
    assert VIDEO_EXTENSIONS <= ALLOWED_MEDIA_EXTENSIONS
    assert media_extension("Project Walkthrough.MP4") == ".mp4"


def test_unsupported_extensions_are_not_normalized():
    assert media_extension("payload.exe") == ""
    assert media_extension("video") == ""


def test_video_uses_larger_upload_limit():
    assert max_upload_size_for_extension(".mp4") == MAX_VIDEO_FILE_SIZE
    assert max_upload_size_for_extension(".mov") == MAX_VIDEO_FILE_SIZE
    assert MAX_VIDEO_FILE_SIZE == 100 * 1024 * 1024


def test_non_video_uses_standard_upload_limit():
    assert max_upload_size_for_extension(".jpg") == MAX_FILE_SIZE
    assert max_upload_size_for_extension(".pdf") == MAX_FILE_SIZE
    assert MAX_FILE_SIZE == 10 * 1024 * 1024
