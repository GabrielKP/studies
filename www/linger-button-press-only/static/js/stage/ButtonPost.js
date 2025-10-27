define(["component/Pages", "component/ButtonPress"], function (Pages, ButtonPress) {
    let study;
    let instruct_pages;
    let button_press;

    return {
        name: "post_button_thinking",

        init: function (_study) {
            study = _study;
            instruct_pages = new Pages();
            button_press = new ButtonPress();

            // load the two HTML files in order
            return Promise.all([
                instruct_pages.init(study,
                    "thinking_button/instruct-1.html",
                    function () {
                        button_press.start_task();
                    }
                ),
                button_press.init(study,
                    "thinking_button/task.html",
                    function () {
                        study.next();
                    },
                    study.config.time_limit_post
                ),
            ]);

        },

        show: function () {
            instruct_pages.next(); // show instruction
        },
    };
});
