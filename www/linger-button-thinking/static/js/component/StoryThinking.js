define(["component/Pages"], function (Pages) {
    class _StoryThinking {
        constructor() {
            this.start_task = this.start_task.bind(this);
            this.finish_task = this.finish_task.bind(this);
            this.response_handler = this.response_handler.bind(this);
            this.update_progress = this.update_progress.bind(this);
            this.show_warning = this.show_warning.bind(this);
            this.enter_press_count = 0;
            this.enter_press_times = [];
        }

        init(study, pagename, finish_func, duration = 30000) {
            this.study = study;
            this.pages = new Pages();
            this.finish_func = finish_func;
            this.pagenames = [pagename];
            this.duration = duration;
            this.holding = false;
            this.unhold_count = 0;
            this.progressInterval = null;
            this.enter_press_count = 0;
            this.enter_press_times = [];
            return this.pages.init(this.study, this.pagenames);
        }

        // Helper function to show specific warning
        show_warning(warning_id) {
            // Hide all warnings
            document.querySelectorAll('.warning-text').forEach(el => {
                el.style.display = 'none';
            });
            // Show the requested warning
            const warning = document.getElementById(warning_id);
            if (warning) {
                warning.style.display = 'block';
            }
        }

        update_progress() {
            if (!this.holding) return;
            const bar = document.getElementById("progress-bar");
            const elapsed = Date.now() - this.first_hold_start_time;
            const percent = Math.min((elapsed / this.duration) * 100, 100);
            bar.style.width = percent + "%";

            if (elapsed >= this.duration) {
                clearInterval(this.progressInterval);

                document.removeEventListener("keydown", this.response_handler);
                document.removeEventListener("keyup", this.response_handler);

                this.show_warning('warning-complete');

                this.study.data.record_trialdata({
                    task: "story_thinking",
                    status: "complete",
                    total_hold_time: elapsed,
                    unhold_count: this.unhold_count,
                    hold_start_time: this.first_hold_start_time,
                    hold_end_time: Date.now(),
                    enter_press_count: this.enter_press_count,
                    enter_press_times: this.enter_press_times,
                });

                setTimeout(() => this.finish_task(), 1000);
            }
        }

        response_handler(e) {
            const enterFeedback = document.getElementById("enter-feedback");

            // Handle Enter key press (while holding space)
            if (e.type === "keydown" && e.code === "Enter") {
                const current_time = Date.now();
                const time_since_start = this.first_hold_start_time
                    ? current_time - this.first_hold_start_time
                    : 0;

                this.enter_press_count++;
                this.enter_press_times.push(time_since_start);

                // Record Enter press event
                this.study.data.record_trialdata({
                    task: "story_thinking",
                    status: "enter_press",
                    enter_press_number: this.enter_press_count,
                    time_since_task_start: time_since_start,
                    timestamp: current_time,
                    holding_space: this.holding,
                });

                // Show visual feedback
                if (enterFeedback) {
                    enterFeedback.style.opacity = "1";
                    setTimeout(() => {
                        enterFeedback.style.opacity = "0";
                    }, 500);
                }

                e.preventDefault();
            }
            // Handle Space key down - start holding
            else if (e.type === "keydown" && e.code === "Space" && !this.holding && this.unhold_count === 0) {
                // start holding
                this.holding = true;
                this.first_hold_start_time = Date.now();
                this.hold_start_time = this.first_hold_start_time;
                this.progressInterval = setInterval(this.update_progress, 50);
                this.show_warning('warning-holding');
                this.study.data.record_trialdata({
                    task: "story_thinking",
                    status: "hold_start",
                    hold_start_time: this.hold_start_time,
                });
                e.preventDefault();
            }
            // Handle Space key down - resume holding
            else if (e.type === "keydown" && e.code === "Space" && !this.holding && this.unhold_count > 0) {
                //resume holding
                this.holding = true;
                this.hold_start_time = Date.now();
                this.show_warning('warning-holding');
                this.study.data.record_trialdata({
                    task: "story_thinking",
                    status: "hold_start_resume",
                    hold_start_time: this.hold_start_time,
                });
                e.preventDefault();
            }
            // Handle Space key up - stop holding
            else if (e.type === "keyup" && e.code === "Space" && this.holding) {
                // stop holding
                this.holding = false;
                this.unhold_count += 1;
                const hold_end = Date.now();
                this.study.data.record_trialdata({
                    task: "story_thinking",
                    status: "hold_pause",
                    hold_end_time: hold_end,
                    unhold_count: this.unhold_count,
                });
                this.show_warning('warning-released');
                e.preventDefault();
            }
        }

        start_task() {
            // show task page
            this.pages.next();

            // log start
            this.study.data.record_trialdata({
                status: "task_begin",
                task: "story_thinking",
            });

            // bind keyboard listeners
            document.addEventListener("keydown", this.response_handler);
            document.addEventListener("keyup", this.response_handler);

            // Show initial warning
            this.show_warning('warning-initial');
        }

        finish_task() {
            clearInterval(this.progressInterval);
            document.removeEventListener("keydown", this.response_handler);
            document.removeEventListener("keyup", this.response_handler);
            this.study.data.record_trialdata({
                status: "task_end",
                task: "story_thinking",
                enter_press_count: this.enter_press_count,
                enter_press_times: this.enter_press_times,
            });
            this.finish_func();
        }
    }

    return _StoryThinking;
});