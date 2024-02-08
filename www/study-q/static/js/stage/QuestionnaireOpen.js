define(["component/Pages"], function (Pages) {
  let study;
  let pages;

  function _finish_task() {
    $(".collectible").each(function () {
      study.data.record_trialdata({
        status: "ongoing",
        question: this.id,
        answer: this.value,
      });
    });
    pages.next();
  }
  return {
    name: "questionnaire_open",
    init: function (_study) {
      study = _study;
      pages = new Pages();
      return pages.init(
        study,
        ["questionnaires/questionnaire_open.html"],
        function () {
          study.next();
        }
      );
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
        _finish_task();
      });
    },
    finish_task: function () {
      _finish_task();
    },
  };
});
