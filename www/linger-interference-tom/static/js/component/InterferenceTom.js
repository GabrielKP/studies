define(["component/TomPassages", "component/TomQuestions"], function (
  TomPassages,
  TomQuestions
) {
  class _InterferenceTom {
    total_pause_time;
    mode;
    pages;
    pagenames;
    passage_indices;
    finish_func;
    study;
    task_start_time;
    initial_press;
    iteration;
    time_passage;
    time_question;
    time_isi;

    constructor() {
      // bind all the functions
      this.keydown_handler = this.keydown_handler.bind(this);
      this.keyup_handler = this.keyup_handler.bind(this);
      this.switch_mode = this.switch_mode.bind(this);
      this.finish_task = this.finish_task.bind(this);
      this.start_task = this.start_task.bind(this);
    }

    init(
      study,
      page_object,
      finish_func,
      passage_indices,
      time_passage,
      time_question,
      time_isi,
      iteration = 0
    ) {
      this.study = study;
      this.pages = page_object;
      this.finish_func = finish_func;
      this.passage_indices = passage_indices;
      this.current_time = 0;
      this.iteration = iteration;
      this.initial_press = true;
      this.time_passage = time_passage;
      this.time_question = time_question;
      this.time_isi = time_isi;
      this.tom_passages = TomPassages;
      this.tom_questions = TomQuestions;
      this.mode = "init"; // init | text1 | question1 | isi | text2 | question2
    }

    finish_task() {
      // unbind
      $("body").off();
      // task_time - (time_unpressed + total_pause_time) = time_unpressed at start
      let task_time = new Date().getTime() - this.task_start_time;
      this.study.data.record_trialdata({
        status: "task_end",
        task: "interference_tom",
        time_unpressed: this.time_unpressed,
        time_total_pause: this.total_pause_time,
        time_unpressed_start:
          task_time - (this.total_pause_time + this.time_unpressed),
        task_time: task_time,
        iteration: this.iteration,
      });
      $("body").unbind("keydown", this.response_handler);
      this.finish_func(this.time_unpressed);
      $("body").css({ border: "", height: "" });
      $("html").css({ height: "" });
    }

    keydown_handler(key) {
      key.preventDefault();
      // Need bool as holding down spacebar generates multiple events
      if (key.keyCode == 32 && this.unpressed) {
        this.unpressed = false;

        // visuals
        $("#spacebar-warning").css("opacity", 0);
        $("#pb").removeClass("bg-danger");
        $("#pb").addClass("bg-success");
        $("#pb").animate(
          { width: "100%" },
          this.total_pause_time - this.time_pressed,
          "linear",
          () => {
            this.finish_task();
          }
        );

        // pressed/unpressed time tracking
        if (this.initial_press) this.initial_press = false;
        else
          this.time_unpressed +=
            new Date().getTime() - this.start_time_unpressed;
        this.start_time_pressed = new Date().getTime();
      }
    }

    keyup_handler(key) {
      key.preventDefault();
      if (key.keyCode == 32 && !this.unpressed) {
        this.unpressed = true;

        // visuals
        $("#spacebar-warning").html("<h2>Do not release the spacebar!</h2>");
        $("#spacebar-warning").css("opacity", 1);
        $("#pb").removeClass("bg-success");
        $("#pb").addClass("bg-danger");
        $("#pb").stop();

        // track time
        this.time_pressed += new Date().getTime() - this.start_time_pressed;
        this.start_time_unpressed = new Date().getTime();
      }
    }

    switch_mode() {
      if (this.mode == "init") {
        // set timer, mode
        this.mode = "text1";
        setTimeout(() => {
          this.switch_mode();
        }, this.time_passage);

        $("#container-passage").show();
        $("#text-passage").html(this.tom_passages[2 * this.iteration]);
      } else if (this.mode == "text1") {
        // switch mode, set timer
        this.mode = "question1";
        setTimeout(() => {
          this.switch_mode();
        }, this.time_question);

        $("#container-passage").hide();
        $("#container-question").show();
        $("#text-question").html(this.tom_questions[2 * this.iteration]);
      } else if (this.mode == "question1") {
        this.mode = "isi";
        setTimeout(() => {
          this.switch_mode();
        }, this.time_isi);

        $("#container-question").hide();
      } else if (this.mode == "isi") {
        this.mode = "text2";
        setTimeout(() => {
          this.switch_mode();
        }, this.time_passage);

        $("#container-passage").show();
        $("#text-passage").html(this.tom_passages[2 * this.iteration + 1]);
      } else if (this.mode == "text2") {
        this.mode = "question2";
        setTimeout(() => {
          this.switch_mode();
        }, this.time_question);

        $("#container-passage").hide();
        $("#container-question").show();
        $("#text-question").html(this.tom_questions[2 * this.iteration + 1]);
      } else if (this.mode == "question2") {
        $("#container-passage").hide();
        $("#container-question").hide();
        this.finish_task();
      }
    }

    start_task() {
      // show task
      this.pages.next();

      // show blue border
      $("body").css({ border: "40px solid lightblue", height: "100%" });
      $("html").css({ height: "100%" });

      // register event listener
      $("body").focus().keydown(this.keydown_handler);
      $("body").focus().keyup(this.keyup_handler);

      // kick off on screen action
      this.switch_mode();

      // log beginning of task
      this.study.data.record_trialdata({
        status: "task_begin",
        task: "interference_tom",
        iteration: this.iteration,
      });
      this.task_start_time = new Date().getTime();
    }
  }

  return _InterferenceTom;
});
