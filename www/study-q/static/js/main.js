require([
  "module/Study",
  "stage/Welcome",
  "stage/Consent",
  "stage/Fullscreen",
  "stage/GeneralInstructions",
  "stage/FreeAssociationPre",
  "stage/Reading",
  "stage/FreeAssociationPost",
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
  QuestionnaireOpen,
  Complete
) {
  // configuration
  let config = {
    debug: false,
    default_button_timeout: 500,
    time_limit_pre: 180000,
    code_completion: "XXXXXX",
    code_noconsent: "YYYYYY",
    studytime: 4,
    enforce_fullscreen: true,
    reading_delay_key: 100,
  };
  let debug_config = {
    debug: true,
    default_button_timeout: 0,
    time_limit_pre: 2000,
    code_completion: "XXXXXX",
    code_noconsent: "YYYYYY",
    studytime: 4,
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
      // Consent,
      // Fullscreen,
      // GeneralInstructions,
      // FreeAssociationPre,
      Reading,
      FreeAssociationPost,
      QuestionnaireOpen,
      Complete,
    ],
    config
  );
  initialization.then(() => {
    Study.next();
  });
});
