define(["component/Pages", "component/InterferenceGeometry"], function (
  Pages,
  InterferencePause
) {
  let study;
  let instruct_pages;
  let task_pages;
  let task;
  let iteration;
  let max_iterations;
  let mode;

  function _init_start_task() {
    mode = "task";
    task_pages.reset();
    task = new InterferencePause();
    task.init(
      study,
      task_pages,
      (answered_question, correct_answer) => {
        _conditional_next(answered_question, correct_answer);
      },
      study.config["interference_geometry_training_image_indices"],
      study.config["interference_geometry_time_image"],
      study.config["interference_geometry_time_question"],
      study.config["interference_geometry_time_pause"],
      iteration
    );
    task.start_task();
  }

  function _conditional_next(correct, correct_answer) {
    iteration += 1;
    if (iteration >= max_iterations) {
      // TODO: study failed.
      final_pages.reset();
      final_pages.next();
    } else if (
      iteration < study.config["interference_geometry_min_training_sessions"] ||
      !correct
    ) {
      if (!correct) {
        try_again_failed.reset();
        try_again_failed.next();
        $("#correct_answer").html(
          "The correct answer is " + correct_answer + "."
        );
      } else {
        try_again_neutral.reset();
        try_again_neutral.next();
      }
    } else {
      mode = "finish";
      final_pages.reset();
      final_pages.next();
      // option to practice again
      $("#practice-again").on("click", () => {
        _init_start_task();
      });
      $("#practice-again").show();
    }
  }

  return {
    name: "interference_geometry_training",
    init: function (_study) {
      study = _study;
      instruct_pages = new Pages();
      task_pages = new Pages();
      try_again_neutral = new Pages();
      try_again_failed = new Pages();
      final_pages = new Pages();
      iteration = 0;
      max_iterations =
        study.config["interference_geometry_training_image_indices"].length;
      mode = "init";
      return Promise.all([
        instruct_pages.init(
          study,
          [
            "interference_geometry_training/instruct-1.html",
            "interference_geometry_training/instruct-2.html",
            "interference_geometry_training/instruct-3.html",
            "interference_geometry_training/instruct-4.html",
          ],
          () => {
            _init_start_task();
          }
        ),
        task_pages.init(study, "interference_geometry_training/task.html"),
        try_again_failed.init(
          study,
          "interference_geometry_training/instruct-try_again_failed.html",
          () => {
            _init_start_task();
          }
        ),
        try_again_neutral.init(
          study,
          "interference_geometry_training/instruct-try_again_neutral.html",
          () => {
            _init_start_task();
          }
        ),
        final_pages.init(
          study,
          "interference_geometry_training/instruct-final.html",
          function () {
            study.next();
          }
        ),
      ]);
    },
    show: function () {
      // show instructions first
      mode = "instructions";
      instruct_pages.next();
    },
    finish_task: function (skip = false) {
      if (mode == "instructions") {
        _init_start_task();
      } else {
        task.finish_task(skip);
        study.next();
      }
    },
  };
});
