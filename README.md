# Parallax

Parallax is a privacy-awareness dashboard that shows the signals available during an ordinary website visit. Explore browser and device capabilities, inspect the request metadata the server observes, and compare reports locally.

**[Open the live demo](https://parallax-samsdevforge.vercel.app/)** · [Run locally](#run-locally) · [Device mirror](#version-3--parallax-device-mirror) · [Interactive labs](#version-40--interactive-labs)

## What you can explore

- Browse browser, graphics, display, storage, and network signals alongside explanations and uncertainty.
- Try a representative 3D device mirror with manual controls or motion on a supported phone.
- Compare local reports or export JSON when you choose. The server reflects a limited set of ordinary request metadata and the host can retain infrastructure logs.
- Explore interactive labs for controllers, media, storage, and offline behavior. Optional motion authorization, storage writes, and IP enrichment start from explicit controls.

## Run locally

Use Node.js 20 or newer.

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). The project uses built-in Node modules. A loopback visit displays local network context.

## Deploy
The project includes a Vercel-compatible API function and configuration. Import this directory as a repository, select Other framework, use `public` as output directory and deploy. Vercel-provided IP and coarse geolocation headers are used only when running on Vercel. No external IP lookup service is contacted by default. The optional network enrichment sends the connection IP to ipapi.is only after the visitor explicitly allows it. The production deployment is live at https://parallax-samsdevforge.vercel.app and connected to the `main` branch. Vercel reports a successful build; physical device testing remains outstanding. HTTPS and browser support affect availability.

## Features and limitations
- 100+ probes covering browser, network, hardware, screen, settings, graphics/media, storage/performance and HTTP headers.
- Filterable raw signals, evidence-based inferences, aggregate live interaction demo, explicit JSON export.
- Unavailable data is shown as such; an observed `false` means a feature or preference is not reported as active. Unsupported CSS media queries may also return false.
- IP location is an estimate; CPU, memory and GPU are browser-reported hints. No identity or fingerprint uniqueness score. No stable fingerprint identifiers, font enumeration, WebRTC address probing, key content collection or cross-site tracking.
- The HTTP headers are those of the diagnostic API fetch, not necessarily those of the initial navigation.
- Export includes sensitive IP and device metadata; share it carefully. Review hosting provider logging and local privacy laws before public deployment.

## Reference documentation
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator
- https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/getHighEntropyValues
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Client_hints

## Version 2: the reveal
The opening headline selects an available device model, battery reading, IP city, graphics renderer, referring origin or timezone. The seven narrative sections separate device identity, location, hardware, display, regional settings, arrival/privacy and capabilities. The battery display updates if supported. IP postal code and IP timezone are Vercel-provided estimates. No GPS, identity enrichment, or persistent fingerprint is used.

## Expand Android model coverage
The included catalogue is deliberately small (CPH2717, CPH2719 and oriole). The full public Google Play device CSV could not be downloaded in the build environment. Download the list yourself from https://support.google.com/googleplay/answer/1727131 (direct CSV: https://storage.googleapis.com/play_public/supported_devices.csv). Review its terms before redistributing. Then run `python scripts/import_catalog.py supported_devices.csv` before deploying. This creates a static local mapping; visitor model codes are never sent to Google. Ambiguous code matches are displayed as candidates, never as a unique device.

Starter references: https://www.croma.com/-/p/316549 ; https://www.oneplus.com/content/dam/oneplus/2025/pstisoc/OnePlus_Nord_CE5_CPH2719_SoC.pdf ; https://support.google.com/googleplay/android-developer/answer/7353455

## Research references
- https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API
- https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info
- https://vercel.com/docs/headers/request-headers
- https://support.maxmind.com/knowledge-base/articles/maxmind-geolocation-accuracy
- https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer
- https://coveryourtracks.eff.org/about

## Verification
Node syntax checks and local HTTP endpoint checks passed. Chromium rendering with simulated model, network and battery inputs passed, including seven sections, search and mobile width checks (131 signal rows, no page errors). Live navigation to localhost was blocked by the test environment; actual mobile hardware and deployed Vercel geolocation are unverified. The preview is a simulated report, not a real visitor's data.

## Version 3 — Parallax Device Mirror
The overview now includes a procedural, three-dimensional device shell with opposing front/rear faces, rounded thickness, side buttons, camera layout, display cutout and a representative finish. It has 20 named device/family profiles and six generic profiles, including several recent flagship families. These are original illustrative geometry, not CAD-accurate OEM assets; the model list is not exhaustive. Physical colour, case and exact device configuration are not observable. An exposed Android model or an unambiguous catalogue name selects a matching profile; otherwise brand-family heuristics select a generic shape and clearly mark it as approximate. iPhone model selection is manual because Safari generally does not reveal an exact model. The model registry is in `public/mirror.js`.

On supported secure origins, the mirror listens for `deviceorientation` and applies the W3C intrinsic Z-X-Y rotation matrix, with the appropriate CSS axis conversion. The live view uses a fixed oblique camera. Alpha, beta and gamma values are displayed separately. Absolute heading is not guaranteed and the model does not estimate physical XYZ displacement. Browsers requiring explicit motion permission show an optional enable button; no request is made automatically. Desktop, unsupported and blocked browsers receive a labelled manual preview with sliders, drag and front/rear inspection. Motion values stay in transient memory, are not uploaded or exported, and are not saved across visits.

Reference sources for the representative models and rotation implementation:
- https://www.w3.org/TR/orientation-event/
- https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events/Using_device_orientation_with_3D_transforms
- https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static
- https://support.apple.com/en-in/125090
- https://news.samsung.com/us/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet/
- https://store.google.com/in/product/pixel_10_pro_specs?hl=en-IN
- https://www.oneplus.com/global/15/specs

### Version 3 verification
Node syntax checks passed. Chromium rendering tests using injected local assets and mocked browser/network data verified 26 model options, the manual rear view, synthetic motion events and angle updates, Nord CE5 matching, and no horizontal overflow at 390 px. No JavaScript page errors were reported in the desktop test. Normal browser navigation was blocked by the test environment. Real-phone sensor accuracy, production HTTPS permissions and all model variants remain unverified. Test on Android Chrome over HTTPS; Safari may require motion permission, which visitors can optionally grant using the enable button.

### Repository

Source repository: https://github.com/SamsDevForge/Parallax

Clone it with `git clone https://github.com/SamsDevForge/Parallax.git` and follow the local setup above.

### Version 3.1 — Live sensor recovery
Accept partial readings, listen for both standard and absolute orientation events, keep waiting for late readings, and use RelativeOrientationSensor only if sensor permissions are already granted. The optional enable button is available for browsers requiring explicit motion authorization. Camera, microphone and geolocation remain disabled. Physical device testing is still required.

### Version 3.2 — Automatic motion first
Live orientation always attempts passive sensor access on page load, including browsers that implement requestPermission. Existing grants and late readings are accepted automatically. Only after a passive probe returns no usable data does a browser with a motion permission API offer an optional authorization button. The native permission request is never made automatically; a visitor click is required by such browsers. No readings are transmitted or persisted.

## Version 4.0 — Interactive labs
Physical motion and environment, illustrative exploded anatomy and desktop/laptop profile, controller mirror, touch contact, keyboard-layout check, approximate IP map, optional ipapi.is lookup, bounded same-origin network tests, live event timeline, local report comparison (VPN/incognito/browser), canvas/audio samples, fixed-word storage, cross-tab pulse, opt-in pad-only replay, blocking check, bounded CPU/GPU/RAM and display/media tests, local toy classifier, scoped offline demo and evidence-based privacy defences. No device retail-price feature. Device anatomy is representative; model catalogue coverage remains limited. No stable fingerprint, key contents, full-page replay or personal identity profiling. Optional network enrichment is quota/provider dependent; browser sensor and gamepad support varies. Offline cache can be removed. All new motion data, pad replay and comparison samples remain client-side; comparison files are user-controlled. 

References: https://vercel.com/docs/headers/request-headers ; https://ipapi.is/developers.html ; https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API ; https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent/requestPermission_static .
