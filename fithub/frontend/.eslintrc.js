module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    // 자주 사용되는 규칙들
    'react/react-in-jsx-scope': 'off', // React 17 이상에서는 import React 생략 가능
    'react/prop-types': 'off', // prop-types 검사 비활성화
    'no-unused-vars': 'warn', // 사용하지 않는 변수는 경고만 표시
    'no-console': 'warn', // console.log 사용 시 경고
  },
  settings: {
    react: {
      version: 'detect', // 설치된 React 버전 자동 감지
    },
  },
}; 