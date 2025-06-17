define(["component/Pages"], function (Pages) {
  let study;
  let pages;
  return {
    name: "end_recording",
    init: function (_study) {
      study = _study;
      pages = new Pages();
      return pages.init(
        study,
        [
          "end_recording/instruct-1.html",
          // "end_recording/instruct-2.html",
        ],
        function () {
          study.next();
        }
      );
    },
    show: function () {
      pages.next();
      setTimeout(() => {
        // Display participant ID
        const participantId = study.data.participantID;
        const studyId = study.data.study_id;
        if (participantId && studyId) {
          console.log(participantId)
          console.log(studyId)
          document.getElementById("participant-id").textContent = participantId;
          document.getElementById("study-id").textContent = studyId;
        }
        // console.log(participantId)
      }, 100);

      // extra binding for agree button
      $("#next").on("click", () => {
        study.data.record_trialdata({
          recording_agree: true,
        });
      });
    }



  };
});
