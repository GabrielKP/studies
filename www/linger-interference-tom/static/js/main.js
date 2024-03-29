require([
  "module/Study",
  "stage/Welcome",
  "stage/ContentWarning",
  "stage/Consent",
  "stage/Fullscreen",
  "stage/GeneralInstructions",
  "stage/InterferenceTomTraining",
  "stage/FreeAssociationPre",
  "stage/Reading",
  // "stage/InterferencePauseTesting",
  "stage/FreeAssociationPost",
  "stage/QuestionnaireTransportation",
  "stage/QuestionnaireComprehension",
  "stage/QuestionnaireExperience",
  "stage/QuestionnaireDemographics",
  "stage/QuestionnaireOpen",
  "stage/Complete",
], function (
  Study,
  Welcome,
  ContentWarning,
  Consent,
  Fullscreen,
  GeneralInstructions,
  InterferenceTomTraining,
  FreeAssociationPre,
  Reading,
  // InterferencePauseTesting,
  FreeAssociationPost,
  QuestionnaireTransportation,
  QuestionnaireComprehension,
  QuestionnaireExperience,
  QuestionnaireDemographics,
  QuestionnaireOpen,
  Complete
) {
  // configuration
  let _version = "1.0.0-4";
  let config = {
    study: "linger-interference-tom",
    version: _version,
    debug: false,
    default_button_timeout: 500,
    time_limit_pre: 180000,
    time_limit_post: 180000,
    code_completion: "CGWO2HA6",
    code_noconsent: "CEH4RWLC",
    code_content_warning_disagree: "CAYTAWD0",
    studytime: 36,
    enforce_fullscreen: true,
    reading_delay_key: 100,
    interference_tom_training_passage_indices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    interference_tom_testing_passage_indices: [10],
    interference_tom_time_passage: 18000,
    interference_tom_time_question: 8000,
    interference_tom_pause: 4000,
  };

  // determine debug mode
  let url_params = new URLSearchParams(window.location.search);
  if (url_params.get("mode") == "debug") {
    config["debug"] = true;
    config["default_button_timeout"] = 0;
    config["time_limit_pre"] = 6000;
    config["time_limit_post"] = 6000;
    config["enforce_fullscreen"] = false;
    config["interference_tom_time_passage"] = 3000;
    config["interference_tom_time_question"] = 3000;
    config["interference_tom_time_pause"] = 1000;
    config["interference_tom_min_training_sessions"] = 3;
  }

  // local mode: needed to determine how data is saved
  config["local"] = false;
  if (url_params.has("local")) {
    config["local"] = true;
  }

  // skip button for debug
  if (config["debug"]) {
    $("#container-skip-button").show();
    $("#skip").on("click", () => {
      if (Study.current_stage.finish_task != null) {
        Study.current_stage.finish_task(true);
      } else {
        Study.next();
      }
    });
  }

  let initialization = Study.init(
    [
      // Welcome,
      // ContentWarning,
      // Consent,
      // Fullscreen,
      // GeneralInstructions,
      InterferenceTomTraining,
      FreeAssociationPre,
      Reading,
      // InterferencePauseTesting,
      // FreeAssociationPost,
      // QuestionnaireTransportation,
      // QuestionnaireComprehension,
      // QuestionnaireExperience,
      // QuestionnaireDemographics,
      // QuestionnaireOpen,
      // Complete,
    ],
    config
  );
  initialization.then(() => {
    Study.next();
  });
});
