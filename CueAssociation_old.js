define(["component/Pages"], function (Pages) {
  class _CueAssociation {
    listening = false;
    word_count = 0;
    word_start_time;
    word_end_time;
    word_text;
    word_text_user;
    word_key_chars;
    word_key_codes;
    word_key_onsets;
    word_double_press_count; // dp count
    key_start_time;
    key_end_time;
    total_double_press_count = 0; // total count
    last_spacebar_press = null; // To keep track of valid double presses
    mode;
    pages;
    pagenames;
    finish_func;
    study;
    task_start_time;
    time_limit;
    currentWordIndex = 0; // Current cue index
    DOUBLE_PRESS_THRESHOLD = 1000; // threshold
    exp_condition = "button_press";
    trialData = []; // Array to store all trial data

    response_time_limit = 5000; // response threshold
    response_timer = null;

    constructor() {
      // bind all the functions
      this.response_handler = this.response_handler.bind(this);
      this.show_next = this.show_next.bind(this);
      this.show_next_exp_suppress = this.show_next_exp_suppress.bind(this);
      this.show_cue_new_textbox = this.show_cue_new_textbox.bind(this);
      this.save_word = this.save_word.bind(this);
      this.ready_word_variables = this.ready_word_variables.bind(this);
      this.fade_cue = this.fade_cue.bind(this);
      this.start_task = this.start_task.bind(this);
      this.finish_task = this.finish_task.bind(this);
    }

    init(study, pagename, finish_func, time_limit, word_list) {
      this.study = study;
      this.pages = new Pages();
      this.finish_func = finish_func;
      this.pagenames = [pagename];
      this.time_limit = time_limit;
      this.wordList = word_list;
      return this.pages.init(this.study, this.pagenames);
    }

    finish_task() {
      this.study.data.record_trialdata({
        status: "task_end",
        task: "cue_association",
        task_time: new Date().getTime() - this.task_start_time,
      });
      $("body").unbind("keydown", this.response_handler);

      clearTimeout(this.response_timer); // Clear timer

      // Export trialData to JSON
      if (this.stage === "post") {
        const dataBlob = new Blob([JSON.stringify(this.trialData)], {
          type: "application/json",
        });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = "trial_data.json";
        downloadLink.click();
      }
      this.finish_func();
    }

    fade_cue(text, time_until_fade_out = 500, time_fade_out = 500) {
      $("#cue").html(text);
      $(".stim-div").fadeTo(250, 1);
      setTimeout(function () {
        $(".stim-div").fadeTo(time_fade_out, 0);
      }, time_until_fade_out);
    }

    save_word() {
      var submit_object = {}; // Declare empty object

      // Add properties to the object
      submit_object["task"] = "cue_association";
      submit_object["status"] = "data";
      submit_object["word_text_cue"] = this.word_text;
      submit_object["word_text_user"] = $("#qinput").val();
      submit_object["word_count"] = this.word_count;
      submit_object["word_time"] = this.word_end_time - this.word_start_time;
      submit_object["word_key_chars"] = this.word_key_chars;
      submit_object["word_key_codes"] = this.word_key_codes;
      submit_object["word_key_onsets"] = this.word_key_onsets;
      submit_object["word_double_press_count"] = this.word_double_press_count;
      submit_object["total_double_press_count"] = this.total_double_press_count;
      this.study.data.record_trialdata(submit_object);
      // Push to trialData
      this.trialData.push(submit_object);
      // console.log("Word saved:", submit_object);
    }

    ready_word_variables() {
      this.word_key_chars = [];
      this.word_key_codes = [];
      this.word_key_onsets = [];
      this.word_double_press_count = 0;
      this.word_start_time = new Date().getTime();
      this.key_start_time = new Date().getTime();
      this.listening = true;
    }

    show_cue_new_textbox() {
      $("#qinput").val("");
      this.fade_cue(this.word_text.toUpperCase());
      this.ready_word_variables();

      //start timer
      //clear existing timer
      clearTimeout(this.response_timer);

      //start a new timer
      this.response_timer = setTimeout(() => {
        //warn the participant
        $("#cue").html("Please respond faster!");
        $(".stim-div").fadeTo(250, 1);
      }, this.response_time_limit);
    }

    show_next() {
      if (
        this.exp_condition == "suppress" ||
        this.exp_condition == "button_press_suppress" ||
        this.exp_condition == "button_press"
      ) {
        this.show_next_exp_suppress();
      } else {
        console.error("Invalid exp_condition: " + exp_condition);
      }
    }

    show_next_exp_suppress() {
      if (this.currentWordIndex >= this.wordList.length) {
        this.finish_task(); // End task when all cues are done
      } else {
        this.word_text = this.wordList[this.currentWordIndex]; // Get next cue
        this.show_cue_new_textbox();
        this.currentWordIndex++; // Move to next cue
      }
    }

    response_handler(key) {
      if (!this.listening) return;
      this.listening = false;

      if (key.keyCode == 13) {
        // "ENTER" key
        if ($("#qinput").val() == "") {
          this.listening = true;
          key.preventDefault();
          return;
        }
        // clear timer since the participant responded
        clearTimeout(this.response_timer);

        // record keystroke
        this.key_end_time = new Date().getTime();
        this.word_key_chars.push(String.fromCharCode(key.keyCode));
        this.word_key_codes.push(key.keyCode);
        this.word_key_onsets.push(this.key_end_time - this.key_start_time);

        this.word_end_time = new Date().getTime();
        this.save_word();
        this.word_count++;

        //Reset the space bar presses for the next word
        this.word_spacebar_presses = 0; // reset

        key.preventDefault();

        this.show_next();
      } else if (key.keyCode == 32) {
        // SPACE key handling for double-press
        key.preventDefault();
        if (
          this.exp_condition == "button_press_suppress" ||
          this.exp_condition == "button_press"
        ) {
          this.current_time = new Date().getTime();
          if (
            this.last_spacebar_press != null &&
            this.current_time - this.last_spacebar_press <=
              this.DOUBLE_PRESS_THRESHOLD
          ) {
            const submit_object = {
              phase: "double_press",
              status: "ongoing",
              mode: "double_press",
              double_press: "occurrence",
              current_double_press_count: ++this.total_double_press_count,
              time_since_last_word_start:
                new Date().getTime() - this.word_start_time,
              word_text: $("#qinput").val(),
              word_count: this.word_count,
              // word_key_chars: this.word_key_chars,
              // word_key_codes: this.word_key_codes,
              // word_key_onsets: this.word_key_onsets,
              word_text_cue: this.word_text,
              word_double_press_count: ++this.word_double_press_count,
            };
            this.trialData.push(submit_object);
            // console.log("Double press recorded:", submit_object);

            $("#double-space-feedback")
              .stop(true)
              .fadeTo(0, 1, () => {
                $("#double-space-feedback").fadeTo(1000, 0);
              });

            this.last_spacebar_press = null; // Reset for next detection
          } else {
            this.last_spacebar_press = this.current_time;
          }
        }
        this.listening = true;
      } else {
        // Handle other keys
        this.key_end_time = new Date().getTime();
        this.word_key_chars.push(String.fromCharCode(key.keyCode));
        this.word_key_codes.push(key.keyCode);
        this.word_key_onsets.push(this.key_end_time - this.key_start_time);
        this.key_start_time = new Date().getTime();
        this.listening = true;
      }
    }

    start_task() {
      this.pages.next();
      this.study.data.record_trialdata({
        status: "task_begin",
        task: "cue_association",
      });
      this.task_start_time = new Date().getTime();
      this.currentWordIndex = 0;

      $(function () {
        $("html").on("click", function () {
          $("#qinput").focus();
        });
      });

      $("input,textarea").bind("cut copy paste", function (e) {
        e.preventDefault();
      });

      $("body").focus().keydown(this.response_handler);

      // Disable macOS double-space period behavior
      $("#qinput").on("input", function (e) {
        const inputValue = $(this).val();

        // Remove periods inserted by double-space
        if (inputValue.endsWith(". ")) {
          $(this).val(inputValue.slice(0, -2));
        }
      });

      let canvas = document.getElementById("canvas-circle");
      if (canvas && canvas.getContext) {
        let ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(50, 30, 20, 0, 2 * Math.PI);
        ctx.fillStyle = "lightblue";
        ctx.fill();
      }

      if (
        this.exp_condition == "suppress" ||
        this.exp_condition == "button_press_suppress" ||
        this.exp_condition == "button_press"
      ) {
        this.show_next_exp_suppress();
        setTimeout(() => {
          this.mode = "end";
        }, this.time_limit);

        this.mode = "cue_association_game";
        this.ready_word_variables();
      }
    }
  }

  return _CueAssociation;
});
