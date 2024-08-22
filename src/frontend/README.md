# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Execution the Application

To execute the application, follow these steps:

1. **Install Node.js:** Ensure you have Node.js installed on your computer. You can download and install it from [the official Node.js website](https://nodejs.org/).

2. **Install Dependencies:** Open your terminal, navigate to the project directory, and run the following command to install project dependencies:

   ```sh
   npm install
   ```

This will install all the necessary dependencies specified in the package.json file.

3. **Run the Development Server:** After installing the dependencies, you can start the development server by running the following command:

```
npm run dev
```

This will start the Vite development server, and you should see a message indicating that the server is running. You can access the application in your browser at the provided URL (usually http://localhost:5173).

4. **Development:** You can now make changes to your React components, and the development server will automatically reload the changes in the browser thanks to HMR (Hot Module Replacement). This allows for a smooth development experience with real-time updates.
