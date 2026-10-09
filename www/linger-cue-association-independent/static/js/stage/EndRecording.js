define(
  ["component/Pages", "component/ScreenRecorder"],
  function (Pages, ScreenRecorder) {
    let study;
    let pages;

    return {
      name: "end_recording",

      init: function (_study) {
        study = _study;

        ScreenRecorder.init(study);

        pages = new Pages();

        return pages.init(
          study,
          ["end_recording/instruct-1.html"],
          function () {
            study.next();
          }
        );
      },

      show: function () {
        // Disable fullscreen enforcement.
        if (study.config["enforce_fullscreen"]) {
          document.documentElement.removeEventListener(
            "fullscreenchange",
            study.fullscreen_enforcer
          );
        }

        if (document.fullscreenElement) {
          document.exitFullscreen();
        }

        pages.next();

        $(document)
          .off(
            "click.screenRecordingStop",
            "#stop-recording"
          )
          .on(
            "click.screenRecordingStop",
            "#stop-recording",
            async function () {
              const button = $("#stop-recording");
              const status = $("#upload-status");

              button.prop("disabled", true);

              status
                .removeClass("text-danger text-success")
                .text(
                  "Stopping and uploading your screen recording. Please keep this tab open..."
                );

              try {
                const result =
                  await ScreenRecorder.stopAndUpload();

                study.data.record_trialdata({
                  recording_uploaded: true,
                  recording_filename:
                    result.filename,
                  recording_size_bytes:
                    result.size_bytes,
                  recording_stopped_early:
                    result.stopped_early,
                });

                status
                  .addClass("text-success")
                  .text(
                    "Screen recording uploaded successfully."
                  );

                $(document).off(
                  "click.screenRecordingStop",
                  "#stop-recording"
                );

                // Advance to Complete only after upload succeeds.
                pages.next();
              } catch (err) {
                console.error(err);

                study.data.record_eventdata(
                  "screen_recording_upload_error",
                  {
                    error: String(err),
                  }
                );

                status
                  .addClass("text-danger")
                  .text(
                    "The recording could not be uploaded. Please click the button to try again."
                  );

                button
                  .text("RETRY UPLOAD")
                  .prop("disabled", false);
              }
            }
          );
      },
    };
  }
);