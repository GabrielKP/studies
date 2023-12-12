require([
  "module/Study",
  "stage/Consent",
  "stage/FreeAssociationPre",
  "stage/GeneralInstructions",
  "stage/Welcome",
], function (Study, Consent, FreeAssociationPre, GeneralInstructions, Welcome) {
  config = {
    default_button_timeout: 500,
    time_limit_pre: 1000,
  };
  initialization = Study.init(
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
