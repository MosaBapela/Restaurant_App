# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Local payment stub (development)

This project includes a small serverless payment stub used for local development and testing. The client uses this stub when `EXPO_PUBLIC_PAYMENT_MODE` is set to `stub` (the default in this repo).

Quick start:

1. From the repo root, start the stub:

```powershell
node ./serverless/payment_stub/index.js
```

Or use the convenient npm script:

```powershell
npm run start:stub
```

2. The stub listens on `http://localhost:4242` by default and exposes:

- `GET /health` - basic health check (returns `{ ok: true }`)
- `POST /pay` - simulate a payment. Requires header `x-api-key: dev_stub_key` by default.

Environment variables:

- `PORT` - change listening port (defaults to `4242`)
- `PAYMENT_STUB_KEY` - API key expected in `x-api-key` header (defaults to `dev_stub_key`)

Note: The stub is only intended for local development and testing. For production use, integrate with a secure payment provider and never send raw card details from an untrusted client.
