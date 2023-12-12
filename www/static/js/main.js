require([
  "module/Study",
  "stage/Consent",
  "stage/FreeAssociationPre",
  "stage/GeneralInstructions",
  "stage/Welcome",
], function (Study, Consent, FreeAssociationPre, GeneralInstructions, Welcome) {
  let config = {
    default_button_timeout: 500,
    time_limit_pre: 180000,
  };
  let debug_config = {
    default_button_timeout: 0,
    time_limit_pre: 5000,
  };
  if (new URLSearchParams(window.location.search).get("mode") == "debug") {
    config = debug_config;
  }

  let initialization = Study.init(
    [
      Welcome,
      FreeAssociationPre,
      Consent,
      GeneralInstructions,
      FreeAssociationPre,
    ],
    config
  );
  initialization.then(() => {
    Study.next();
  });
});
