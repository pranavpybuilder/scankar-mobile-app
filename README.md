# SCANकर

Offline-first mobile app for scanning handwritten machine-reading sheets with strict table-structure preservation.

## Status

- Module 1 complete: app foundation, navigation, editable extracted table, export flow
- Module 2 complete: real camera capture, crop/rotate/perspective UI, preprocessing options wired into OCR pipeline
- Module 3 complete: deterministic table-grid detector + OpenCV bridge hooks for native preprocessing/grid detection
- Module 4 in progress: TFLite runtime integration with bundled model descriptors + runtime/fallback orchestration
- Runtime dependency note: native TF/OpenCV bridges can be wired incrementally while keeping JS fallbacks functional.

## What Is Working Now

- `CameraScreen`: real capture with `react-native-vision-camera` + gallery import
- `ImagePreviewScreen`: crop (native cropper), rotate, perspective corner editing
- `ProcessingScreen` -> `OCRPipeline` -> `OpenCVService`: user edits are passed as preprocessing options
- Existing editable extraction flow remains:
  - edit cell/header
  - add row
  - add column (manual data entry)
  - export JSON/CSV and exporter stubs for XLSX/PDF/DOCX

## Run Locally

### 1) Install dependencies

```bash
npm install
```

### 2) Ensure native projects exist

If your `android/` and `ios/` folders only contain `.gitkeep`, bootstrap a React Native shell first:

```bash
npx @react-native-community/cli@latest init SCANkarNative --version 0.72.6
```

Then copy `android/` and `ios/` from `SCANkarNative` into this repository root.

PowerShell helper script is also included:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-native-shell.ps1
```

### 3) Configure native permissions

- Android (`android/app/src/main/AndroidManifest.xml`): camera + storage/photo permissions
- iOS (`ios/<App>/Info.plist`): `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription`

### 4) Run app

```bash
npm run android
# or
npm run ios
```

If Android run fails with `adb is not recognized`, add Android SDK `platform-tools` to your PATH and start an emulator (or connect a real device).

## Module Plan

1. Module 1: foundation + editable table flow
2. Module 2: camera capture + editing + preprocessing integration
3. Module 3: real OpenCV preprocessing + deterministic table grid detection
4. Module 4: TFLite runtime integration with bundled models
5. Module 5: validation hardening, performance tuning, release readiness

## UI And Icon Timing

- UI polish pass (visual redesign and interaction refinement) starts right after Module 4 runtime wiring is stable.
- App icon design/export starts in the same UI pass, then final app-icon replacement is done before release build packaging.

## When To Train Models

Do not train yet.

Start training after Module 3 is stable (preprocessing output and table-grid extraction frozen), then train on Google Colab unless you have a local GPU workflow that is faster and reproducible.
