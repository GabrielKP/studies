define([
  "component/InterferenceStoryTraining",
  "component/InterferenceStoryTesting",
], function (InterferenceStoryTraining, InterferenceStoryTesting) {
  class _InterferenceReading {
    study;
    pages;
    story;
    sentence_index;
    sentence_text;
    sentence_time;
    task_start_time;
    reading_delay_key;
    finish_func;
    timeout_handler;

    constructor() {
      // bind all the functions
      this.init.bind(this);
      this.finish_task.bind(this);
      this.record_sentence.bind(this);
      this.next_sentence.bind(this);
    }

    init(study, page_object, finish_func, training) {
      this.study = study;
      this.pages = page_object;
      this.finish_func = finish_func;
      this.sentence_index = 0;
      if (training) {
        this.story = InterferenceStoryTraining;
      } else {
        this.story = InterferenceStoryTesting;
      }
    }

    finish_task(skip = false) {
      // unbind
      $("body").off();

      // record data
      let task_time = new Date().getTime() - this.task_start_time;
      this.study.data.record_trialdata({
        status: "task_end",
        task: "interference_reading",
        task_time: task_time,
      });

      $("body").css({ border: "", height: "" });
      $("html").css({ height: "" });
      if (!skip) this.finish_func();
      else {
        clearTimeout(this.timeout_handler);
        this.study.next();
      }
    }

    record_sentence() {
      let submit_object = {};
      submit_object["task"] = "interference_reading";
      submit_object["status"] = "ongoing";
      submit_object["mode"] = "sentence";
      submit_object["sentence_text"] = this.sentence_text;
      submit_object["sentence_time"] = this.sentence_time;
      submit_object["sentence_length"] = this.sentence_text.length;
      this.study.data.record_trialdata(submit_object);
    }

    next_sentence() {
      // record sentence
      if (this.sentence_index != 0) {
        this.record_sentence();
      }

      // next sentence/finish
      if (this.sentence_index == this.story.row.length) {
        this.finish_task();
      } else {
        this.sentence_text = this.story.row[this.sentence_index].Story;
        this.sentence_time = this.story.row[this.sentence_index].time;
        this.sentence_index++;
        $("#sentence").html(this.sentence_text);

        this.timeout_handler = setTimeout(() => {
          this.next_sentence();
        }, this.sentence_time);
      }
    }

    start_task() {
      // show task
      this.pages.next();

      // show blue border
      $("body").css({ border: "40px solid #CBC3E3", height: "100%" });
      $("html").css({ height: "100%" });

      // for debugging show total amount of time for sentences:
      let total_time = 0;
      for (let i = 0; i < this.story.row.length; i++) {
        total_time += Number(this.story.row[i].time);
      }
      console.debug("Time: " + total_time);

      // kick off on screen action
      this.next_sentence();

      // log beginning of task
      this.study.data.record_trialdata({
        status: "task_begin",
        task: "interference_reading",
      });
      this.task_start_time = new Date().getTime();
    }
  }

  return _InterferenceReading;
});
