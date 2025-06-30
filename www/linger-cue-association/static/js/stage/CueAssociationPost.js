define([
  "component/Pages",
  "component/CueAssociation",
  "component/WordListPost1",
  "component/WordListPost2",
], function (Pages, CueAssociation, WordListPost1, WordListPost2) {
  let study;
  let instruct_pages;
  let cue_association;
  let condition;

  return {
    name: "cue_association_post",
    init: function (_study) {
      study = _study;
      instruct_pages = new Pages();
      cue_association = new CueAssociation();

      condition = study.config["condition"];

      if (condition == "l2") {
        console.log("Word list for condition", condition);
        study.wordList = WordListPost2;
      } else if (condition == "l1") {
        console.log("Word list for condition", condition);
        study.wordList = WordListPost1;
      } else {
        console.error("No valid condition found, using default word list");
        study.wordList = WordListPost1;
      }

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
    },
    show: function () {
      // show instructions first
      instruct_pages.next();
    },
  };
});
