define([
  "component/Pages",
  "component/CueAssociation",
  "component/WordListPost",
], function (Pages, CueAssociation, WordListPost) {
  let study;
  let instruct_pages;
  let cue_association;
  // let condition;

  return {
    name: "cue_association_post",
    init: function (_study) {
      study = _study;
      instruct_pages = new Pages();
      cue_association = new CueAssociation();
      return study.get_condition().then(() => {
        let condition = study.config["condition"];

        if (condition == "h2") {
          console.log("Word list for condition", condition);
          let firstPart = WordListPost.slice(-10); // last 10 words
          let secondPart = WordListPost.slice(0, -10);
          study.wordList = firstPart.concat(secondPart);
        } else if (condition == "h1") {
          console.log("Word list for condition", condition);
          study.wordList = WordListPost;
        } else {
          console.error("No valid condition found, using default word list");
          study.wordList = WordListPost;
        }
        // let condition = study.config["condition"];
        // // console.log("Condition:" + study.config["condition"]);

        // if (condition == "h2") {
        //   console.log("Word list for condition", condition);
        //   let firstPart = WordListPost.slice(-10); // last 10 words
        //   let secondPart = WordListPost.slice(0, -10);
        //   study.wordList = firstPart.concat(secondPart);
        //   // console.log("word list" + wordList);
        // } else if (condition == "h1") {
        //   console.log("Word list for condition", condition);
        //   study.wordList = WordListPost; // first 10 words
        // }
        // console.log("Word list for condition", condition, ":", study.wordList);

        return Promise.all([
          instruct_pages.init(
            study,
            [
              "cue_association_post/instruct-1.html",
              "cue_association_post/instruct-2.html",
              "cue_association_post/instruct-3.html",
            ],
            function () {
              console.log("Instructions finished, starting cue association");
              cue_association.start_task();
            }
          ),
          cue_association.init(
            // feed word list here
            // make it for both pre and post
            // word list for both pre and post (two list)
            study,
            "cue_association_post/task.html",
            function () {
              study.next();
            },
            study.config.time_limit_post,
            // WordListPost
            study.wordList
          ),
        ]);
      });
    },
    show: function () {
      // show instructions first
      instruct_pages.next();
    },
  };
});
