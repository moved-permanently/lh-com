# GraphQL feeds: lh-edge vs www (local documents)

2026-10-26T02:00:59.975Z

52/52 recorded URLs equal apart from the deliberate differences; 1 skipped.

Deliberate (normalized in www's answers before comparing): _tags as a set 361, rich text compared by text and links 430, trailing whitespace of texts 42, www data errors fixed 11, empty properties [] as null 0, jcr:created not compared 67; last-modified not compared.

| URL | status www / lh-edge | cache-control | equal | differences (first) |
|---|---|---|---|---|
| /graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList;airline=LH | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList;airline=LX | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList;airline=OS | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Ancillary-on-TMC/get-ancillaries-catalogs | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Ancillary-on-TMC/tmc-translations-v2 | 404 / 404 | public, max-age=120 | yes |  |
| /graphql/execute.json/Ancillary-on-TMC/tmc-translations;path=/content/dam/lufthansa-group/ancillary/tmc/tmc-web-translations/tmc-translations;variation=master | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/B2BNeo/getAllFooterLogos | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/B2BNeo/getFeatureFlag | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/B2BNeo/getFreeFlightConfig | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/BenefitCard/BenefitItemsList | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/BenefitCard/BenefitItemsList;langPath=/content/dam/lufthansa-group/ancillary/upgrade/benefitcard/benefititems/de | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/BenefitCard/BenefitItemsList;langPath=/content/dam/lufthansa-group/ancillary/upgrade/benefitcard/benefititems/de;airline=OS | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/BenefitCard/BenefitItemsList;langPath=/content/dam/lufthansa-group/ancillary/upgrade/benefitcard/benefititems/en | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/BenefitCard/BenefitItemsList;langPath=/content/dam/lufthansa-group/ancillary/upgrade/benefitcard/benefititems/en;airline=LH | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Orchestrator-Services/SDUI-Service-List | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationByPathAndVariation | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationByPathAndVariation;path=/content/dam/content-fragments/travelready-infohub/za;variation=de | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/ca;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/cn;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/ec;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/gb;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/il;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/in;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/jp;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/ke;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/mv;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/my;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/na;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/ng;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/th;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/tn;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/us;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationsByPath;path=/content/dam/content-fragments/travelready-infohub/za;includedVariations=true | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/getItemByID | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/getItemByID;id=/content/dam/lufthansa-group/mobileapp/whats-new/en/finding-your-next-flight-jus | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/getStartPopupEarlyAccess;locale=en;client=mobile-app:android;tenant=mobile-app:lh;to=2026-10-25T20%3A00%3A00.000%2B01%3A00 | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/getStartPopupNonEarlyAccess | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/getStartPopupNonEarlyAccess;locale=en;client=mobile-app:ios;tenant=mobile-app:lh;to=2026-10-25T20%3A00%3A00.000%2B01%3A00 | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/whatsNewListEarlyAccess;locale=en;client=mobile-app:android;tenant=mobile-app:lh | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/whatsNewListNonEarlyAccess;locale=en;client=mobile-app:android;tenant=mobile-app:lh | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/whatsNewListNonEarlyAccess;locale=en;client=mobile-app:android;tenant=mobile-app:lx | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/whatsnewList | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/whatsnewList;locale=de;client=mobile-app:ios;tenant=mobile-app:lh | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/whatsnewList;locale=en;client=mobile-app:android;tenant=mobile-app:lh | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/mobileapp/whatsnewList;locale=en;limit=5;client=mobile-app:ios;tenant=mobile-app:lx | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Travel-Regulations/TravelRegulationList | 500 / 500 | - | yes |  |
| /graphql/execute.json/BenefitCard/benefitcardimageList | 500 / 500 | - | yes |  |
| /graphql/execute.json/B2BNeo/getLoginConfig | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/B2BNeo/getLoginConfigByPath | 200 / 200 | public, max-age=120 | yes |  |
| /graphql/execute.json/Message-Center/noSuchQuery | | | skipped | Message-Center: the messages Worker (lh-messages) |
| /graphql/execute.json/NoSuchConfig/noSuchQuery | 404 / 404 | public, max-age=120 | yes |  |
