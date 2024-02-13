define(["component/Pages"], function (Pages) {
  let study;
  let instruct_pages;
  let task;

  class InterferencePause {
    current_pause_time;
    total_pause_time;
    mode;
    pages;
    pagenames;
    finish_func;
    study;
    task_start_time;

    constructor() {
      // bind all the functions
      this.keydown_handler = this.keydown_handler.bind(this);
      this.keyup_handler = this.keyup_handler.bind(this);
      this.timer_fnc = this.timer_fnc.bind(this);
      this.finish_task = this.finish_task.bind(this);
      this.start_task = this.start_task.bind(this);
    }

    init(study, pagename, finish_func, pause_time) {
      this.study = study;
      this.pages = new Pages();
      this.finish_func = finish_func;
      this.pagenames = [pagename];
      this.total_pause_time = pause_time;
      this.current_pause_time = pause_time;
      return this.pages.init(this.study, this.pagenames);
    }

    finish_task() {
      this.study.data.record_trialdata({
        task: "interference_pause",
        time_unpressed: 10,
      });
      this.study.data.record_trialdata({
        status: "task_end",
        task: "interference_pause",
        task_time: new Date().getTime() - this.task_start_time,
      });
      $("body").unbind("keydown", this.response_handler);
      this.finish_func();
    }

    keydown_handler(key) {
      if (key.keyCode == 32) {
        key.preventDefault();
        // show blue circle
        $("#spacebar-feedback").css("opacity", 1);
        $("#spacebar-warning").css("opacity", 0);
        // TODO! track time
      }
    }

    keyup_handler(key) {
      if (key.keyCode == 32) {
        key.preventDefault();
        // hide blue circle
        $("#spacebar-feedback").css("opacity", 0);
        $("#spacebar-warning").css("opacity", 1);
        // track time
      }
    }

    timer_fnc() {
      if (this.current_pause_time == 0) {
        this.finish_task();
      } else {
        this.current_pause_time--;
        $("#timer").html(this.current_pause_time);
        setTimeout(() => {
          this.timer_fnc();
        }, 1000);
      }
    }

    start_task() {
      this.pages.next();

      // beginning of pause
      this.study.data.record_trialdata({
        status: "task_begin",
        task: "interfence_pause",
      });
      this.task_start_time = new Date().getTime();

      // Draw circle
      let canvas = document.getElementById("canvas-circle");
      let ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.arc(50, 30, 20, 0, 2 * Math.PI);
      ctx.fillStyle = "green";
      ctx.fill();

      // register event listener
      $("body").focus().keydown(this.keydown_handler);
      $("body").focus().keyup(this.keyup_handler);

      $("#timer").html(this.current_pause_time);
      // Timer for FA
      setTimeout(() => {
        this.timer_fnc();
      }, 1000);
    }
  }

  return {
    name: "interference_pause",
    init: function (_study) {
      study = _study;
      instruct_pages = new Pages();
      task = new InterferencePause();
      return Promise.all([
        instruct_pages.init(
          study,
          "interference_pause/instruct-1.html",
          function () {
            task.start_task();
          }
        ),
        task.init(
          study,
          "interference_pause/task.html",
          function () {
            study.next();
          },
          study.config["interference_pause_time"]
        ),
      ]);
    },
    show: function () {
      // show instructions first
      instruct_pages.next();
    },
    finish_task: function () {
      task.finish_task();
    },
  };
});
