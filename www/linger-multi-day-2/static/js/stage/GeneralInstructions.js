define(["component/Pages"], function (Pages) {
  let study;
  let page1;
  let page2;
  return {
    name: "general_instructions",
    init: function (_study) {
      study = _study;
      page1 = new Pages();
      page2 = new Pages();
      return Promise.all([
        page1.init(
          study,
          ["general_instructions/instruct-1.html"],
          function () {
            // show page 2 (need to reset in case this is not the first time)
            page2.reset();
            page2.next();
            // set study time
            $("#studytime_day2").text(study.config["studytime_day2"]);
            // bind previous button
            $("#prevC").on("click", () => {
              page1.reset();
              page1.next();
            });
          }
        ),
        page2.init(
          study,
          ["general_instructions/instruct-2.html"],
          function () {
            study.next();
          }
        ),
      ]);
    },
    show: function () {
      page1.next();
    },
  };
});
