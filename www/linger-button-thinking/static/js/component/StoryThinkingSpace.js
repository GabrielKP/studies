define(["component/Pages"], function (Pages) {
    class _StoryThinking {
        constructor() {
            this.start_task = this.start_task.bind(this);
            this.finish_task = this.finish_task.bind(this);
            this.response_handler = this.response_handler.bind(this);
            this.update_progress = this.update_progress.bind(this);
        }

        init(study, pagename, finish_func, duration = 3000) {
            this.study = study;
            this.pages = new Pages();
            this.finish_func = finish_func;
            this.pagenames = [pagename];
            this.duration = duration; // 30s default
            this.holding = false;
            this.unhold_count = 0;
            this.progressInterval = null;
            return this.pages.init(this.study, this.pagenames);
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
                const warn = document.getElementById("warning-text");
                warn.textContent = "Done! You may continue.";
                warn.style.color = "green";

                this.study.data.record_trialdata({
                    task: "story_thinking",
                    status: "complete",
                    total_hold_time: elapsed,
                    unhold_count: this.unhold_count,
                    hold_start_time: this.first_hold_start_time,
                    hold_end_time: Date.now(),
                });

                setTimeout(() => this.finish_task(), 1000);
            }
        }

        response_handler(e) {
            const warn = document.getElementById("warning-text");
            if (e.type === "keydown" && e.code === "Space" && !this.holding && this.unhold_count === 0) {
                // start holding
                this.holding = true;
                this.first_hold_start_time = Date.now();
                this.hold_start_time = this.first_hold_start_time;
                this.progressInterval = setInterval(this.update_progress, 50);
                warn.textContent = "";
                this.study.data.record_trialdata({
                    task: "story_thinking",
                    status: "hold_start",
                    hold_start_time: this.hold_start_time,
                });
                e.preventDefault();
            } else if (e.type === "keydown" && e.code === "Space" && !this.holding && this.unhold_count > 0) {
                //resume holding
                this.holding = true;
                this.hold_start_time = Date.now();
                // this.progressInterval = setInterval(this.update_progress, 50);
                warn.textContent = "";
                this.study.data.record_trialdata({
                    task: "story_thinking",
                    status: "hold_start_resume",
                    hold_start_time: this.hold_start_time,
                });
                e.preventDefault();
            } else if (e.type === "keyup" && e.code === "Space" && this.holding) {
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
                warn.textContent = "Please hold the space bar and think about the story";
                warn.style.color = "red";
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

            // initial message
            const warn = document.getElementById("warning-text");
            if (warn) warn.textContent = "Press and hold the space bar to begin.";
        }

        finish_task() {
            clearInterval(this.progressInterval);
            document.removeEventListener("keydown", this.response_handler);
            document.removeEventListener("keyup", this.response_handler);
            this.study.data.record_trialdata({
                status: "task_end",
                task: "story_thinking",
            });
            this.finish_func();
        }
    }

    return _StoryThinking;
});
