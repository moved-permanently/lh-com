# Sweep, standing order 29: TAP (ema-lufthansa, 2026-11-16)

Every recorded TAP page-width (tap-parity-001 to -014, the newest recording per page and width, a first load before a resized one: 52 on 26 pages; the homepages from tap-parity-014's scrolled first loads) as served on tap.turnsthe.page with today's deployed code (main at the sweep's start, about 02:20 UTC), against the recording's PNG and height: tools/parity/capture.js (our host only, every airline-host request refused per request; 1440 x 900 and 390 x 844) and tools/parity/compare.js. Measured with the measuring browser's own fonts and with Arial in Liberation Sans: TAP's pages draw no Arial, so both are the same to the pixel. Nothing had been measured on TAP since Friday (order 14; ema-cashub's order 32 regression sweep on Saturday). Height % = (ours - www) / www. At the finish line: finish-tap.txt. TAP's code is ema-cashub's (finish-tap.txt's header).

52 page-widths; 46 within 2 % with the face, 6 above.

| # | page | width | recording | www px | ours px | ours vs www | with the face px | with the face vs www | pixels differing | at the finish line |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | /en-pt/information/baggage | 1440 | tap-parity-002 | 2528 | 2077 | -17.84 % | 2077 | -17.84 % | 0.05 | HOLD -17.84 % |
| 2 | /en-pt/information/baggage/locate-baggage | 390 | tap-parity-008 | 2148 | 1771 | -17.55 % | 1771 | -17.55 % | 0.1659 | HOLD -17.55 % |
| 3 | /en-pt/information/baggage/locate-baggage | 1440 | tap-parity-008 | 1839 | 1557 | -15.33 % | 1557 | -15.33 % | 0.0938 | HOLD -15.33 % |
| 4 | /en-pt/information/baggage | 390 | tap-parity-002 | 3274 | 2913 | -11.03 % | 2913 | -11.03 % | 0.0791 | HOLD -11.03 % |
| 5 | /pt-pt/a-bordo/voar-economica | 1440 | tap-parity-001 | 3892 | 4027 | +3.47 % | 4027 | +3.47 % | 0.0946 | within 2 % |
| 6 | /pt-pt/miles-and-go/promocoes/navigator-experiences | 390 | tap-parity-011 | 3931 | 4013 | +2.09 % | 4013 | +2.09 % | 0.2261 | HOLD +2.09 % |
| 7 | /en-pt | 1440 | tap-parity-014 | 4041 | 3977 | -1.58 % | 3977 | -1.58 % | 0.2807 | HOLD -13.94 % |
| 8 | /pt-pt | 1440 | tap-parity-014 | 4041 | 3977 | -1.58 % | 3977 | -1.58 % | 0.2803 | HOLD -13.94 % |
| 9 | /en-pt/on-board/fly-business | 1440 | tap-parity-002 | 4942 | 5019 | +1.56 % | 5019 | +1.56 % | 0.1442 | within 2 % |
| 10 | /en-pt/miles-and-go/earn-miles/by-flying | 1440 | tap-parity-009 | 2791 | 2827 | +1.29 % | 2827 | +1.29 % | 0.0559 | within 2 % |
| 11 | /en-pt/stopover/partners | 1440 | tap-parity-009 | 2903 | 2866 | -1.27 % | 2866 | -1.27 % | 0.1348 | within 2 % |
| 12 | /pt-pt/gerir-reserva/extras/upgrades/leiloes | 1440 | tap-parity-001 | 2649 | 2682 | +1.25 % | 2682 | +1.25 % | 0.0747 | within 2 % |
| 13 | /en-pt/bookings/tap-fares | 390 | tap-parity-008 | 3326 | 3366 | +1.20 % | 3366 | +1.20 % | 0.1188 | within 2 % |
| 14 | /pt-pt/informacoes/bagagem/bagagem-mao | 390 | tap-parity-001 | 8458 | 8548 | +1.06 % | 8548 | +1.06 % | 0.1659 | within 2 % |
| 15 | /en-pt/help | 390 | tap-parity-008 | 6407 | 6342 | -1.01 % | 6342 | -1.01 % | 0.088 | within 2 % |
| 16 | /en-pt/information/special-needs/wheelchair | 390 | tap-parity-009 | 4946 | 4993 | +0.95 % | 4993 | +0.95 % | 0.139 | within 2 % |
| 17 | /en-pt/on-board/economy-prime | 390 | tap-parity-008 | 8055 | 8129 | +0.92 % | 8129 | +0.92 % | 0.1756 | within 2 % |
| 18 | /en-pt/on-board/fly-business | 390 | tap-parity-002 | 8224 | 8297 | +0.89 % | 8297 | +0.89 % | 0.2394 | within 2 % |
| 19 | /en-pt/information/documentation/schengen-visas | 390 | tap-parity-007 | 6483 | 6533 | +0.77 % | 6533 | +0.77 % | 0.1245 | within 2 % |
| 20 | /pt-pt/reservas/time-to-think | 390 | tap-parity-001 | 3032 | 3055 | +0.76 % | 3055 | +0.76 % | 0.0984 | within 2 % |
| 21 | /en-pt/manage-booking/extras/lounges | 1440 | tap-parity-007 | 5152 | 5189 | +0.72 % | 5189 | +0.72 % | 0.0757 | within 2 % |
| 22 | /en-pt/destinations/get-inspired | 390 | tap-parity-010 | 5008 | 4976 | -0.64 % | 4976 | -0.64 % | 0.1973 | within 2 % |
| 23 | /en-pt/help/frequently-asked-questions | 390 | tap-parity-002 | 2349 | 2364 | +0.64 % | 2364 | +0.64 % | 0.0837 | within 2 % |
| 24 | /pt-pt/destinos/inspire-se | 390 | tap-parity-010 | 5112 | 5140 | +0.55 % | 5140 | +0.55 % | 0.1755 | within 2 % |
| 25 | /en-pt/on-board/economy-prime | 1440 | tap-parity-008 | 7167 | 7204 | +0.52 % | 7204 | +0.52 % | 0.0647 | within 2 % |
| 26 | /pt-pt/informacoes/bagagem/bagagem-mao | 1440 | tap-parity-001 | 4918 | 4893 | -0.51 % | 4893 | -0.51 % | 0.0744 | within 2 % |
| 27 | /pt-pt/reservas/time-to-think | 1440 | tap-parity-001 | 2209 | 2220 | +0.50 % | 2220 | +0.50 % | 0.0495 | within 2 % |
| 28 | /pt-pt/destinos/inspire-se | 1440 | tap-parity-010 | 5662 | 5690 | +0.49 % | 5690 | +0.49 % | 0.1521 | within 2 % |
| 29 | /pt-pt/gerir-reserva/extras/upgrades/leiloes | 390 | tap-parity-001 | 3352 | 3336 | -0.48 % | 3336 | -0.48 % | 0.0988 | within 2 % |
| 30 | /en-pt/help | 1440 | tap-parity-008 | 3661 | 3644 | -0.46 % | 3644 | -0.46 % | 0.0453 | within 2 % |
| 31 | /pt-pt/a-bordo/voar-economica | 390 | tap-parity-001 | 5654 | 5680 | +0.46 % | 5680 | +0.46 % | 0.1205 | within 2 % |
| 32 | /en-pt | 390 | tap-parity-014 | 5099 | 5076 | -0.45 % | 5076 | -0.45 % | 0.2175 | within 2 % |
| 33 | /en-pt/information/special-needs/wheelchair | 1440 | tap-parity-009 | 3555 | 3539 | -0.45 % | 3539 | -0.45 % | 0.066 | within 2 % |
| 34 | /en-pt/information/baggage/hold-baggage | 1440 | tap-parity-009 | 4936 | 4916 | -0.41 % | 4916 | -0.41 % | 0.0755 | within 2 % |
| 35 | /pt-br/miles-and-go/utilizar-milhas/doacao-milhas | 390 | tap-parity-007 | 4817 | 4800 | -0.35 % | 4800 | -0.35 % | 0.1323 | within 2 % |
| 36 | /en-pt/miles-and-go | 1440 | tap-parity-010 | 3770 | 3783 | +0.34 % | 3783 | +0.34 % | 0.1472 | within 2 % |
| 37 | /en-pt/destinations/get-inspired | 1440 | tap-parity-010 | 5582 | 5565 | -0.30 % | 5565 | -0.30 % | 0.1357 | within 2 % |
| 38 | /en-pt/information/documentation/schengen-visas | 1440 | tap-parity-007 | 4272 | 4282 | +0.23 % | 4282 | +0.23 % | 0.0565 | within 2 % |
| 39 | /en-pt/miles-and-go/use-miles/fees | 1440 | tap-parity-009 | 4553 | 4563 | +0.22 % | 4563 | +0.22 % | 0.0476 | within 2 % |
| 40 | /pt-pt | 390 | tap-parity-014 | 5192 | 5202 | +0.19 % | 5202 | +0.19 % | 0.1999 | within 2 % |
| 41 | /pt-br/miles-and-go/ganhe-milhas/cartoes-de-credito | 1440 | tap-parity-007 | 1590 | 1593 | +0.19 % | 1593 | +0.19 % | 0.0427 | within 2 % |
| 42 | /en-pt/miles-and-go | 390 | tap-parity-010 | 4822 | 4831 | +0.19 % | 4831 | +0.19 % | 0.1911 | within 2 % |
| 43 | /en-pt/miles-and-go/use-miles/fees | 390 | tap-parity-009 | 4703 | 4711 | +0.17 % | 4711 | +0.17 % | 0.1061 | within 2 % |
| 44 | /en-pt/manage-booking/extras/lounges | 390 | tap-parity-007 | 6700 | 6689 | -0.16 % | 6689 | -0.16 % | 0.1366 | within 2 % |
| 45 | /pt-pt/miles-and-go/promocoes/navigator-experiences | 1440 | tap-parity-011 | 4389 | 4395 | +0.14 % | 4395 | +0.14 % | 0.115 | within 2 % |
| 46 | /pt-br/miles-and-go/utilizar-milhas/doacao-milhas | 1440 | tap-parity-007 | 5326 | 5320 | -0.11 % | 5320 | -0.11 % | 0.0916 | within 2 % |
| 47 | /pt-br/miles-and-go/ganhe-milhas/cartoes-de-credito | 390 | tap-parity-007 | 1801 | 1803 | +0.11 % | 1803 | +0.11 % | 0.0994 | within 2 % |
| 48 | /en-pt/miles-and-go/earn-miles/by-flying | 390 | tap-parity-009 | 3838 | 3842 | +0.10 % | 3842 | +0.10 % | 0.0931 | within 2 % |
| 49 | /en-pt/stopover/partners | 390 | tap-parity-009 | 3564 | 3566 | +0.06 % | 3566 | +0.06 % | 0.0868 | within 2 % |
| 50 | /en-pt/help/frequently-asked-questions | 1440 | tap-parity-002 | 2009 | 2008 | -0.05 % | 2008 | -0.05 % | 0.0319 | within 2 % |
| 51 | /en-pt/information/baggage/hold-baggage | 390 | tap-parity-009 | 6445 | 6448 | +0.05 % | 6448 | +0.05 % | 0.1295 | within 2 % |
| 52 | /en-pt/bookings/tap-fares | 1440 | tap-parity-008 | 3088 | 3089 | +0.03 % | 3089 | +0.03 % | 0.0319 | within 2 % |

## The worst ten

None is a code or document fix. Each one is TAP's own service, the live state of the page, an owner decision, or within
2 % with no fix needed.

1. **/en-pt/information/baggage 1440, -17.84 %:** www's baggage tracker, a form on TAP's own service (row 145). Our
   page has its title, its line and the button to the tracker. Live service, an owner decision (ema-cashub, order 31:
   confirmed).
2. **/en-pt/information/baggage/locate-baggage 390, -17.55 %:** the same tracker.
3. **/en-pt/information/baggage/locate-baggage 1440, -15.33 %:** the same tracker.
4. **/en-pt/information/baggage 390, -11.03 %:** the same tracker.
5. **/pt-pt/a-bordo/voar-economica 1440, +3.47 %** (within 2 % on Friday).
   - Located: +131 px in the call-back card "Voe na área Comfort".
   - Tonight the card is in its out-of-hours state: a day and time picker and "Agendar contacto", because TAP's hours
     are 9:00 to 24:00 Lisbon time and the sweep ran at about 02:30. www was recorded within those hours: a phone field
     and "Ligue-me".
   - Live state by design (TAP row 157; ema-cashub's order 32 found the same on Saturday). No fix.
   - lounges 1440 (+0.72 %) carries the same card.
6. **/pt-pt/miles-and-go/promocoes/navigator-experiences 390, +2.09 %:** the phone slider's 16 px card margin. Excepted:
   the only rule that passed keys on content, not layout. An owner decision (ema-cashub, order 31).
7. **/en-pt 1440, -1.58 %:** within 2 % against www's settled, scrolled height (tap-parity-014; the pin-spacer, brief
   483). No fix.
8. **/pt-pt 1440, -1.58 %:** the same.
9. **/en-pt/on-board/fly-business 1440, +1.56 %:** within 2 %. No fix.
10. **/en-pt/miles-and-go/earn-miles/by-flying 1440, +1.29 %:** within 2 %. No fix.

**The figures:**
- The homepages now rank against tap-parity-014's scrolled first loads. Against -010 / -011's unscrolled ones, finish-tap
  had -13.94 %.
- Every other row measures as on Friday, apart from voar-economica's clock state.
- TAP's pages ask no airline host, so tonight's per-request refusal changes nothing there.
