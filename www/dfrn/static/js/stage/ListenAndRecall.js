define(["component/Pages", "component/Sessions"], function (Pages, Sessions) {
  let study;
  let pages;
  let session;
  let preloaded_sessions;
  let current_session;
  let session_id;
  let subtask_start_time;
  let min_recall_duration_s;
  let max_recall_duration_s;
  let timeout_handler_max_recall_duration;
  let timeout_handler_min_recall_duration;
  let timeout_handler_countdown;
  let story_number = 0;
  let state;

  function next_story() {
    console.log("next_story");
    if (story_number >= session.length) {
      study.next();
      return;
    }
    $("#intro").show();
    $("#listen").hide();
    $("#recall").hide();
    $("#recall_done_screen").hide();
    state = "intro";

    $("#story_number").text("Story " + (story_number + 1));

    study.data.record_trialdata({
      story_number: story_number,
      status: "start",
      task: "intro",
    });
    subtask_start_time = new Date().getTime();

    $("#begin_story")
      .off()
      .on("click", () => {
        study.data.record_trialdata({
          story_number: story_number,
          status: "end",
          task: "intro",
          duration_ms: new Date().getTime() - subtask_start_time,
        });
        start_listen();
      });
  }

  function start_listen() {
    $("#intro").hide();
    $("#listen").show();
    $("#recall").hide();
    $("#recall_done_screen").hide();
    state = "listen";

    current_session = preloaded_sessions[story_number];

    study.data.record_trialdata({
      status: "start",
      task: "listen",
      story_number: story_number,
      audio_url: current_session.audio_url,
      story_name: current_session.story_name,
      story_duration_s: current_session.story_duration_s,
    });
    subtask_start_time = new Date().getTime();

    current_session.audio_element.addEventListener("ended", () => {
      study.data.record_trialdata({
        status: "end",
        task: "listen",
        duration_ms: new Date().getTime() - subtask_start_time,
        story_number: story_number,
        audio_url: current_session.audio_url,
        story_name: current_session.story_name,
        story_duration_s: current_session.story_duration_s,
      });
      start_recall();
    });

    current_session.audio_element.play();
  }

  function start_recall() {
    $("#intro").hide();
    $("#listen").hide();
    $("#recall_done_screen").hide();

    $("#mic_icon").hide();
    $("#countdown").show();
    $("#countdown").text("");
    countdown_time = 4000;
    $("#recall").show();
    state = "recall";

    min_recall_duration_s = current_session.story_duration_s * 0.5;
    max_recall_duration_s = current_session.story_duration_s * 1.5;

    study.data.record_trialdata({
      status: "start",
      task: "recall_screen",
      story_number: story_number,
      story_name: current_session.story_name,
    });
    subtask_start_time = new Date().getTime();

    function countdown() {
      countdown_time -= 1000;
      console.debug(countdown_time);
      $("#countdown").text(countdown_time / 1000);
      if (countdown_time >= 0) {
        timeout_handler_countdown = setTimeout(countdown, 1000);
      } else {
        $("#countdown").hide();
        study.data.record_trialdata({
          status: "end",
          task: "recall_screen",
          story_number: story_number,
          story_name: current_session.story_name,
        });
        start_recording();
      }
    }

    function start_recording() {
      clearTimeout(timeout_handler_countdown);
      $("#mic_icon").show();
      study.data.record_trialdata({
        status: "start",
        task: "recall",
        story_number: story_number,
        story_name: current_session.story_name,
        min_recall_duration_s: min_recall_duration_s,
        max_recall_duration_s: max_recall_duration_s,
      });

      // bind the finish button early to allow for skipping
      $("#button_recall_done")
        .off()
        .on("click", () => {
          finish_recording();
        });

      // show done button after min recall duration
      timeout_handler_min_recall_duration = setTimeout(() => {
        $("#recall_done_screen").show();
      }, min_recall_duration_s * 1000);

      // stop recording after max recall duration
      timeout_handler_max_recall_duration = setTimeout(() => {
        $("#button_recall_done").click();
      }, max_recall_duration_s * 1000);
    }

    function finish_recording() {
      clearTimeout(timeout_handler_min_recall_duration);
      clearTimeout(timeout_handler_max_recall_duration);
      study.data.record_trialdata({
        status: "end",
        task: "recall",
        duration_ms: new Date().getTime() - subtask_start_time,
        story_number: story_number,
        story_name: current_session.story_name,
        min_recall_duration_s: min_recall_duration_s,
        max_recall_duration_s: max_recall_duration_s,
      });
      start_recall_done();
    }

    setTimeout(countdown, 2000);
  }

  function start_recall_done() {
    $("#countdown").hide();
    $("#mic_icon").hide();
    $("#recall").hide();
    $("#recall_done_screen").show();
    $("#recall_done_story_number").text(
      "You are done with story " + (story_number + 1)
    );
    state = "recall_done_screen";
    study.data.record_trialdata({
      status: "start",
      task: "recall_done_screen",
      story_number: story_number,
      story_name: current_session.story_name,
    });
    subtask_start_time = new Date().getTime();

    $("#next_story")
      .off()
      .on("click", () => {
        study.data.record_trialdata({
          status: "end",
          task: "recall_done_screen",
          duration_ms: new Date().getTime() - subtask_start_time,
          story_number: story_number,
          story_name: current_session.story_name,
        });
        story_number += 1;
        next_story();
      });

    state = "recall_done_screen";
  }

  function skip_to_next() {
    if (state == "intro") {
      start_listen();
    } else if (state == "listen") {
      current_session.audio_element.pause();
      current_session.audio_element.dispatchEvent(new Event("ended"));
    } else if (state == "recall") {
      $("#button_recall_done").click();
    } else if (state == "recall_done_screen") {
      next_story();
    } else {
      console.error("Invalid state: " + state);
    }
  }

  return {
    name: "listen_and_recall",
    init: function (_study) {
      study = _study;
      pages = new Pages();
      session_id = study.data.session_id;

      // preload all audio files
      preloaded_sessions = {};
      session = Sessions[session_id];
      session.forEach(async (session, index) => {
        const audio_url = "audio/" + session.story_name + ".wav";
        const audio_element = new Audio(audio_url);
        audio_element.preload = "auto";
        audio_element.load();

        await new Promise((resolve) => {
          audio_element.addEventListener("loadedmetadata", () => {
            resolve();
          });
          // Also handle case where metadata is already loaded
          if (audio_element.readyState >= 1) {
            resolve();
          }
        });

        preloaded_sessions[index] = {
          audio_url: audio_url,
          audio_element: audio_element,
          story_name: session.story_name,
          story_duration_s: audio_element.duration,
        };
      });

      return pages.init(study, ["listen_and_recall/task.html"]);
    },
    show: function () {
      pages.next();
      next_story();
    },
    finish_task: function (skip) {
      if (skip) {
        skip_to_next();
      } else {
        study.next();
      }
    },
  };
});
