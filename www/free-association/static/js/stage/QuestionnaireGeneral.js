define(["component/Pages"], function (Pages) {
  let study;
  let pages;
  return {
    name: "questionnaire_general",
    init: function (_study) {
      study = _study;
      pages = new Pages();
      return pages.init(study, ["questionnaire_general.html"], function () {
        study.next();
      });
    },
    show: function () {
      pages.next();
      // bind conditional clarity follow up
      $("#clarity_rating").on("change", () => {
        if ($("#clarity_rating").val() < 6) {
          $("#clarity_follow_up").show();
        } else {
          $("#clarity_follow_up").hide();
        }
      });
      // bind submit button
      $("#submit").on("click", () => {
        // save data
        $(".collectible").each(function () {
          study.data.record_trialdata({
            status: "ongoing",
            question: this.id,
            answer: this.value,
          });
        });
        // move to next page and stage
        pages.next();
      });
    },
  };
});
