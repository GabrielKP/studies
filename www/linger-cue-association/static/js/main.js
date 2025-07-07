require([
  "module/Study",
  "stage/Welcome",
  "stage/ContentWarning",
  "stage/Consent",
  "stage/Recording",
  "stage/Fullscreen",
  "stage/GeneralInstructions",
  "stage/CueAssociationPre",
  "stage/Reading",
  "stage/CueAssociationPost",
  "stage/QuestionnaireTransportation",
  "stage/QuestionnaireComprehension",
  "stage/QuestionnaireExperience",
  "stage/QuestionnaireDemographics",
  "stage/QuestionnaireOpen",
  "stage/EndRecording",
  "stage/Complete",
], function (
  Study,
  Welcome,
  ContentWarning,
  Consent,
  Recording,
  Fullscreen,
  GeneralInstructions,
  CueAssociationPre,
  Reading,
  CueAssociationPost,
  QuestionnaireTransportation,
  QuestionnaireComprehension,
  QuestionnaireExperience,
  QuestionnaireDemographics,
  QuestionnaireOpen,
  EndRecording,
  Complete
) {
  // configuration
  let _version = "1.4.3";
  let config = {
    study: "linger-cue-association",
    version: _version,
    debug: false,
    default_button_timeout: 500,
    time_limit_pre: 180000,
    time_limit_post: 180000,
    code_completion: "CGWO2HA6",
    code_noconsent: "CEH4RWLC",
    code_content_warning_disagree: "CAYTAWD0",
    conditions: ["l1", "l2"],
    studytime: 33,
    enforce_fullscreen: true,
    reading_delay_key: 100,
    upload_link:
      "https://livejohnshopkins-my.sharepoint.com/:f:/g/personal/gkressi1_jh_edu/EphOh_kBCGBDsgR9IxCdTdIB7glO9m2zd3bcIYub4MVETw",
  };

  // determine debug mode
  let url_params = new URLSearchParams(window.location.search);
  if (url_params.get("mode") == "debug") {
    config["debug"] = true;
    config["default_button_timeout"] = 0;
    config["time_limit_pre"] = 6000;
    config["time_limit_post"] = 6000;
    config["enforce_fullscreen"] = false;
  }

  // local mode: needed to determine how data is saved
  config["local"] = false;
  if (url_params.has("local")) {
    config["local"] = true;
  }

  // condition
  if (url_params.has("condition")) {
    config["condition"] = url_params.get("condition");
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
      Welcome,
      ContentWarning,
      Consent,
      Recording,
      Fullscreen,
      GeneralInstructions,
      CueAssociationPre,
      Reading,
      CueAssociationPost,
      QuestionnaireTransportation,
      QuestionnaireComprehension,
      QuestionnaireExperience,
      QuestionnaireDemographics,
      QuestionnaireOpen,
      EndRecording,
      Complete,
    ],
    config
  );
  initialization.then(() => {
    Study.next();
  });
});
