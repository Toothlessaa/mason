import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gradlePath = path.resolve(__dirname, "..", "android", "app", "build.gradle");
let gradle = readFileSync(gradlePath, "utf8");

const debugSigning = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;

const releaseSigning = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }`;

if (!gradle.includes(releaseSigning)) {
  if (!gradle.includes(debugSigning)) throw new Error("Gradle signingConfigs block not found");
  gradle = gradle.replace(debugSigning, releaseSigning);
}

const releaseStart = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;

const releaseStartSigned = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig project.hasProperty('MYAPP_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug`;

if (!gradle.includes(releaseStartSigned)) {
  if (!gradle.includes(releaseStart)) throw new Error("Release buildType not found");
  gradle = gradle.replace(releaseStart, releaseStartSigned);
}

writeFileSync(gradlePath, gradle);
console.log("Release signing config applied to", gradlePath);