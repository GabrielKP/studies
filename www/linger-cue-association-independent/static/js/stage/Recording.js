define(
  ["component/Pages", "component/ScreenRecorder"],
  function (Pages, ScreenRecorder) {
    let study;
    let pages;

    return {
      name: "recording",

      init: function (_study) {
        study = _study;

        ScreenRecorder.init(study);

        pages = new Pages();

        return pages.init(
          study,
          [
            "recording/instruct-1.html",
            "recording/instruct-2.html",
            "recording/instruct-3.html",
          ],
          function () {
            study.next();
          }
        );
      },

      show: function () {
        pages.next();

        /*
         * Delegated event handler because instruct-3.html
         * does not exist in the DOM yet when show() runs.
         */
        $(document)
          .off(
            "click.screenRecordingStart",
            "#start-recording"
          )
          .on(
            "click.screenRecordingStart",
            "#start-recording",
            async function () {
              const button = $("#start-recording");
              const status = $("#recording-status");

              button.prop("disabled", true);
              status
                .removeClass("text-danger text-success")
                .text(
                  "Waiting for you to select the experiment tab..."
                );

              try {
                const settings =
                  await ScreenRecorder.start();

                study.data.record_trialdata({
                  recording_agree: true,
                  recording_started: true,
                  display_surface:
                    settings.displaySurface || null,
                });

                status
                  .addClass("text-success")
                  .text("Screen recording started.");

                $(document).off(
                  "click.screenRecordingStart",
                  "#start-recording"
                );

                // This is the last page, so this ends the
                // Recording stage and advances the study.
                pages.next();
              } catch (err) {
                console.error(err);

                study.data.record_eventdata(
                  "screen_recording_start_error",
                  {
                    error: String(err),
                  }
                );

                status
                  .addClass("text-danger")
                  .text(
                    "Screen recording did not start. " +
                    "Please try again and select this experiment tab."
                  );

                button.prop("disabled", false);
              }
            }
          );
      },
    };
  }
);