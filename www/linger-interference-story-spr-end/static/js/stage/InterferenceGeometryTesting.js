define(["component/Pages", "component/InterferenceGeometry"], function (
  Pages,
  InterferenceGeometry
) {
  let study;
  let task_pages;
  let task;

  function _init_start_task(iteration) {
    task_pages.reset();
    task = new InterferenceGeometry();
    task.init(
      study,
      task_pages,
      () => {
        _conditional_next();
      },
      image_indices[iteration],
      study.config["interference_geometry_time_image"],
      study.config["interference_geometry_time_question"],
      study.config["interference_geometry_time_pause"],
      iteration
    );
    task.start_task();
  }

  function _conditional_next() {
    if (iteration < image_indices.length) {
      _init_start_task(iteration);
      iteration++;
    } else {
      study.next();
    }
  }

  return {
    name: "interference_geometry_testing",
    init: function (_study) {
      study = _study;
      task_pages = new Pages();
      iteration = 0;
      image_indices =
        study.config["interference_geometry_testing_image_indices"];
      return Promise.all([
        task_pages.init(study, "interference_geometry_testing/task.html"),
      ]);
    },
    show: function () {
      if (study.config["condition"] != "continued-geometry") {
        study.next();
      } else {
        _conditional_next();
      }
    },
    finish_task: function (skip = false) {
      task.finish_task(skip);
      study.next();
    },
  };
});
