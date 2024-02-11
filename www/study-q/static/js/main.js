require([
  "module/Study",
  "stage/Welcome",
  "stage/Consent",
  "stage/Fullscreen",
  "stage/GeneralInstructions",
  "stage/FreeAssociationPre",
  "stage/Reading",
  "stage/FreeAssociationPost",
  "stage/QuestionnaireTransportation",
  "stage/QuestionnaireComprehension",
  "stage/QuestionnaireExperience",
  "stage/QuestionnairePersonality",
  "stage/QuestionnaireOCD",
  "stage/QuestionnaireDass8",
  "stage/QuestionnaireRumination",
  "stage/QuestionnaireDemographics",
  "stage/QuestionnaireOpen",
  "stage/Complete",
], function (
  Study,
  Welcome,
  Consent,
  Fullscreen,
  GeneralInstructions,
  FreeAssociationPre,
  Reading,
  FreeAssociationPost,
  QuestionnaireTransportation,
  QuestionnaireComprehension,
  QuestionnaireExperience,
  QuestionnairePersonality,
  QuestionnaireOCD,
  QuestionnaireDass8,
  QuestionnaireRumination,
  QuestionnaireDemographics,
  QuestionnaireOpen,
  Complete
) {
  // configuration
  let config = {
    version: "0.1.0",
    debug: false,
    default_button_timeout: 500,
    time_limit_pre: 180000,
    code_completion: "XXXXXX",
    code_noconsent: "YYYYYY",
    studytime: 35,
    enforce_fullscreen: true,
    reading_delay_key: 100,
  };
  let debug_config = {
    version: "0.1.0",
    debug: true,
    default_button_timeout: 0,
    time_limit_pre: 2000,
    code_completion: "XXXXXX",
    code_noconsent: "YYYYYY",
    studytime: 35,
    enforce_fullscreen: false,
  };

  // determine debug mode
  let url_params = new URLSearchParams(window.location.search);
  if (url_params.get("mode") == "debug") {
    config = debug_config;
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
        Study.current_stage.finish_task();
      } else {
        Study.next();
      }
    });
  }

  let initialization = Study.init(
    [
      Welcome,
      Consent,
      Fullscreen,
      GeneralInstructions,
      FreeAssociationPre,
      Reading,
      FreeAssociationPost,
      QuestionnaireTransportation,
      QuestionnaireComprehension,
      QuestionnaireExperience,
      QuestionnairePersonality,
      QuestionnaireOCD,
      QuestionnaireDass8,
      QuestionnaireRumination,
      QuestionnaireDemographics,
      QuestionnaireOpen,
      Complete,
    ],
    config
  );
  initialization.then(() => {
    Study.next();
  });
});
