require([
  "module/Study",
  "stage/Consent",
  "stage/Complete",
  "stage/FreeAssociationPre",
  "stage/Fullscreen",
  "stage/GeneralInstructions",
  "stage/Welcome",
], function (
  Study,
  Consent,
  Complete,
  FreeAssociationPre,
  Fullscreen,
  GeneralInstructions,
  Welcome
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
      Study.next();
    });
  }

  let initialization = Study.init(
    [
      Welcome,
      Fullscreen,
      Consent,
      GeneralInstructions,
      FreeAssociationPre,
      Complete,
    ],
    config
  );
  initialization.then(() => {
    Study.next();
  });
});
