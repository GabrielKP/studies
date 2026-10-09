define(function () {
    class _ScreenRecorder {
        constructor() {
            this.study = null;

            this.stream = null;
            this.recorder = null;
            this.chunks = [];

            this.intentionalStop = false;
            this.endedEarly = false;

            this.uploaded = false;
            this.uploadResult = null;

            this.startedAt = null;
        }

        init(study) {
            this.study = study;
        }

        _safeFilenamePart(value) {
            return String(value || "unknown").replace(/[^A-Za-z0-9_-]/g, "_");
        }

        _getSupportedMimeType() {
            const mimeTypes = [
                "video/mp4;codecs=avc1",
                "video/mp4",
                "video/webm;codecs=vp9",
                "video/webm;codecs=vp8",
                "video/webm",
            ];

            return mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
        }

        async start() {
            if (!window.isSecureContext) {
                throw new Error(
                    "Screen recording requires HTTPS or localhost."
                );
            }

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getDisplayMedia
            ) {
                throw new Error(
                    "Your browser does not support screen recording."
                );
            }

            if (!window.MediaRecorder) {
                throw new Error(
                    "Your browser does not support MediaRecorder."
                );
            }

            this.intentionalStop = false;
            this.endedEarly = false;
            this.uploaded = false;
            this.uploadResult = null;
            this.chunks = [];

            // IMPORTANT:
            // getDisplayMedia() must happen directly as a consequence
            // of the participant clicking a button.
            this.stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "browser",
                },
                audio: false,

                // These are hints. Browsers are allowed to ignore them.
                preferCurrentTab: true,
                selfBrowserSurface: "include",
                monitorTypeSurfaces: "exclude",
                surfaceSwitching: "exclude",
            });

            const videoTrack = this.stream.getVideoTracks()[0];
            const settings = videoTrack.getSettings
                ? videoTrack.getSettings()
                : {};

            const mimeType = this._getSupportedMimeType();

            const recorderOptions = {
                // Screen is mostly static text, so 800 kbps should be
                // sufficient and keeps a ~30 min recording manageable.
                videoBitsPerSecond: 800000,
            };

            if (mimeType) {
                recorderOptions.mimeType = mimeType;
            }

            this.recorder = new MediaRecorder(
                this.stream,
                recorderOptions
            );

            this.recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.chunks.push(event.data);
                }
            };

            // Participant can also click the browser's own
            // "Stop sharing" button.
            videoTrack.addEventListener("ended", () => {
                if (!this.intentionalStop) {
                    this.endedEarly = true;

                    if (
                        this.recorder &&
                        this.recorder.state !== "inactive"
                    ) {
                        this.recorder.stop();
                    }

                    if (this.study) {
                        this.study.data.record_eventdata(
                            "screen_recording_stopped_early",
                            {
                                recording_time:
                                    Date.now() - this.startedAt,
                            }
                        );
                    }
                }
            });

            this.startedAt = Date.now();

            // Emits chunks every second, but they are still held
            // client-side until upload at the end.
            this.recorder.start(1000);

            this.study.data.record_eventdata(
                "screen_recording_started",
                {
                    displaySurface: settings.displaySurface || null,
                    width: settings.width || null,
                    height: settings.height || null,
                    frameRate: settings.frameRate || null,
                    mimeType: this.recorder.mimeType || null,
                }
            );

            return settings;
        }

        async _stop() {
            if (!this.recorder) {
                throw new Error("Screen recording was never started.");
            }

            this.intentionalStop = true;

            if (this.recorder.state !== "inactive") {
                await new Promise((resolve) => {
                    this.recorder.addEventListener(
                        "stop",
                        resolve,
                        { once: true }
                    );

                    this.recorder.stop();
                });
            }

            if (this.stream) {
                this.stream
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        }

        async stopAndUpload() {
            if (this.uploaded) {
                return this.uploadResult;
            }

            await this._stop();

            if (this.chunks.length === 0) {
                throw new Error("No recording data were captured.");
            }

            const mimeType =
                this.recorder.mimeType || "video/webn";

            const extension = mimeType.startsWith("video/mp4")
                ? "mp4"
                : "webm";

            const blob = new Blob(this.chunks, {
                type: mimeType,
            });

            const params = new URLSearchParams(
                window.location.search
            );

            const prolificPID = this._safeFilenamePart(
                params.get("PROLIFIC_PID")
            );

            const studyID = this._safeFilenamePart(
                params.get("STUDY_ID")
            );

            const filename =
                `${prolificPID}_${studyID}.${extension}`;

            console.log("Uploading recording:", filename);

            const formData = new FormData();

            formData.append(
                "video_data",
                blob,
                filename
            );

            const response = await fetch("video", {
                method: "POST",
                body: formData,
            });

            let result;

            // testing with ?local
            if (this.study.config.local) {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = filename;
                a.click();

                result = {
                    success: true,
                    filename: filename,
                    local: true,
                };
            } else {
                const formData = new FormData();

                formData.append(
                    "video_data",
                    blob,
                    filename
                );

                /*
                 * relative "video", not
                 * "/linger-cue-association-slow/video".
                 *
                 * The uploaded study is mapped to study-name,
                 * so when the page is at /study-name/index.html,
                 * this becomes POST /study-name/video.
                 */
                const response = await fetch("video", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(
                        `Upload returned HTTP ${response.status}`
                    );
                }

                result = await response.json();

                if (!result.success) {
                    throw new Error(
                        result.error || "Video upload failed."
                    );
                }
            }

            this.study.data.record_eventdata(
                "screen_recording_uploaded",
                {
                    filename: result.filename,
                    size_bytes: blob.size,
                    recording_time:
                        Date.now() - this.startedAt,
                    stopped_early: this.endedEarly,
                }
            );

            this.uploaded = true;
            this.uploadResult = {
                ...result,
                size_bytes: blob.size,
                stopped_early: this.endedEarly,
            };

            // Release potentially hundreds of MB.
            this.chunks = [];

            return this.uploadResult;
        }

        stoppedEarly() {
            return this.endedEarly;
        }
    }

    return new _ScreenRecorder();
});