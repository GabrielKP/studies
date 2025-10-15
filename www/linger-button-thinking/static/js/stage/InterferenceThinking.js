define(["component/Pages", "component/StoryThinking"], function (Pages, StoryThinking) {
    let study;
    let instruct_pages;
    let story_thinking;

    return {
        name: "interference_story_thinking",

        init: function (_study) {
            study = _study;
            instruct_pages = new Pages();
            story_thinking = new StoryThinking();

            // load the two HTML files in order
            return Promise.all([
                instruct_pages.init(study,
                    "interference_story_thinking/instruct-1.html",
                    function () {
                        story_thinking.start_task();
                    }
                ),
                story_thinking.init(study,
                    "interference_story_thinking/task.html",
                    function () {
                        study.next();
                    },
                ),
            ]);

        },

        show: function () {
            instruct_pages.next(); // show instruction
        },
    };
});
