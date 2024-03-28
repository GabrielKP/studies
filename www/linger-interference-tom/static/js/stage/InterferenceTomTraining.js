define(["component/Pages", "component/InterferenceTom"], function (
  Pages,
  InterferencePause
) {
  let study;
  let instruct_pages;
  let task_pages;
  let task;
  let iteration;

  function _init_start_task(
    passage_indices,
    time_passage,
    time_question,
    time_isi
  ) {
    task_pages.reset();
    task = new InterferencePause();
    task.init(
      study,
      task_pages,
      function (time_unpressed) {
        _conditional_next(time_unpressed);
      },
      passage_indices,
      time_passage,
      time_question,
      time_isi,
      iteration
    );
    task.start_task();
  }

  function _conditional_next(time_unpressed) {
    if (step == "5s") {
      if (time_unpressed >= 1000) {
        iteration += 1;
        try_again_5s_pages.next();
      } else {
        instruct_30s_pages.next();
      }
    } else {
      if (time_unpressed >= 1500) {
        iteration += 1;
        try_again_30s_pages.next();
      } else {
        final_pages.next();
      }
    }
  }

  return {
    name: "interference_tom_training",
    init: function (_study) {
      study = _study;
      instruct_pages = new Pages();
      task_pages = new Pages();
      // try_again_5s_pages = new Pages();
      // try_again_30s_pages = new Pages();
      // instruct_30s_pages = new Pages();
      final_pages = new Pages();
      iteration = 0;
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
            _init_start_task(
              study.config["interference_tom_training_passage_indices"],
              study.config["interference_tom_time_passage"],
              study.config["interference_tom_time_question"],
              study.config["interference_tom_time_isi"]
            );
          }
        ),
        task_pages.init(study, "interference_tom_training/task.html"),
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
      _init_start_task(
        study.config["interference_tom_passage_indices"],
        study.config["interference_tom_time_passage"],
        study.config["interference_tom_time_question"],
        study.config["interference_tom_time_isi"]
      );
    },
    finish_task: function () {
      task.finish_task();
    },
  };
});
