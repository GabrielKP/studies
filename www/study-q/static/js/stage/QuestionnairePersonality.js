define(["component/Pages"], function (Pages) {
  let study;
  let pages;
  let warning_text =
    '<div class="alert alert-danger"><i>Please answer all questions!</i></div>';

  function _finish_task() {
    $("input:checked").each(function () {
      study.data.record_trialdata({
        status: "ongoing",
        question: this.name,
        answer: this.value,
      });
    });
    pages.next();
  }

  return {
    name: "questionnaire_personality",
    init: function (_study) {
      study = _study;
      pages = new Pages();
      return pages.init(
        study,
        ["questionnaires/personality.html"],
        function () {
          study.next();
        }
      );
    },
    show: function () {
      pages.next();

      // bind conditional enable
      $("input").on("change", function () {
        // check for all changed
        if ($("input:checked").length == 20) {
          $("#warning").html("");
          $("#submit")
            .off()
            .on("click", function () {
              _finish_task();
            });
        } else {
          $("#submit")
            .off()
            .on("click", function () {
              $("#warning").html(warning_text);
            });
        }
      });

      // bind submit button
      $("#submit").on("click", () => {
        $("#warning").html(warning_text);
      });
    },
    finish_task: function () {
      _finish_task();
    },
  };
});
