define(["component/Pages"], function (Pages) {
  class _ButtonPress {
    constructor() {
      this.start_task = this.start_task.bind(this);
      this.finish_task = this.finish_task.bind(this);
      this.response_handler = this.response_handler.bind(this);
      this.update_progress = this.update_progress.bind(this);
      this.flash_circle_color = this.flash_circle_color.bind(this);
      this.show_practice_text = this.show_practice_text.bind(this);
      this.double_enter_press_count = 0;
      this.double_enter_press_times = [];
      this.last_enter_press = null;
      this.DOUBLE_PRESS_THRESHOLD = 1000;
      this.colorFlashTimeout = null;
    }

    init(study, pagename, finish_func, duration, is_practice = false) {
      this.study = study;
      this.pages = new Pages();
      this.finish_func = finish_func;
      this.pagenames = [pagename];
      this.duration = duration;
      this.holding = false;
      this.unhold_count = 0;
      this.progressInterval = null;
      this.double_enter_press_count = 0;
      this.double_enter_press_times = [];
      this.last_enter_press = null;
      this.colorFlashTimeout = null;
      this.is_practice = is_practice;
      this.practice_presses_required = 5;
      return this.pages.init(this.study, this.pagenames);
    }

    flash_circle_color() {
      const progressCircle = document.getElementById("progress-circle");
      if (!progressCircle) return;

      if (this.colorFlashTimeout) {
        clearTimeout(this.colorFlashTimeout);
      }

      // Switch to button pulse animation
      progressCircle.classList.remove("circle-pulse-blue");
      progressCircle.classList.add("circle-pulse-button");

      // Revert back to blue after 400ms
      this.colorFlashTimeout = setTimeout(() => {
        progressCircle.classList.remove("circle-pulse-button");
        progressCircle.classList.add("circle-pulse-blue");
      }, 600);
    }

    update_progress() {
      if (!this.holding) return;

      const elapsed = Date.now() - this.first_hold_start_time;
      const percentage = Math.min((elapsed / this.duration) * 100, 100);

      const maxSize = 300;
      const size = (percentage / 100) * maxSize;
      const progressCircle = document.getElementById("progress-circle");

      if (progressCircle) {
        progressCircle.style.width = size + "px";
        progressCircle.style.height = size + "px";
      }

      if (elapsed >= this.duration) {
        clearInterval(this.progressInterval);

        document.removeEventListener("keydown", this.response_handler);
        document.removeEventListener("keyup", this.response_handler);

        $("#text").text("Done!");
        $("#text").css("color", "green");

        this.study.data.record_trialdata({
          task: "button_press",
          status: "complete",
          total_hold_time: elapsed,
          unhold_count: this.unhold_count,
          hold_start_time: this.first_hold_start_time,
          hold_end_time: Date.now(),
          double_enter_press_count: this.double_enter_press_count,
          double_enter_press_times: this.double_enter_press_times,
        });

        setTimeout(() => this.finish_task(), 1500);
      }
    }

    show_practice_text() {
      if (this.double_enter_press_count < this.practice_presses_required) {
        if (
          this.practice_presses_required - this.double_enter_press_count ==
          1
        ) {
          $("#text").text("Double press the ENTER key 1 more time.");
        } else {
          $("#text").text(
            "Double press the ENTER key " +
              (this.practice_presses_required - this.double_enter_press_count) +
              " times."
          );
        }
        $("#text").css("color", "black");
      } else {
        $("#text").text("Wait until time is up.");
      }
    }

    response_handler(e) {
      if (e.type === "keydown" && e.code === "Enter") {
        // ENTER KEY
        const current_time = Date.now();
        const time_since_start = this.first_hold_start_time
          ? current_time - this.first_hold_start_time
          : 0;

        if (
          this.last_enter_press != null &&
          current_time - this.last_enter_press <= this.DOUBLE_PRESS_THRESHOLD
        ) {
          this.double_enter_press_count++;
          this.double_enter_press_times.push(time_since_start);

          if (this.is_practice) {
            this.show_practice_text();
          }

          this.study.data.record_trialdata({
            task: "button_press",
            status: "enter_double_press",
            double_enter_press_number: this.double_enter_press_count,
            time_since_task_start: time_since_start,
            timestamp: current_time,
            holding_space: this.holding,
            time_since_last_enter: current_time - this.last_enter_press,
          });

          this.flash_circle_color();

          this.last_enter_press = null;
        } else {
          this.last_enter_press = current_time;
        }

        e.preventDefault();
      } else if (
        e.type === "keydown" &&
        e.code === "Space" &&
        !this.holding &&
        this.unhold_count === 0
      ) {
        // FIRST HOLD
        this.holding = true;
        this.first_hold_start_time = Date.now();
        this.hold_start_time = this.first_hold_start_time;
        this.progressInterval = setInterval(this.update_progress, 10);
        if (this.is_practice) {
          this.show_practice_text();
        } else {
          $("#text").css("opacity", 0);
        }

        // Start the pulse animation
        const progressCircle = document.getElementById("progress-circle");
        if (progressCircle) {
          progressCircle.classList.add("circle-pulse-blue");
        }

        this.study.data.record_trialdata({
          task: "button_press",
          status: "hold_start",
          hold_start_time: this.hold_start_time,
        });
        e.preventDefault();
      } else if (
        e.type === "keydown" &&
        e.code === "Space" &&
        !this.holding &&
        this.unhold_count > 0
      ) {
        // RESUME HOLD
        this.holding = true;
        this.hold_start_time = Date.now();
        if (this.is_practice) {
          this.show_practice_text();
        } else {
          $("#text").css("opacity", 0);
        }

        // Resume the pulse animation
        const progressCircle = document.getElementById("progress-circle");
        if (progressCircle) {
          progressCircle.classList.add("circle-pulse-blue");
        }

        this.study.data.record_trialdata({
          task: "button_press",
          status: "hold_start_resume",
          hold_start_time: this.hold_start_time,
        });
        e.preventDefault();
      } else if (e.type === "keyup" && e.code === "Space" && this.holding) {
        // RELEASE HOLD
        this.holding = false;
        this.unhold_count += 1;
        const hold_end = Date.now();

        // Pause the pulse animation
        const progressCircle = document.getElementById("progress-circle");
        if (progressCircle) {
          progressCircle.classList.remove("circle-pulse-blue");
          progressCircle.classList.remove("circle-pulse-button");
        }

        this.study.data.record_trialdata({
          task: "button_press",
          status: "hold_pause",
          hold_end_time: hold_end,
          unhold_count: this.unhold_count,
        });
        $("#text").text("Keep holding the space bar continuously!");
        $("#text").css("color", "red");
        $("#text").css("opacity", 1);
        e.preventDefault();
      }
    }

    start_task() {
      this.pages.next();

      this.study.data.record_trialdata({
        status: "task_begin",
        task: "button_press",
      });

      document.addEventListener("keydown", this.response_handler);
      document.addEventListener("keyup", this.response_handler);
    }

    finish_task() {
      clearInterval(this.progressInterval);
      if (this.colorFlashTimeout) {
        clearTimeout(this.colorFlashTimeout);
      }
      document.removeEventListener("keydown", this.response_handler);
      document.removeEventListener("keyup", this.response_handler);
      this.study.data.record_trialdata({
        status: "task_end",
        task: "button_press",
        double_enter_press_count: this.double_enter_press_count,
        double_enter_press_times: this.double_enter_press_times,
      });
      this.finish_func();
    }
  }

  return _ButtonPress;
});
