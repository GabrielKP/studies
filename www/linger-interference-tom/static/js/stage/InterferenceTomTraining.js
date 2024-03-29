define(["component/Pages", "component/InterferenceTom"], function (
  Pages,
  InterferencePause
) {
  let study;
  let instruct_pages;
  let task_pages;
  let task;
  let iteration;
  let max_iterations;

  function _init_start_task() {
    task_pages.reset();
    task = new InterferencePause();
    task.init(
      study,
      task_pages,
      function (failed_question, failed_passage) {
        _conditional_next(failed_question, failed_passage);
      },
      study.config["interference_tom_passage_indices"],
      study.config["interference_tom_time_passage"],
      study.config["interference_tom_time_question"],
      study.config["interference_tom_time_isi"],
      iteration
    );
    task.start_task();
  }

  function _conditional_next(answered_question, answered_passage) {
    iteration += 1;
    if (
      iteration == max_iterations &&
      !(answered_question && answered_passage)
    ) {
      // TODO: study failed.
      final_pages.reset();
      final_pages.next();
    } else if (iteration < 2 || !answered_question || !answered_passage) {
      if (!answered_question) {
        try_again_failed_question.reset();
        try_again_failed_question.next();
      } else if (!answered_passage) {
        try_again_failed_passage.reset();
        try_again_failed_passage.next();
      } else {
        try_again_neutral.reset();
        try_again_neutral.next();
      }
    } else {
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
    name: "interference_tom_training",
    init: function (_study) {
      study = _study;
      instruct_pages = new Pages();
      task_pages = new Pages();
      try_again_neutral = new Pages();
      try_again_failed_passage = new Pages();
      try_again_failed_question = new Pages();
      final_pages = new Pages();
      iteration = 0;
      max_iterations =
        study.config["interference_tom_passage_indices"].length / 2;
      return Promise.all([
        instruct_pages.init(
          study,
          [
            "interference_tom_training/instruct-1.html",
            "interference_tom_training/instruct-2.html",
            "interference_tom_training/instruct-3.html",
            "interference_tom_training/instruct-4.html",
          ],
          () => {
            _init_start_task();
          }
        ),
        task_pages.init(study, "interference_tom_training/task.html"),
        try_again_failed_question.init(
          study,
          "interference_tom_training/instruct-try_again_failed_question.html",
          () => {
            _init_start_task();
          }
        ),
        try_again_failed_passage.init(
          study,
          "interference_tom_training/instruct-try_again_failed_passage.html",
          () => {
            _init_start_task();
          }
        ),
        try_again_neutral.init(
          study,
          "interference_tom_training/instruct-try_again_neutral.html",
          () => {
            _init_start_task();
          }
        ),
        final_pages.init(
          study,
          "interference_tom_training/instruct-final.html",
          function () {
            study.next();
          }
        ),
      ]);
    },
    show: function () {
      // show instructions first
      // instruct_pages.next();
      _init_start_task();
    },
    finish_task: function () {
      task.finish_task();
    },
  };
});
