# Header and footer JSON, login link: lh-edge vs www (https://lhedge.bbird.live)

2026-10-26T14:58:09.370Z

13/17 equal (login answers apart from state).

| kind | URL | differences |
|---|---|---|
| owa | `/content/lh/markets/de/en/homepage.csi-owa-header.json` | /dcep-header-flyout/accessibilityUrl: "/de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs" / ""; /dcep-header-flyout/accessibilityTextLabel: "Accessible travel" / ""; /dcep-header-flyout/supportUrl: "/de/en/support/help" / ""; /dcep-header-flyout/supportTextLabel: "Help & contact" / "" |
| owa | `/content/lh/markets/de/en/homepage.csi-owa-footer.json` | equal |
| owa | `/content/lh/markets/de/en/homepage.csi-owa-portal-config.json` | equal |
| owa | `/content/lh/markets/de/de/homepage.csi-owa-header.json` | /dcep-header-flyout/accessibilityUrl: "/de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs" / ""; /dcep-header-flyout/accessibilityTextLabel: "Barrierefrei reisen" / ""; /dcep-header-flyout/supportUrl: "/de/de/support/help" / ""; /dcep-header-flyout/supportTextLabel: "Hilfe & Kontakt" / "" |
| owa | `/content/lh/markets/de/de/homepage.csi-owa-footer.json` | equal |
| owa | `/content/lh/markets/de/de/homepage.csi-owa-portal-config.json` | equal |
| owa | `/content/lh/markets/at/de/homepage.csi-owa-header.json` | /dcep-header-flyout/accessibilityUrl: "/at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs" / ""; /dcep-header-flyout/accessibilityTextLabel: "Barrierefrei reisen" / ""; /dcep-header-flyout/supportUrl: "/at/de/support/help" / ""; /dcep-header-flyout/supportTextLabel: "Hilfe & Kontakt" / "" |
| owa | `/content/lh/markets/at/de/homepage.csi-owa-footer.json` | equal |
| owa | `/content/lh/markets/at/de/homepage.csi-owa-portal-config.json` | equal |
| owa | `/content/lh/markets/gb/en/homepage.csi-owa-header.json` | /dcep-header-flyout/accessibilityUrl: "/gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs" / ""; /dcep-header-flyout/accessibilityTextLabel: "Accessible travel" / ""; /dcep-header-flyout/supportUrl: "/gb/en/support/help" / ""; /dcep-header-flyout/supportTextLabel: "Help & contact" / "" |
| owa | `/content/lh/markets/gb/en/homepage.csi-owa-footer.json` | equal |
| owa | `/content/lh/markets/gb/en/homepage.csi-owa-portal-config.json` | equal |
| login | `/service/secured/api/core/authenticate/loginPageUrl?state=%2Fde%2Fen%2Fhomepage (DE/en)` | equal |
| login | `/service/secured/api/core/authenticate/loginPageUrl?state=%2Fde%2Fde%2Fhomepage (DE/de)` | equal |
| login | `/service/secured/api/core/authenticate/loginPageUrl?state=%2Fat%2Fde%2Fhomepage (AT/de)` | equal |
| login | `/service/secured/api/core/authenticate/loginPageUrl?state=%2Fgb%2Fen%2Fhomepage (GB/en)` | equal |
| vanity | `/de/en/homepage.csi-owa-header.json` | equal |
