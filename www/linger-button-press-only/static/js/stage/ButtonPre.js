define(["component/Pages", "component/ButtonPress"], function (
  Pages,
  ButtonPress
) {
  let study;
  let instruct_pages;
  let button_press;

  return {
    name: "pre_button_thinking",

    init: function (_study) {
      study = _study;
      mode = "instructions";
      instruct_pages = new Pages();
      button_press = new ButtonPress();

      // load the two HTML files in order
      return Promise.all([
        instruct_pages.init(
          study,
          [
            "food_button/instruct-1.html",
            "food_button/instruct-2.html",
            "food_button/instruct-3.html",
          ],
          function () {
            mode = "task";
            button_press.start_task();
          }
        ),
        button_press.init(
          study,
          "food_button/task.html",
          function () {
            study.next();
          },
          study.config.time_limit_pre
        ),
      ]);
    },

    show: function () {
      instruct_pages.next(); // show instruction
    },

    finish_task: function () {
      if (mode == "task") {
        button_press.finish_task();
      } else {
        study.next();
      }
    },
  };
});
